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
import { deleteAdminAccount } from "@/lib/admin-api";
import { AuthError } from "@/lib/auth-fetch";
import { useToast } from "@/contexts/toast-context";
import type { AdminResponse } from "@/types/admin";

interface DeleteDialogProps {
  admin: AdminResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteDialog({
  admin,
  open,
  onOpenChange,
  onDeleted,
}: DeleteDialogProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!admin) return;

    setLoading(true);
    try {
      await deleteAdminAccount(admin.id);
      showToast("Account deleted successfully.", "success");
      onOpenChange(false);
      onDeleted();
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.status === 403) {
          showToast("Cannot delete your own account.", "error");
        } else if (err.status === 404) {
          showToast("Admin account not found.", "error");
        } else {
          showToast(err.message, "error");
        }
      } else {
        showToast("Failed to delete account.", "error");
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
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this account?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {admin && (
          <div className="mb-4 space-y-1 text-sm">
            <p>
              <span className="font-bold">Email:</span> {admin.email}
            </p>
            <p>
              <span className="font-bold">Username:</span> {admin.username}
            </p>
          </div>
        )}

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
