import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relatim Cloud",
  description: "Sign in to Relatim Cloud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
