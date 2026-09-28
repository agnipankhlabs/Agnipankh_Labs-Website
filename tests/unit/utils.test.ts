import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("px-4 py-2", "bg-brand-ink")).toBe("px-4 py-2 bg-brand-ink");
  });

  it("handles falsy and conditional values", () => {
    const isPrimary = true;
    const isLarge = false;
    expect(
      cn("base-class", isPrimary && "primary-class", isLarge && "large-class"),
    ).toBe("base-class primary-class");
  });

  it("resolves Tailwind class collisions with rightmost precedence", () => {
    expect(cn("px-2 py-1", "px-6")).toBe("py-1 px-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});
