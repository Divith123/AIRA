import SandboxPage from "../../(pages)/sandbox/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../params";

export default async function ProjectSandboxPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <SandboxPage projectId={projectId} />;
}
