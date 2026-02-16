import ProjectSettingsPage from "../../../(pages)/settings/project/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../../params";

export default async function ScopedProjectSettings(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <ProjectSettingsPage projectId={projectId} />;
}
