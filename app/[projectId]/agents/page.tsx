import AgentsPage from "../../(pages)/agents/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../params";

export default async function ProjectAgentsPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <AgentsPage projectId={projectId} />;
}
