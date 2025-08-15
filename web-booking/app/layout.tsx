import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  ClerkProvider,
} from '@clerk/nextjs'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web Bookings",
  description: "Book your appointments seamlessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={cn("min-h-screen bg-background font-sans antialiased", `${geistSans.variable} ${geistMono.variable}`)}
        >
          <div className="container mx-auto p-3">
            
            {children}
          </div>
          

        </body>
      </html>
    </ClerkProvider>
  );
}
