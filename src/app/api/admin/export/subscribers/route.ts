import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

// Quote each CSV cell and neutralise spreadsheet formula injection.
const csvCell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replaceAll('"', '""')}"`;

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new Response("Not found", { status: 404 });
  const rows = await db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  const csv = ["email,subscribed_at", ...rows.map((r) => `${csvCell(r.email)},${r.createdAt.toISOString()}`)].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="red-betta-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
