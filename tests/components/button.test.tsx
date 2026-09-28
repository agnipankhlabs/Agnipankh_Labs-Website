import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button, ButtonLink } from "@/components/ui/button";

describe("Button component", () => {
  it("renders with default primary variant and md size", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass("bg-brand-ink");
    expect(btn).toHaveClass("text-white");
  });

  it("renders secondary and outline variants", () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    let btn = screen.getByRole("button", { name: /secondary/i });
    expect(btn).toHaveClass("bg-navy");

    rerender(<Button variant="outline">Outline</Button>);
    btn = screen.getByRole("button", { name: /outline/i });
    expect(btn).toHaveClass("border");
  });

  it("supports disabled state", () => {
    render(<Button disabled>Disabled Button</Button>);
    const btn = screen.getByRole("button", { name: /disabled button/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass("disabled:opacity-60");
  });

  it("renders ButtonLink as an anchor tag with correct href", () => {
    render(<ButtonLink href="/courses">Explore Courses</ButtonLink>);
    const link = screen.getByRole("link", { name: /explore courses/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/courses");
  });
});
