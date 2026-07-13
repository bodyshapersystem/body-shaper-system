import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";
import InviteMemberSheet from "./InviteMemberSheet";
import MemberDetailPanel from "./MemberDetailPanel";
import { getUserAvatarUrl } from "../settings/actions";

export const dynamic = "force-dynamic";

export default async function HubTeamPage({ searchParams }: { searchParams: Promise<{ memberId?: string }> }) {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");

  const isOwner = user.role.id === "role_owner";
  const { memberId } = await searchParams;

  const teamMembers = await prisma.user.findMany({
    where: { roleId: { not: "role_client" } },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  const activeCount = teamMembers.filter((m) => m.status === "ACTIVE").length;
  const pendingInvites = teamMembers.filter((m) => m.status === "INVITED").length;
  const distinctRoles = new Set(teamMembers.map((m) => m.role.name)).size;

  const selected = teamMembers.find((m) => m.id === memberId) ?? teamMembers[0];

  const avatarUrls = Object.fromEntries(
    await Promise.all(
      teamMembers
        .filter((m) => m.avatarStoragePath)
        .map(async (m) => [m.id, await getUserAvatarUrl(m.avatarStoragePath!)] as const)
    )
  );

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>teams.</h1>
          <p className="dash-subtitle">Manage your team members and permissions.</p>
        </div>
        {isOwner && <InviteMemberSheet />}
      </div>

      {/* ---------- Summary Cards ---------- */}
      <div className="pd-stats" style={{ marginBottom: 32 }}>
        <div className="pd-stat">
          <span className="pd-stat-label">Team Members</span>
          <strong>{teamMembers.length}</strong>
          <span className="pd-stat-sub">Total</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Active</span>
          <strong>{activeCount}</strong>
          <span className="pd-stat-sub">Members</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Pending Invites</span>
          <strong>{pendingInvites}</strong>
          <span className="pd-stat-sub">Invitations</span>
        </div>
        <div className="pd-stat">
          <span className="pd-stat-label">Roles</span>
          <strong>{distinctRoles}</strong>
          <span className="pd-stat-sub">Active</span>
        </div>
      </div>

      <div className="settings-grid" style={{ alignItems: "flex-start" }}>
        {/* ---------- Team Members Table ---------- */}
        <div className="pd-card" style={{ gridColumn: "span 2" }}>
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Team Members</h3>
          {teamMembers.length === 0 ? (
            <p className="dash-empty">No team members yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                  <th style={{ padding: "10px 8px" }}>Member</th>
                  <th style={{ padding: "10px 8px" }}>Role</th>
                  <th style={{ padding: "10px 8px" }}>Status</th>
                  <th style={{ padding: "10px 8px" }}>Last Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => {
                  const initials = member.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <tr
                      key={member.id}
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: selected?.id === member.id ? "rgba(92,26,31,0.04)" : "transparent" }}
                    >
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="cl-avatar" style={{ width: 32, height: 32, fontSize: 12, overflow: "hidden" }}>
                            {avatarUrls[member.id] ? (
                              <img src={avatarUrls[member.id]} alt={member.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <Link href={`/hub/team?memberId=${member.id}`} style={{ fontWeight: 500, color: "#2B2622", textDecoration: "none" }}>
                              {member.fullName}
                            </Link>
                            <div className="pay-history-meta">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <span className="dash-status">{member.role.name}</span>
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <span className={`dash-status ${member.status === "ACTIVE" ? "dash-status-active" : member.status === "INVITED" ? "dash-status-baseline_pending" : "dash-status-archived"}`}>
                          {member.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 8px" }}>{member.lastLoginAt ? member.lastLoginAt.toLocaleString() : "—"}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <Link href={`/hub/team?memberId=${member.id}`} className="dash-view-btn">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <p className="pay-history-meta" style={{ marginTop: 12 }}>
            Showing {teamMembers.length} of {teamMembers.length} member{teamMembers.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* ---------- Right Info Panel ---------- */}
        {selected && (
          <MemberDetailPanel
            member={{
              id: selected.id,
              fullName: selected.fullName,
              email: selected.email,
              phone: selected.phone,
              roleName: selected.role.name,
              status: selected.status,
              createdAt: selected.createdAt.toLocaleDateString(),
              lastLoginAt: selected.lastLoginAt ? selected.lastLoginAt.toLocaleString() : null,
              avatarUrl: avatarUrls[selected.id] ?? null,
            }}
            permissionKeys={selected.role.rolePermissions.map((rp) => rp.permission.key)}
            canManage={isOwner}
            isOwnerRole={selected.role.name === "Owner"}
          />
        )}
      </div>

      {/* ---------- Grow your team ---------- */}
      <div className="pd-card" style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", marginTop: 24 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, margin: "0 0 6px" }}>Grow your team.</h3>
          <p className="pay-history-meta">Invite therapists and collaborators as your business grows.</p>
        </div>
        {isOwner && <InviteMemberSheet />}
      </div>
    </div>
  );
}
