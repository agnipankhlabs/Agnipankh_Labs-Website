import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-lg border border-navy/20 bg-white px-3.5 py-2.5 text-[15px] text-navy " +
  "placeholder:text-navy/40 transition-colors " +
  "focus:border-brand-ink focus:outline-2 focus:outline-offset-2 focus:outline-brand-ink " +
  "aria-[invalid=true]:border-red-600";

export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn("block text-sm font-medium text-navy", className)}
      {...props}
    >
      {children}
      {required ? (
        <>
          <span aria-hidden="true" className="ml-0.5 text-red-700">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      ) : null}
    </label>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(controlBase, "min-h-32 resize-y", className)} {...props} />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlBase, className)} {...props} />;
}

/**
 * Field-level error. `role="alert"` so a screen reader announces it the moment
 * the server action returns, rather than leaving the user to discover it.
 */
export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-700">
      {errors[0]}
    </p>
  );
}

/**
 * Bot trap. Hidden from sight and from assistive technology, and excluded from
 * tab order — a human cannot fill it in, so any value means a bot.
 *
 * Deliberately NOT `display:none`: the cruder bots skip fields that are visibly
 * hidden that way, but happily fill an off-screen one.
 */
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
    >
      <label htmlFor="website">Website</label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

/** Success / error banner shared by every form. */
export function FormBanner({
  status,
  message,
}: {
  status: "success" | "error";
  message: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        status === "success"
          ? "border-green-700/30 bg-green-50 text-green-900"
          : "border-red-700/30 bg-red-50 text-red-900",
      )}
    >
      {message}
    </div>
  );
}
