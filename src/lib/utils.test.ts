import { describe, expect, it } from "vitest";
import { cn, clamp, formatCompactCurrency, formatCurrency, formatPercent, getInitials, sleep } from "./utils";

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("resolves conflicting Tailwind utilities to the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("keeps a custom @theme font-size utility and a text-color utility together, in either order", () => {
    // tailwind-merge's default text-color group has a catch-all that
    // misclassifies unrecognized text-* utilities (like this project's custom
    // font-size tokens: text-body-sm, text-caption, text-display, ...) as
    // colors, so they'd silently collide with a real color utility such as
    // text-ink-inverse. extendTailwindMerge in utils.ts registers the custom
    // scale to prevent that false conflict — this pins the behavior down.
    expect(cn("text-ink-inverse", "text-body-sm")).toBe("text-ink-inverse text-body-sm");
    expect(cn("text-body-sm", "text-ink-inverse")).toBe("text-body-sm text-ink-inverse");
  });

  it("still resolves a genuine text-color conflict to the last one", () => {
    expect(cn("text-ink", "text-ink-inverse")).toBe("text-ink-inverse");
  });
});

describe("formatCompactCurrency", () => {
  it("abbreviates large amounts with a K/M suffix", () => {
    expect(formatCompactCurrency(180000)).toBe("$180K");
  });

  it("formats zero as a plain currency value", () => {
    expect(formatCompactCurrency(0)).toBe("$0");
  });

  it("keeps one fraction digit for sub-thousand-boundary values", () => {
    expect(formatCompactCurrency(1400)).toBe("$1.4K");
  });
});

describe("formatCurrency", () => {
  it("formats a decimal amount with two fraction digits and thousands separators", () => {
    expect(formatCurrency(1499.9)).toBe("$1,499.90");
  });

  it("formats zero with two fraction digits", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("formatPercent", () => {
  it("appends a percent sign with no fraction digits by default", () => {
    expect(formatPercent(68)).toBe("68%");
  });

  it("respects a custom fraction digit count", () => {
    expect(formatPercent(68.256, 1)).toBe("68.3%");
  });

  it("formats zero", () => {
    expect(formatPercent(0)).toBe("0%");
  });
});

describe("getInitials", () => {
  it("takes the first letter of the first two words", () => {
    expect(getInitials("Dana Cole")).toBe("DC");
  });

  it("uppercases a single-word name", () => {
    expect(getInitials("dana")).toBe("D");
  });

  it("ignores extra names beyond the first two", () => {
    expect(getInitials("Dana Middle Cole")).toBe("DM");
  });

  it("returns an empty string for blank input", () => {
    expect(getInitials("   ")).toBe("");
  });
});

describe("clamp", () => {
  it("returns the value when within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("clamps to the minimum when below range", () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it("clamps to the maximum when above range", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });
});

describe("sleep", () => {
  it("resolves after the given delay", async () => {
    const start = Date.now();
    await sleep(10);
    expect(Date.now() - start).toBeGreaterThanOrEqual(9);
  });
});
