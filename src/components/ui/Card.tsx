"use client";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  className,
  children,
  padding = "md",
  ...props
}: CardProps) {
  const paddings = { none: "", sm: "p-3", md: "p-4", lg: "p-6" };
  return (
    <div
      className={cn(
        "bg-[#111827] border border-[#1F2937] rounded-xl",
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
