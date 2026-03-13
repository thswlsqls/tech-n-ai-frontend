"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ExecutionMeta } from "@/types/agent";

interface Props {
  meta: ExecutionMeta;
}

export function AgentExecutionMeta({ meta }: Props) {
  const totalCalls = meta.toolCallCount + meta.analyticsCallCount;
  const timeInSeconds = (meta.executionTimeMs / 1000).toFixed(1);

  return (
    <div className="brutal-border mt-2 bg-white p-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Badge variant={meta.success ? "success" : "destructive"}>
          {meta.success ? "Success" : "Failed"}
        </Badge>
        <span className="font-mono text-muted-foreground">
          {totalCalls} tool call{totalCalls !== 1 ? "s" : ""}
        </span>
        <span className="font-mono text-muted-foreground">{timeInSeconds}s</span>
      </div>

      {meta.errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {meta.errors.map((error, i) => (
            <div key={i} className="flex items-start gap-1.5 text-sm text-[#EF4444]">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
