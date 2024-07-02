"use client";
import { ParticlesProvider } from "@/lib/particlesContext";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { ThirdwebProvider } from "thirdweb/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThirdwebProvider>
        <html lang="en" className="bg-secondary">
          <ParticlesProvider>
            <body className={inter.className}>{children}</body>
          </ParticlesProvider>
          <Toaster />
        </html>
      </ThirdwebProvider>
    </Suspense>
  );
}
