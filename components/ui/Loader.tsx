"use client";

import React from "react";
import { PageSkeleton } from "./PageSkeleton";

export default function Loader({ message }: { message?: string }) {
  // If we have a message, it might be a small loader, but based on usage it's full page.
  // We'll return the PageSkeleton for all usages per user request for "skeleton loading way".
  return <PageSkeleton />;
}
