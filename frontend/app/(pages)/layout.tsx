"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { ErrorBoundary } from "../../components/ErrorBoundary";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define paths that should NOT have the sidebar/dashboard layout
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname.startsWith("/welcome");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ErrorBoundary>
  );
}
