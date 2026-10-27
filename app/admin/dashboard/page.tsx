import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Checked here as well as in middleware.ts, so a middleware bypass can't expose it.
  if (!(await hasAdminSession())) redirect("/admin");
  const content = await getContent();
  return <AdminDashboard initialContent={content} />;
}
