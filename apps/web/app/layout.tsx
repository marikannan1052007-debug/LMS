import type { Metadata } from "next";

import { GlobalLoadingProvider } from "@/components/loading/GlobalLoadingProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "LMS",
  description: "Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <GlobalLoadingProvider>
            {children}
          </GlobalLoadingProvider>
        </QueryProvider>
      </body>
    </html>
  );
}