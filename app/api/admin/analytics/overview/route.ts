import { auth } from "@/auth";
import { getAnalyticsOverview } from "@/lib/admin-analytics";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRoles = (session.user as unknown as { roles?: string[] }).roles ?? [];
  const isAdmin =
    userRoles.includes("admin") ||
    userRoles.includes("super_admin") ||
    userRoles.includes("trainer");

  if (!isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const overview = await getAnalyticsOverview();
  return Response.json(overview);
}