import { prisma } from "@/lib/prisma";

const SECRET = "G9FLAKoay_CVCzWqMaaiiA";

export default async function EmergencyCheckEmmyPermissionsPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (token !== SECRET) {
    return <div style={{ padding: 40, fontFamily: "monospace" }}>Not found.</div>;
  }

  const user = await prisma.user.findFirst({
    where: { email: "hello@bodyshapersystem.com" },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
  });

  if (!user) return <div style={{ padding: 40, fontFamily: "monospace" }}>Owner user not found.</div>;

  const permissionKeys = user.role.rolePermissions.map((rp) => rp.permission.key).sort();

  return (
    <div style={{ padding: 40, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      role name: {user.role.name}
      {"\n"}
      role id: {user.role.id}
      {"\n"}
      permissions ({permissionKeys.length}): {JSON.stringify(permissionKeys, null, 2)}
      {"\n\n"}
      has blueprints.manage: {permissionKeys.includes("blueprints.manage") ? "YES" : "NO — this is the bug"}
    </div>
  );
}
