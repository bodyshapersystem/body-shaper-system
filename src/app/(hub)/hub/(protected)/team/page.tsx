import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";
import { createTeamMember, updateTeamMemberRole, updateTeamMemberStatus } from "./actions";

export const dynamic = "force-dynamic";

const STAFF_ROLES = [
  { id: "role_owner", name: "Owner" },
  { id: "role_admin", name: "Admin" },
  { id: "role_manager", name: "Manager" },
  { id: "role_specialist", name: "Specialist" },
  { id: "role_assistant", name: "Assistant" },
  { id: "role_marketing", name: "Marketing" },
];

export default async function HubTeamPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");

  const isOwner = user.role.id === "role_owner";

  const teamMembers = await prisma.user.findMany({
    where: { roleId: { not: "role_client" } },
    include: { role: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Administration</p>
        <h1>team.</h1>
      </div>

      {isOwner && (
        <form
          action={async (formData: FormData) => {
            "use server";
            await createTeamMember(formData);
          }}
          style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", maxWidth: 640 }}
        >
          <input name="fullName" placeholder="Full name" required style={{ padding: 10, flex: 1 }} />
          <input name="email" type="email" placeholder="Email" required style={{ padding: 10, flex: 1 }} />
          <select name="roleId" defaultValue="role_specialist" style={{ padding: 10 }}>
            {STAFF_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
            Invite
          </button>
        </form>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
            <th style={{ padding: "10px 8px" }}>Name</th>
            <th style={{ padding: "10px 8px" }}>Email</th>
            <th style={{ padding: "10px 8px" }}>Role</th>
            <th style={{ padding: "10px 8px" }}>Status</th>
            {isOwner && <th style={{ padding: "10px 8px" }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {teamMembers.map((member) => (
            <tr key={member.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <td style={{ padding: "10px 8px" }}>{member.fullName}</td>
              <td style={{ padding: "10px 8px" }}>{member.email}</td>
              <td style={{ padding: "10px 8px" }}>
                {isOwner && member.id !== user.id ? (
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await updateTeamMemberRole(member.id, String(formData.get("roleId")));
                    }}
                    style={{ display: "flex", gap: 6 }}
                  >
                    <select name="roleId" defaultValue={member.roleId} style={{ padding: 6 }}>
                      {STAFF_ROLES.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <button type="submit" style={{ fontSize: 12, padding: "4px 8px" }}>
                      Save
                    </button>
                  </form>
                ) : (
                  member.role.name
                )}
              </td>
              <td style={{ padding: "10px 8px" }}>{member.status}</td>
              {isOwner && (
                <td style={{ padding: "10px 8px" }}>
                  {member.id !== user.id && (
                    <form
                      action={async () => {
                        "use server";
                        await updateTeamMemberStatus(
                          member.id,
                          member.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"
                        );
                      }}
                    >
                      <button
                        type="submit"
                        style={{ fontSize: 12.5, background: "none", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 4, padding: "4px 10px" }}
                      >
                        {member.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                      </button>
                    </form>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
