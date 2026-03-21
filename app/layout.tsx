import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./components/QueryProvider";
import { PowerSyncProvider } from "@/lib/powersync/provider";

export const metadata: Metadata = {
  title: "Blackboard — Multi-Agent AI",
  description: "Local-first multi-agent AI platform built on the Blackboard Architecture",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PowerSyncProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </PowerSyncProvider>
      </body>
    </html>
  );
}
