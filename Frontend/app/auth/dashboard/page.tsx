import { renderDashboardPage } from "./_lib/renderDashboardPage";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return renderDashboardPage("discover");
}
