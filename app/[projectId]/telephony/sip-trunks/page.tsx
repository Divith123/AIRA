import SipTrunksPage from "../../../(pages)/telephony/sip-trunks/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../../params";

export default async function ProjectSipTrunksPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <SipTrunksPage projectId={projectId} />;
}
