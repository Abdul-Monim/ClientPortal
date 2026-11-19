import type { Milestone, MilestoneStatus } from "./types";

const STATUS_PROGRESS_FACTOR: Record<MilestoneStatus, number> = {
  planned: 0,
  in_progress: 0.35,
  in_review: 0.75,
  approved: 1,
};

export interface MilestoneWeightAudit {
  totalWeightPct: number;
  isBalanced: boolean;
  remainingWeightPct: number;
}

export function auditMilestoneWeights(
  milestones: Pick<Milestone, "weightPct">[]
): MilestoneWeightAudit {
  const totalWeightPct = milestones.reduce((sum, m) => {
    if (!Number.isInteger(m.weightPct) || m.weightPct < 0 || m.weightPct > 100) {
      throw new RangeError("Each milestone weight must be an integer between 0 and 100.");
    }
    return sum + m.weightPct;
  }, 0);

  return {
    totalWeightPct,
    isBalanced: totalWeightPct === 100,
    remainingWeightPct: 100 - totalWeightPct,
  };
}

/**
 * Computes deterministic weighted project completion percentage (0..100).
 * Normalizes gracefully if total configured weights do not yet equal 100.
 */
export function calculateProjectProgressPct(
  milestones: Pick<Milestone, "weightPct" | "status">[]
): number {
  if (milestones.length === 0) {
    return 0;
  }

  const totalWeight = milestones.reduce((sum, m) => sum + m.weightPct, 0);
  if (totalWeight <= 0) {
    return 0;
  }

  const earnedWeight = milestones.reduce(
    (sum, m) => sum + m.weightPct * STATUS_PROGRESS_FACTOR[m.status],
    0
  );

  return Math.max(0, Math.min(100, Math.round((earnedWeight / totalWeight) * 100)));
}

export function countCompletedMilestones(
  milestones: Pick<Milestone, "status">[]
): { completed: number; total: number } {
  const completed = milestones.filter((m) => m.status === "approved").length;
  return { completed, total: milestones.length };
}
