import { redirect } from "next/navigation";

export default async function ProjectIndexPage(props: { params: { projectId: string } } | { params: Promise<{ projectId: string }> }) {
  let params: { projectId: string };
  if (typeof (props.params as any).then === "function") {
    params = await (props.params as Promise<{ projectId: string }>);
  } else {
    params = props.params as { projectId: string };
  }
  redirect(`/${params.projectId}/dashboard`);
}
