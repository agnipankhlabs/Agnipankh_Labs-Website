import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Label,
  Input,
  Textarea,
  Select,
  FieldError,
  FormBanner,
  Honeypot,
} from "@/components/ui/field";

describe("Form UI Field Primitives", () => {
  it("renders Label with required indicator", () => {
    render(<Label required htmlFor="test-input">Test Label</Label>);
    const label = screen.getByText(/test label/i);
    expect(label).toBeInTheDocument();
    expect(screen.getByText("(required)")).toBeInTheDocument();
  });

  it("renders Input with placeholder and control styling", () => {
    render(<Input placeholder="Enter your name" />);
    const input = screen.getByPlaceholderText(/enter your name/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("border");
  });

  it("renders FieldError with role alert when error is present", () => {
    const { rerender } = render(<FieldError id="email-err" errors={["Email is required"]} />);
    const err = screen.getByRole("alert");
    expect(err).toBeInTheDocument();
    expect(err).toHaveTextContent("Email is required");

    // Empty errors render nothing
    rerender(<FieldError id="email-err" errors={[]} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders FormBanner for success and error statuses", () => {
    const { rerender } = render(
      <FormBanner status="success" message="Submission successful!" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Submission successful!");
    expect(screen.getByRole("status")).toHaveClass("text-green-900");

    rerender(<FormBanner status="error" message="Submission failed." />);
    expect(screen.getByRole("status")).toHaveTextContent("Submission failed.");
    expect(screen.getByRole("status")).toHaveClass("text-red-900");
  });

  it("renders Honeypot with off-screen coordinates and aria-hidden", () => {
    const { container } = render(<Honeypot />);
    const wrapper = container.querySelector("[aria-hidden='true']");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("absolute");
    expect(container.querySelector("input#website")).toHaveAttribute("tabindex", "-1");
  });
});
