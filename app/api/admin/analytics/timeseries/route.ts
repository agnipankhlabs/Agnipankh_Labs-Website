import { auth } from "@/auth";
import { getAnalyticsTimeSeries } from "@/lib/admin-analytics";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  const timeSeries = await getAnalyticsTimeSeries(days);
  return Response.json(timeSeries);
}