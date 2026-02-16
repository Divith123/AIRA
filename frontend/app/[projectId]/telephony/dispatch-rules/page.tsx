import DispatchRulesPage from "../../../(pages)/telephony/dispatch-rules/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../../params";

export default async function ProjectDispatchRulesPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <DispatchRulesPage projectId={projectId} />;
}
