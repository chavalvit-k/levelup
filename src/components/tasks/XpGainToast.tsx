"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { TaskCompletionResult } from "@/lib/types";

interface XpGainToastProps {
  result: TaskCompletionResult | null;
  onDismiss: () => void;
}

export function XpGainToast({ result, onDismiss }: XpGainToastProps) {
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 bg-[#111827] border border-[#1F2937] rounded-2xl p-5 shadow-2xl min-w-70 max-w-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#F59E0B] text-xl">⚡</span>
                <span className="text-[#E5E7EB] font-semibold">
                  Task Complete!
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Base XP</span>
                  <span className="text-[#F59E0B]">
                    +{result.xpResult.baseXp}
                  </span>
                </div>
                {result.xpResult.heroBonusXp > 0 && (
                  <div className="flex justify-between text-[#9CA3AF]">
                    <span>Hero Bonus</span>
                    <span className="text-[#F59E0B]">
                      +{result.xpResult.heroBonusXp}
                    </span>
                  </div>
                )}
                {result.xpResult.dailyCompletionBonusXp > 0 && (
                  <div className="flex justify-between text-[#9CA3AF]">
                    <span>Daily Completion Bonus (+20%)</span>
                    <span className="text-[#22C55E]">
                      +{result.xpResult.dailyCompletionBonusXp}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t border-[#1F2937] pt-1 mt-1">
                  <span className="text-[#E5E7EB]">Total</span>
                  <span className="text-[#F59E0B]">
                    +{result.xpResult.totalXp} XP
                  </span>
                </div>
              </div>

              {result.levelUpResult && (
                <div className="mt-3 p-2 bg-[#6366F1]/15 border border-[#6366F1]/30 rounded-lg">
                  <span className="text-[#818CF8] text-sm font-medium">
                    🎉 Level Up! → Level {result.levelUpResult.newLevel}
                  </span>
                  {result.levelUpResult.cosmeticUnlocked && (
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Cosmetic unlocked: {result.levelUpResult.cosmeticUnlocked}
                    </p>
                  )}
                </div>
              )}

              {result.streakUpdated && (
                <div className="mt-2 p-2 bg-[#FB923C]/10 border border-[#FB923C]/30 rounded-lg">
                  <span className="text-[#FDBA74] text-sm">
                    🔥 Streak: {result.newStreak} day
                    {result.newStreak !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onDismiss}
              className="text-[#4B5563] hover:text-[#E5E7EB] transition-colors text-sm shrink-0"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
