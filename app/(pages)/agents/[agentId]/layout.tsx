import type { ReactNode } from "react";
import { redirect } from "next/navigation";

export default function AgentDetailLayout({
  children: _children,
}: {
  children: ReactNode;
}) {
  void _children;
  redirect("/dashboard");
}
