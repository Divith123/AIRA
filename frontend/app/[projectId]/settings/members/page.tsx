import MembersPage from "../../../(pages)/settings/members/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../../params";

export default async function ProjectMembersPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <MembersPage projectId={projectId} />;
}
