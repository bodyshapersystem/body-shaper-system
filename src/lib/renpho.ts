import "server-only";
import { createCipheriv, createDecipheriv } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * RENPHO Health auto-sync.
 *
 * RENPHO has no official public API. This talks to the same cloud API the
 * RENPHO Health app uses (cloud.renpho.com — AES-128-ECB encrypted JSON),
 * as documented by the open-source community clients (renpho-api,
 * RenphoGarminSync-CLI). If RENPHO changes their app, sync can stop until
 * this file is updated — manual "Record RENPHO scan" always keeps working.
 *
 * The studio uses ONE RENPHO account with one profile ("user") per client.
 * A client is linked to a profile in the Hub (Client.renphoUserId); the
 * cron then imports every new scan for that profile as a Measurement,
 * de-duplicated by Measurement.externalId.
 *
 * Credentials live only in env vars: RENPHO_EMAIL, RENPHO_PASSWORD.
 */

const BASE = "https://cloud.renpho.com";
const KEY = Buffer.from("ed*wijdi$h6fe3ew", "utf8");
const APP_VERSION = "6.6.0";
const PLATFORM = "android";
const SCALE_TYPES = ["01","02","03","04","05","06","07","08","09","0A","0B","0C","0D","0E","0F","10","11","12","13","14"];
const OK_CODES = new Set(["0", "101", "200", "20000"]);

function enc(obj: unknown): { encryptData: string } {
  const c = createCipheriv("aes-128-ecb", KEY, null);
  return { encryptData: Buffer.concat([c.update(JSON.stringify(obj), "utf8"), c.final()]).toString("base64") };
}
/** RENPHO user ids exceed 2^53 — quote long integers before JSON.parse so they keep full precision. */
function parseBig(text: string) {
  return JSON.parse(text.replace(/([:\[,]\s*)(-?\d{16,})(?=\s*[,\]}])/g, '$1"$2"'));
}
function dec(b64: string) {
  const d = createDecipheriv("aes-128-ecb", KEY, null);
  return parseBig(Buffer.concat([d.update(Buffer.from(b64, "base64")), d.final()]).toString("utf8"));
}

export class RenphoError extends Error {}

type Session = { token: string; userId: string };

async function post(path: string, body: unknown, s?: Session) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (s) Object.assign(headers, { token: s.token, userId: s.userId, appVersion: APP_VERSION, platform: PLATFORM });
  const res = await fetch(`${BASE}/${path}`, { method: "POST", headers, body: JSON.stringify(body), cache: "no-store" });
  if (!res.ok) throw new RenphoError(`RENPHO ${path} HTTP ${res.status}`);
  const json = parseBig(await res.text());
  const code = String(json.code ?? "");
  if (!(OK_CODES.has(code) || String(json.msg ?? "").toLowerCase() === "success")) {
    throw new RenphoError(`RENPHO ${path}: ${json.msg || code}`);
  }
  return json.data ? dec(json.data) : null;
}

export function renphoConfigured() {
  return Boolean(process.env.RENPHO_EMAIL && process.env.RENPHO_PASSWORD);
}

export async function renphoLogin(): Promise<Session & { name?: string }> {
  if (!renphoConfigured()) throw new RenphoError("RENPHO_EMAIL / RENPHO_PASSWORD are not set in Vercel.");
  const data = await post("renpho-aggregation/user/login", enc({
    questionnaire: {},
    login: { password: process.env.RENPHO_PASSWORD, areaCode: "US", appRevision: APP_VERSION, cellphoneType: "BodyShaperHub", systemType: "11", email: process.env.RENPHO_EMAIL, platform: PLATFORM },
    bindingList: { deviceTypes: SCALE_TYPES },
  }));
  const login = data?.login ?? {};
  if (!login.token) throw new RenphoError("RENPHO login failed — check the email and password.");
  return { token: String(login.token), userId: String(login.id), name: login.accountName || login.nickName || login.name };
}

export type RenphoProfile = { id: string; name: string };

function records(page: unknown): Record<string, unknown>[] {
  if (Array.isArray(page)) return page as Record<string, unknown>[];
  if (page && typeof page === "object") {
    for (const k of ["list", "records", "rows", "data", "items", "familyMemberList", "userList"]) {
      const v = (page as Record<string, unknown>)[k];
      if (Array.isArray(v)) return v as Record<string, unknown>[];
    }
  }
  return [];
}

/** Every profile ("user") in the studio's RENPHO account, including the main one. */
export async function listRenphoProfiles(s?: Session): Promise<RenphoProfile[]> {
  const session = s ?? (await renphoLogin());
  const out = new Map<string, string>();
  out.set(session.userId, (session as { name?: string }).name || "account owner");
  for (const body of [enc({}), enc({ userId: session.userId })]) {
    try {
      const data = await post("RenphoHealth/centerUser/queryFamilyMemberList", body, session);
      for (const r of records(data)) {
        const id = String(r.userId ?? r.id ?? r.subUserId ?? "");
        if (!id) continue;
        const name = String(r.nickName ?? r.nickname ?? r.name ?? r.userName ?? r.accountName ?? id);
        out.set(id, name);
      }
      break;
    } catch { /* try next body shape */ }
  }
  try {
    const dev = await post("renpho-aggregation/device/count", enc({}), session);
    for (const sc of (dev?.scale ?? []) as { userIds?: unknown[] }[]) for (const u of sc.userIds ?? []) if (!out.has(String(u))) out.set(String(u), String(u));
  } catch { /* optional */ }
  return [...out].map(([id, name]) => ({ id, name }));
}

async function page(s: Session, endpoint: string, table: string, uid: string, pageNum: number, pageSize: number) {
  return records(await post(endpoint, enc({ pageNum, pageSize, userIds: [uid], tableName: table }), s));
}
const BC = "RenphoHealth/scale/queryBodyCompositionMeasureData";
const BASIC = "RenphoHealth/scale/queryAllMeasureDataList";

/** Measurements are sharded in measurements_info_<userId % 24>; probe that first, then the rest. */
async function findTable(s: Session, uid: string): Promise<string | null> {
  const shard = Number(BigInt(uid) % BigInt(24));
  const order = [shard, ...Array.from({ length: 24 }, (_, i) => i).filter((i) => i !== shard)];
  for (const i of order) {
    const t = `measurements_info_${i}`;
    for (const ep of [BC, BASIC]) {
      try { if ((await page(s, ep, t, uid, 1, 1)).length) return t; } catch { /* next */ }
    }
  }
  return null;
}

async function allScans(s: Session, table: string, uid: string) {
  const out: Record<string, unknown>[] = [];
  for (const ep of [BC, BASIC]) {
    for (let p = 1; p <= 40; p++) {
      let rows: Record<string, unknown>[] = [];
      try { rows = await page(s, ep, table, uid, p, 50); } catch { break; }
      out.push(...rows);
      if (rows.length < 50) break;
    }
    if (out.length) break;
  }
  return out;
}

const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) && x !== 0 ? x : null; };
const round = (x: number | null, d = 1) => (x == null ? null : Math.round(x * 10 ** d) / 10 ** d);
/** The RENPHO Health API reports muscle and bone as a % of body weight (per the community API docs); store kg like the app shows. */
function massKg(v: unknown, weight: number | null) {
  const x = n(v); if (x == null) return null;
  return weight ? round((x / 100) * weight) : null;
}

function toMeasurement(r: Record<string, unknown>) {
  const ts = Number(r.timeStamp ?? r.timestamp ?? r.measureTime ?? r.createTime ?? 0);
  const scanDate = new Date(ts > 1e12 ? ts : ts * 1000);
  const weight = round(n(r.weight));
  return {
    scanDate,
    weightKg: weight,
    bmi: round(n(r.bmi)),
    bodyFatPercent: round(n(r.bodyfat ?? r.bodyFat)),
    bodyWaterPercent: round(n(r.water)),
    muscleMassKg: massKg(r.muscle, weight),
    skeletalMuscleKg: round(n(r.skeletalMuscle ?? r.skeletal ?? r.sinewMass)),
    boneMassKg: massKg(r.bone, weight),
    proteinPercent: round(n(r.protein)),
    visceralFat: round(n(r.visfat ?? r.visceralFat)),
    subcutaneousFatPercent: round(n(r.subfat ?? r.subcutaneousFat)),
    bmr: n(r.bmr) != null ? Math.round(n(r.bmr)!) : null,
    bodyAge: n(r.bodyage ?? r.bodyAge) != null ? Math.round(n(r.bodyage ?? r.bodyAge)!) : null,
    fatFreeWeightKg: round(n(r.fatFreeWeight)),
    whr: round(n(r.whr ?? r.whrValue), 2),
    smi: round(n(r.smi), 2),
  };
}

/** Imports every scan for one linked client that isn't in the Hub yet. Returns how many were added. */
export async function syncClientRenpho(clientId: string, s?: Session): Promise<{ added: number }> {
  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true, renphoUserId: true, renphoTable: true } });
  if (!client?.renphoUserId) return { added: 0 };
  const session = s ?? (await renphoLogin());
  const table = client.renphoTable || (await findTable(session, client.renphoUserId));
  if (!table) {
    await prisma.client.update({ where: { id: clientId }, data: { renphoSyncedAt: new Date() } });
    return { added: 0 };
  }
  const rows = await allScans(session, table, client.renphoUserId);
  const active = await prisma.blueprintAssessment.findFirst({ where: { clientId }, orderBy: { createdAt: "desc" }, select: { id: true } });
  let added = 0;
  for (const r of rows) {
    const rid = String(r.id ?? r.measureId ?? r.timeStamp ?? "");
    if (!rid) continue;
    const m = toMeasurement(r);
    if (!m.weightKg && !m.bodyFatPercent) continue;
    const externalId = `renpho:${table}:${rid}`;
    const exists = await prisma.measurement.findUnique({ where: { externalId }, select: { id: true } });
    if (exists) continue;
    await prisma.measurement.create({
      data: { clientId, assessmentId: active?.id ?? null, ...m, deviceSource: "RENPHO Health · auto-sync", externalId, externalRaw: r as Prisma.InputJsonValue },
    });
    added++;
  }
  await prisma.client.update({ where: { id: clientId }, data: { renphoTable: table, renphoSyncedAt: new Date() } });
  return { added };
}

export async function syncAllRenpho() {
  const clients = await prisma.client.findMany({ where: { renphoUserId: { not: null } }, select: { id: true } });
  if (!clients.length) return { clients: 0, added: 0 };
  const session = await renphoLogin();
  let added = 0;
  for (const c of clients) {
    try { added += (await syncClientRenpho(c.id, session)).added; } catch (e) { console.error("renpho sync", c.id, e); }
  }
  return { clients: clients.length, added };
}
