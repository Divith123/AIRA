import WebhooksPage from "../../../(pages)/settings/webhooks/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../../params";

export default async function ProjectWebhooksPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <WebhooksPage projectId={projectId} />;
}
