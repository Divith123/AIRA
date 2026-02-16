import DashboardPage from "../../(pages)/dashboard/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../params";

export default async function ProjectDashboardPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <DashboardPage projectId={projectId} />;
}
