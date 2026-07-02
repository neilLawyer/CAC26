import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HouseholdProvider } from "@/lib/household-store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenDoor — Find benefits you may qualify for",
  description:
    "A free, informational tool that helps you find public benefit programs you may qualify for. No login, nothing stored on a server.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HouseholdProvider>{children}</HouseholdProvider>
      </body>
    </html>
  );
}
