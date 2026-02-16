import EgressesPage from "../../(pages)/egresses/page";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../params";

export default async function ProjectEgressesPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  return <EgressesPage projectId={projectId} />;
}
