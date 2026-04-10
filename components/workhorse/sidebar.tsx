"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Jobs" },
  { href: "/scheduled", label: "Scheduled" },
  { href: "/analytics", label: "Analytics" },
];

export const WorkhorseSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[#252422] bg-[#191817] flex flex-col px-4 py-6">
      <div className="mb-8 px-2">
        <h1 className="font-bold text-xl text-[#DCDCDC]">Workhorse</h1>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#252422] text-[#DCDCDC] font-medium"
                  : "text-[#A1A1AA] hover:bg-[#1F1E1C]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
