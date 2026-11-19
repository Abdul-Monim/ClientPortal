import { describe, expect, it } from "vitest";
import {
  auditMilestoneWeights,
  calculateProjectProgressPct,
  countCompletedMilestones,
} from "@/domain/milestones";

describe("milestone weighted progress invariants", () => {
  it("audits balanced and unbalanced milestone weights accurately", () => {
    expect(
      auditMilestoneWeights([{ weightPct: 25 }, { weightPct: 35 }, { weightPct: 40 }])
    ).toEqual({
      totalWeightPct: 100,
      isBalanced: true,
      remainingWeightPct: 0,
    });

    expect(auditMilestoneWeights([{ weightPct: 30 }, { weightPct: 30 }])).toEqual({
      totalWeightPct: 60,
      isBalanced: false,
      remainingWeightPct: 40,
    });
  });

  it("rejects out-of-range or non-integer milestone weights", () => {
    expect(() => auditMilestoneWeights([{ weightPct: -5 }])).toThrow(RangeError);
    expect(() => auditMilestoneWeights([{ weightPct: 105 }])).toThrow(RangeError);
    expect(() => auditMilestoneWeights([{ weightPct: 12.5 }])).toThrow(RangeError);
  });

  it("computes deterministic weighted project completion", () => {
    expect(calculateProjectProgressPct([])).toBe(0);
    expect(
      calculateProjectProgressPct([{ weightPct: 0, status: "approved" }])
    ).toBe(0);

    const pct = calculateProjectProgressPct([
      { weightPct: 20, status: "approved" },
      { weightPct: 30, status: "approved" },
      { weightPct: 35, status: "in_review" },
      { weightPct: 15, status: "planned" },
    ]);
    // 20 + 30 + 35*0.75 = 76.25 -> 76%
    expect(pct).toBe(76);
  });

  it("counts completed milestones cleanly", () => {
    expect(
      countCompletedMilestones([
        { status: "approved" },
        { status: "in_review" },
        { status: "approved" },
      ])
    ).toEqual({ completed: 2, total: 3 });
  });
});
