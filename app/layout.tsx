import type { Metadata } from "next";
import { WorkhorseSidebar } from "~/components/workhorse/sidebar";
import "./globals.css";

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
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <div className="flex min-h-screen bg-[#151413]">
          <WorkhorseSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </body>
    </html>
  );
}
