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
    <aside
      className="w-56 shrink-0 border-r flex flex-col px-4 py-6"
      style={{ background: "#191817", borderColor: "#252422" }}
    >
      <div className="mb-8 px-2">
        <h1 className="font-bold text-xl" style={{ color: "#DCDCDC" }}>
          Workhorse
        </h1>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                color: isActive ? "#DCDCDC" : "#A1A1AA",
                background: isActive ? "#252422" : "transparent",
                fontWeight: isActive ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "#1F1E1C";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
