import KeysPage from "../../../(pages)/settings/keys/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../../params";

export default async function ProjectKeysPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <KeysPage projectId={projectId} />;
}
