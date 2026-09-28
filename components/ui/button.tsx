import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button variants.
 *
 * ACCESSIBILITY: the `primary` variant fills with `brand-ink` (#B35100), NOT the
 * Brand Kit's raw Innovation Orange (#FF6B00). White text on #FF6B00 measures
 * 2.86:1 — it fails WCAG AA outright. See app/globals.css and
 * `npm run check:contrast`, which will fail the build if this regresses.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink " +
    "disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-brand-ink text-white hover:bg-brand-hover",
        secondary: "bg-navy text-white hover:bg-navy/90",
        outline:
          "border border-navy/20 bg-transparent text-navy hover:border-brand-ink hover:text-brand-ink",
        ghost: "bg-transparent text-navy hover:bg-muted",
        link: "text-brand-ink underline underline-offset-4 hover:text-brand-hover",
        /** For use on navy/dark sections only. */
        inverse: "bg-white text-navy hover:bg-muted",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type BaseProps = VariantProps<typeof buttonVariants> & { className?: string };

export function Button({
  className,
  variant,
  size,
  ...props
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant,
  size,
  href,
  ...props
}: BaseProps &
  Omit<React.ComponentProps<typeof Link>, "className"> & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
