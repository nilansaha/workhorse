import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WorkhorseSidebar } from "~/components/workhorse/sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workhorse",
  description: "Workhorse job queue dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="flex min-h-screen" style={{ background: "#151413" }}>
          <WorkhorseSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </body>
    </html>
  );
}
