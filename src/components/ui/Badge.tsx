"use client";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: "primary" | "xp" | "success" | "failure" | "streak" | "default";
  className?: string;
}

const colors = {
  primary: "bg-[#6366F1]/20 text-[#818CF8] border-[#6366F1]/30",
  xp: "bg-[#F59E0B]/20 text-[#FCD34D] border-[#F59E0B]/30",
  success: "bg-[#22C55E]/20 text-[#4ADE80] border-[#22C55E]/30",
  failure: "bg-[#EF4444]/20 text-[#F87171] border-[#EF4444]/30",
  streak: "bg-[#FB923C]/20 text-[#FDBA74] border-[#FB923C]/30",
  default: "bg-[#1F2937] text-[#9CA3AF] border-[#374151]",
};

export function Badge({ children, color = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border",
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
