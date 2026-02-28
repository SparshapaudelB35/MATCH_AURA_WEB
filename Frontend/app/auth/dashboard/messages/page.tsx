import { renderDashboardPage } from "../_lib/renderDashboardPage";

export const dynamic = "force-dynamic";

export default async function DashboardMessagesPage() {
  return renderDashboardPage("messages");
}
