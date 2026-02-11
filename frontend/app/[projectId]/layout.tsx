"use client";

import React from "react";
import PagesLayout from "../(pages)/layout";

export default function ProjectLayout({ children, params }: { children: React.ReactNode; params: { projectId: string } }) {
  // We simply reuse the existing pages layout (which applies DashboardLayout)
  return <PagesLayout>{children}</PagesLayout>;
}
