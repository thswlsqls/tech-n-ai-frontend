"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { deleteAgentSession } from "@/lib/agent-api";
import { AuthError } from "@/lib/auth-fetch";
import { useToast } from "@/contexts/toast-context";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string | null;
  onDeleted: (sessionId: string) => void;
}

export function AgentDeleteDialog({
  open,
  onOpenChange,
  sessionId,
  onDeleted,
}: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!sessionId) return;

    setLoading(true);
    try {
      await deleteAgentSession(sessionId);
      showToast("Session deleted successfully.", "success");
      onDeleted(sessionId);
    } catch (err) {
      if (err instanceof AuthError) {
        showToast(err.message, "error");
      } else {
        showToast("Failed to delete session.", "error");
      }
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Session</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this session? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex justify-end gap-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <button
            onClick={handleDelete}
            disabled={loading}
            aria-disabled={loading || undefined}
            className="brutal-border brutal-shadow-sm brutal-hover bg-[#EF4444] px-4 py-2 text-sm font-bold text-white disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="mx-auto size-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
