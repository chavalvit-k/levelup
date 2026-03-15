"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/daily", label: "Daily Tasks", icon: "✓" },
  { href: "/general", label: "General Tasks", icon: "≡" },
  { href: "/timer", label: "Timer", icon: "◷" },
  { href: "/rewards", label: "Rewards", icon: "✦" },
  { href: "/character", label: "Character", icon: "◉" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-56 shrink-0 bg-[#111827] border-r border-[#1F2937] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#1F2937]">
        <div className="flex items-center gap-2">
          <span className="text-[#6366F1] text-xl font-bold tracking-tight">
            ▰
          </span>
          <span className="text-[#E5E7EB] font-bold text-lg tracking-tight">
            LevelUp
          </span>
        </div>
        <p className="text-[#6B7280] text-xs mt-1">
          Turn your tasks into levels.
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#6366F1]/15 text-[#818CF8]"
                  : "text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#E5E7EB]",
              )}
            >
              <span className="text-base w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#1F2937] space-y-3">
        {session?.user && (
          <div className="flex items-center gap-2 min-w-0">
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="avatar"
                className="w-6 h-6 rounded-full shrink-0"
              />
            )}
            <span className="text-[#9CA3AF] text-xs truncate">
              {session.user.email}
            </span>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left text-[#6B7280] hover:text-[#EF4444] text-xs transition-colors"
        >
          Sign out
        </button>
        <p className="text-[#4B5563] text-xs">LevelUp v0.1</p>
      </div>
    </aside>
  );
}
