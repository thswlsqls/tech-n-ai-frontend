"use client";

import { Loader2, Plus, X } from "lucide-react";
import type { SessionResponse } from "@/types/agent";

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Props {
  sessions: SessionResponse[];
  activeSessionId: string | null;
  isLoading: boolean;
  hasMore: boolean;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onLoadMore: () => void;
}

export function AgentSidebar({
  sessions,
  activeSessionId,
  isLoading,
  hasMore,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onLoadMore,
}: Props) {
  return (
    <aside
      className="flex h-full w-72 flex-col border-r-2 border-black bg-white"
      role="navigation"
      aria-label="Session list"
    >
      {/* New Session button */}
      <div className="border-b-2 border-black p-3">
        <button
          onClick={onNewSession}
          aria-label="Start new session"
          className="brutal-border brutal-shadow-sm brutal-hover flex w-full items-center justify-center gap-2 bg-[#3B82F6] px-4 py-2 text-sm font-bold text-white"
        >
          <Plus className="size-4" />
          New Session
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 && !isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No sessions yet.
          </p>
        ) : (
          sessions.map((session) => {
            const displayTitle = session.title || "New Session";

            return (
              <button
                key={session.sessionId}
                onClick={() => onSelectSession(session.sessionId)}
                className={`group w-full cursor-pointer border-b-2 border-black px-4 py-3 text-left transition-colors ${
                  activeSessionId === session.sessionId
                    ? "bg-[#DBEAFE]"
                    : "hover:bg-[#DBEAFE]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-bold ${
                        !session.title ? "italic text-muted-foreground" : ""
                      }`}
                      title={displayTitle}
                    >
                      {displayTitle}
                    </p>
                    {session.lastMessageAt && (
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {formatRelativeTime(session.lastMessageAt)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.sessionId);
                    }}
                    aria-label="Delete session"
                    className="shrink-0 p-1 opacity-0 transition-all hover:text-[#EF4444] group-hover:opacity-100"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </button>
            );
          })
        )}

        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="size-5 animate-spin text-[#3B82F6]" />
          </div>
        )}

        {hasMore && !isLoading && (
          <button
            onClick={onLoadMore}
            className="w-full py-3 text-sm font-bold text-[#3B82F6] transition-colors hover:bg-[#DBEAFE]"
          >
            Load more
          </button>
        )}
      </div>
    </aside>
  );
}
