import { cn } from "@/lib/utils";

/** Consistent page gutter and max width for every section on the site. */
export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}

export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("py-[2cm]", className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

/**
 * Section heading with an optional eyebrow.
 *
 * The eyebrow is the one place raw `brand` orange is safe as text, because it is
 * rendered at a large-enough weight/size to clear AA at 3:1 — but we use
 * `brand-ink` anyway rather than rely on that exemption.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
          {eyebrow}
        </p>
      ) : null}
      <Tag
        className={cn(
          "font-heading font-bold tracking-tight text-navy text-balance",
          Tag === "h1"
            ? "text-4xl sm:text-5xl lg:text-6xl"
            : "text-3xl sm:text-4xl",
        )}
      >
        {title}
      </Tag>
      {description ? (
        <p className="mt-4 text-lg leading-relaxed text-body text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-navy/10 bg-white p-6 transition-colors hover:border-brand-ink/40",
        className,
      )}
      {...props}
    />
  );
}
