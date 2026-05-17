"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Tooltip } from "./tooltip";

export function CopyButton({ textToCopy, className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <Tooltip content={copied ? "Copied!" : "Copy"} position="top">
      <button
        onClick={handleCopy}
        className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-muted ${className}`}
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        )}
      </button>
    </Tooltip>
  );
}
