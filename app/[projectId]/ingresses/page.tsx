import IngressesPage from "../../(pages)/ingresses/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../params";

export default async function ProjectIngressesPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <IngressesPage projectId={projectId} />;
}
