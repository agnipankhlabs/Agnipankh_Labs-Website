"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  textToCopy?: string;
  copyCurrentUrl?: boolean;
  className?: string;
  label?: string;
  showText?: boolean;
}

export function CopyButton({
  textToCopy,
  copyCurrentUrl,
  className = "rounded-xl border border-navy/15 bg-white p-2 hover:bg-muted/40 hover:border-brand-ink transition-colors",
  label = "Copy to clipboard",
  showText = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const text = copyCurrentUrl ? window.location.href : (textToCopy ?? "");
      if (text) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback if clipboard API is restricted
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
      aria-label={label}
      title={copied ? "Copied!" : label}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
      ) : (
        <Copy className="h-4 w-4 text-navy/60 shrink-0" />
      )}
      {showText && (
        <span className="text-xs font-medium ml-1.5">
          {copied ? "Copied!" : "Copy Link"}
        </span>
      )}
    </button>
  );
}
