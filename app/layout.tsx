import type { Metadata } from "next";
import "./globals.css";
<<<<<<< HEAD
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "⬡ Blackboard — Mission Control",
  description: "Multi-Agent AI Research System — Shared Blackboard Architecture",
=======
import { QueryProvider } from "./components/QueryProvider";
import { PowerSyncProvider } from "@/lib/powersync/provider";

export const metadata: Metadata = {
  title: "Blackboard — Multi-Agent AI",
  description: "Local-first multi-agent AI platform built on the Blackboard Architecture",
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
=======
      <body>
        <PowerSyncProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </PowerSyncProvider>
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
      </body>
    </html>
  );
}
