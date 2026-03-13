"use client";

import { Loader2 } from "lucide-react";

export function AgentLoadingIndicator() {
  return (
    <div className="flex items-start" aria-label="Agent is working" aria-live="polite">
      <div className="brutal-border bg-[#F5F5F5] p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 shrink-0 animate-spin text-[#3B82F6]" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold">Agent is working...</p>
            <p className="text-xs text-muted-foreground">
              This may take up to a minute.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
