"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleRolePermission, resetTeamMemberPassword, updateTeamMemberStatus } from "./actions";

const MODULES: { label: string; key: string }[] = [
  { label: "Dashboard", key: "dashboard.view" },
  { label: "Clients", key: "clients.view" },
  { label: "Leads", key: "leads.view" },
  { label: "Blueprint", key: "blueprints.manage" },
  { label: "Appointments", key: "appointments.manage" },
  { label: "Documents", key: "documents.manage" },
  { label: "Progress", key: "measurements.manage" },
  { label: "Rewards", key: "rewards.manage" },
  { label: "Payments", key: "payments.manage" },
  { label: "Analytics", key: "analytics.view" },
  { label: "Team", key: "team.manage" },
  { label: "Settings", key: "settings.manage" },
];

export default function MemberDetailPanel({
  member,
  permissionKeys,
  canManage,
  isOwnerRole,
}: {
  member: { id: string; fullName: string; email: string; phone: string | null; roleName: string; status: string; createdAt: string; lastLoginAt: string | null };
  permissionKeys: string[];
  canManage: boolean;
  isOwnerRole: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resetSent, setResetSent] = useState(false);

  function handleToggle(key: string, enabled: boolean) {
    startTransition(async () => {
      await toggleRolePermission(member.roleName === "Owner" ? "role_owner" : roleIdFromName(member.roleName), key, enabled);
      router.refresh();
    });
  }

  function roleIdFromName(name: string) {
    const map: Record<string, string> = {
      Owner: "role_owner",
      Admin: "role_admin",
      Manager: "role_manager",
      Specialist: "role_specialist",
      Assistant: "role_assistant",
      Marketing: "role_marketing",
    };
    return map[name] ?? "";
  }

  function handleResetPassword() {
    if (!confirm(`Send a password reset email to ${member.email}?`)) return;
    startTransition(async () => {
      await resetTeamMemberPassword(member.email);
      setResetSent(true);
    });
  }

  function handleRemove() {
    if (!confirm(`Suspend ${member.fullName}'s access?`)) return;
    startTransition(async () => {
      await updateTeamMemberStatus(member.id, "SUSPENDED");
      router.refresh();
    });
  }

  const initials = member.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="pd-card">
      <p className="dash-section-title" style={{ marginTop: 0 }}>Member Details</p>
      <div className="cl-header-name-row" style={{ marginBottom: 16 }}>
        <div className="cl-avatar" style={{ width: 48, height: 48, fontSize: 16 }}>
          {initials}
        </div>
        <div>
          <strong style={{ display: "block", fontFamily: "var(--serif)", fontSize: 16 }}>{member.fullName}</strong>
          <span className="pay-history-meta">{member.email}</span>
        </div>
      </div>

      <div className="cl-summary-list" style={{ marginBottom: 20 }}>
        {member.phone && (
          <div className="cl-summary-row">
            <span>Phone</span>
            <span>{member.phone}</span>
          </div>
        )}
        <div className="cl-summary-row">
          <span>Role</span>
          <span>{member.roleName}</span>
        </div>
        <div className="cl-summary-row">
          <span>Status</span>
          <span>{member.status}</span>
        </div>
        <div className="cl-summary-row">
          <span>Joined</span>
          <span>{member.createdAt}</span>
        </div>
        <div className="cl-summary-row">
          <span>Last Login</span>
          <span>{member.lastLoginAt ?? "Never"}</span>
        </div>
      </div>

      <p className="dash-section-title">Permissions</p>
      {isOwnerRole ? (
        <p className="pay-history-meta" style={{ marginBottom: 16 }}>Owner always has Full Access.</p>
      ) : (
        <>
          <p className="pay-history-meta" style={{ marginBottom: 12 }}>
            Editing a permission here changes it for everyone with the {member.roleName} role — permissions aren't per-person.
          </p>
          <div className="settings-toggle-list" style={{ marginBottom: 20 }}>
            {MODULES.map((m) => (
              <label key={m.key} className="settings-toggle-row">
                <span>{m.label}</span>
                <span className="settings-toggle">
                  <input
                    type="checkbox"
                    defaultChecked={permissionKeys.includes(m.key)}
                    disabled={!canManage || isPending}
                    onChange={(e) => handleToggle(m.key, e.target.checked)}
                  />
                  <span className="settings-toggle-track" />
                </span>
              </label>
            ))}
          </div>
        </>
      )}

      {canManage && (
        <>
          <p className="dash-section-title">Quick Actions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button type="button" className="dash-view-btn" onClick={handleResetPassword} disabled={isPending}>
              {resetSent ? "Reset email sent" : "Reset Password"}
            </button>
            {member.status !== "SUSPENDED" && (
              <button type="button" className="dash-view-btn" style={{ color: "#a33", borderColor: "rgba(163,51,51,0.3)" }} onClick={handleRemove} disabled={isPending}>
                Remove Member
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
