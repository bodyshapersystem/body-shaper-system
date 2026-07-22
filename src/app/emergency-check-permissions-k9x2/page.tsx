import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyCheckPermissionsPage({ searchParams }: { searchParams: Promise<{ token?: string; email?: string }> }) {
  const { token, email } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const targetEmail = email || "hello@bodyshapersystem.com";

  const user = await prisma.user.findFirst({
    where: { email: targetEmail },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
  });

  if (!user) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>No user found with email {targetEmail}.</div>;
  }

  const permissionKeys = user.role.rolePermissions.map((rp) => rp.permission.key).sort();

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      User: {user.fullName} ({user.email})
      {"\n"}
      Role: {user.role.name} (id: {user.roleId})
      {"\n\n"}
      Has "leads.view": {String(permissionKeys.includes("leads.view"))}
      {"\n"}
      Has "clients.view": {String(permissionKeys.includes("clients.view"))}
      {"\n\n"}
      Full permission list ({permissionKeys.length}):
      {"\n"}
      {permissionKeys.join(", ")}
    </div>
  );
}
