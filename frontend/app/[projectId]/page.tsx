import { redirect } from "next/navigation";

export default function ProjectIndexPage({ params }: { params: { projectId: string } }) {
  // Redirect project root to dashboard
  redirect(`/${params.projectId}/dashboard`);
}
