import { redirect } from "next/navigation";
import {
  resolveProjectRouteParams,
  type ProjectRouteProps,
} from "../params";

export default async function ProjectAgentsPage(props: ProjectRouteProps) {
  const { projectId } = await resolveProjectRouteParams(props);
  redirect(`/${projectId}/dashboard`);
}
