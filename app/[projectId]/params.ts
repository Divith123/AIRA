export type ProjectRouteParams = { projectId: string };
export type ProjectRouteProps =
  | { params: ProjectRouteParams }
  | { params: Promise<ProjectRouteParams> };

export async function resolveProjectRouteParams(
  props: ProjectRouteProps,
): Promise<ProjectRouteParams> {
  const params = props.params;
  if (typeof (params as Promise<ProjectRouteParams>).then === "function") {
    return params as Promise<ProjectRouteParams>;
  }
  return params as ProjectRouteParams;
}
