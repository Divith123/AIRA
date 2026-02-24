import type { Metadata } from "next";
import { Providers } from "@/lib/providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const OUTFIT_FONT_URL = "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap";

export const metadata: Metadata = {
  title: "AIRA",
  description:
    "AIRA is a self-hosted LiveKit management dashboard built with Next.js and Tailwind CSS. It provides an interface for managing projects, monitoring real-time metrics, and configuring settings.",
  icons: {
    icon: "/aira-logo.png",
    shortcut: "/aira-logo.png",
    apple: "/aira-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={OUTFIT_FONT_URL} rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: "'Outfit', sans-serif" }}>
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
