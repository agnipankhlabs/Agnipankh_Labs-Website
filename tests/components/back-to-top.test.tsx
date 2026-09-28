import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BackToTop } from "@/components/ui/back-to-top";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("BackToTop component", () => {
  beforeEach(() => {
    window.scrollY = 0;
    window.scrollTo = vi.fn();
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("renders with accessible attributes", () => {
    render(<BackToTop />);
    const button = screen.getByRole("button", { name: /back to top/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Back to top");
  });

  it("starts hidden at top of page (scrollY = 0)", () => {
    render(<BackToTop />);
    const button = screen.getByRole("button", { name: /back to top/i });
    expect(button).toHaveClass("opacity-0");
    expect(button).toHaveClass("pointer-events-none");
    expect(button).toHaveAttribute("tabindex", "-1");
  });

  it("becomes visible when scrolled past 400px", () => {
    render(<BackToTop />);
    const button = screen.getByRole("button", { name: /back to top/i });
    expect(button).toHaveClass("opacity-0");

    act(() => {
      window.scrollY = 500;
      fireEvent.scroll(window);
    });

    expect(button).toHaveClass("opacity-100");
    expect(button).toHaveClass("pointer-events-auto");
    expect(button).toHaveAttribute("tabindex", "0");
  });

  it("calls window.scrollTo with smooth behavior on click", () => {
    render(<BackToTop />);

    act(() => {
      window.scrollY = 500;
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button", { name: /back to top/i });
    fireEvent.click(button);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("calls window.scrollTo with auto behavior when reduced motion is preferred", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<BackToTop />);

    act(() => {
      window.scrollY = 600;
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button", { name: /back to top/i });
    fireEvent.click(button);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "auto",
    });
  });
});
