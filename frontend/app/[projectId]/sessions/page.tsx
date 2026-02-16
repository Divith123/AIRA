import SessionsPage from "../../(pages)/sessions/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../params";

export default async function ProjectSessionsPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <SessionsPage projectId={projectId} />;
}
