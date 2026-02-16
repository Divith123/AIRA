import CallsPage from "../../../(pages)/telephony/calls/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../../params";

export default async function ProjectCallsPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <CallsPage projectId={projectId} />;
}
