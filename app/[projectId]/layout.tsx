import React from "react";
import PagesLayout from "../(pages)/layout";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  // We simply reuse the existing pages layout (which applies DashboardLayout)
  return <PagesLayout>{children}</PagesLayout>;
}
