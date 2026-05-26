"use client"

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { Nunito_Sans } from "next/font/google"; 
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito-sans", 
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={nunitoSans.className}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster richColors position="top-right" /> 
        </QueryClientProvider>
      </body>
    </html>
  );
}