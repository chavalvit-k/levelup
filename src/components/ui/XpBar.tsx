"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface XpBarProps {
  percent: number;
  color?: string;
  height?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function XpBar({
  percent,
  color = "#6366F1",
  height = 8,
  className,
  showLabel = false,
  label,
}: XpBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs text-[#6B7280]">
          <span>{label ?? "XP"}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        className="w-full bg-[#1F2937] rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
