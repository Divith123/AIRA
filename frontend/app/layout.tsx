import type { Metadata } from "next";
import { Providers } from "@/lib/providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIRA",
  description: "AIRA is a self-hosted LiveKit management dashboard built with Next.js, Rust, and Tailwind CSS. It provides an intuitive interface for managing your LiveKit projects, monitoring real-time metrics, and configuring settings with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <Providers>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
