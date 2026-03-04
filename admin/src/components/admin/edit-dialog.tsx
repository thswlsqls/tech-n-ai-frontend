"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateAdminAccount } from "@/lib/admin-api";
import { AuthError } from "@/lib/auth-fetch";
import { useToast } from "@/contexts/toast-context";
import { validateUsername, validatePassword } from "@/lib/utils";
import type { AdminResponse } from "@/types/admin";

interface EditDialogProps {
  admin: AdminResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditDialog({
  admin,
  open,
  onOpenChange,
  onUpdated,
}: EditDialogProps) {
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && admin) {
      setUsername(admin.username);
      setPassword("");
      setErrors({});
      setTouched({});
    }
  }, [open, admin]);

  function validateField(name: string, value: string) {
    let error: string | null = null;
    if (name === "username") error = validateUsername(value);
    if (name === "password" && value) error = validatePassword(value);

    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
    return error;
  }

  function handleBlur(name: string, value: string) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  }

  function handleChange(name: string, value: string) {
    if (touched[name]) validateField(name, value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!admin) return;

    const usernameErr = validateField("username", username);
    const passwordErr = password ? validateField("password", password) : null;
    setTouched({ username: true, ...(password ? { password: true } : {}) });

    if (usernameErr || passwordErr) return;

    setLoading(true);
    try {
      const req: { username?: string; password?: string } = { username };
      if (password) req.password = password;
      await updateAdminAccount(admin.id, req);
      showToast("Account updated successfully.", "success");
      onOpenChange(false);
      onUpdated();
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.code === "VALIDATION_ERROR") {
          const msg = (err.serverMessage ?? "").toLowerCase();
          if (msg.includes("username")) {
            setErrors((prev) => ({
              ...prev,
              username: "This username is already taken.",
            }));
            setTouched((prev) => ({ ...prev, username: true }));
          } else {
            showToast(err.message, "error");
          }
        } else {
          showToast(err.message, "error");
        }
      } else {
        showToast("Failed to update account.", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>Update administrator account information.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold uppercase tracking-wide text-gray-400">
              Email (readonly)
            </label>
            <p className="text-sm">{admin?.email}</p>
          </div>

          <div>
            <label
              htmlFor="edit-username"
              className="mb-1.5 block text-sm font-bold uppercase tracking-wide"
            >
              Username
            </label>
            <input
              id="edit-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                handleChange("username", e.target.value);
              }}
              onBlur={() => handleBlur("username", username)}
              className="brutal-border w-full px-4 py-3 text-base focus:border-[#3B82F6] focus:outline-none"
            />
            {touched.username && errors.username && (
              <p className="mt-1 text-sm text-[#EF4444]" aria-live="polite">
                {errors.username}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-password"
              className="mb-1.5 block text-sm font-bold uppercase tracking-wide"
            >
              New Password (optional)
            </label>
            <input
              id="edit-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                handleChange("password", e.target.value);
              }}
              onBlur={() => handleBlur("password", password)}
              placeholder="Enter new password (optional)"
              className="brutal-border w-full px-4 py-3 text-base focus:border-[#3B82F6] focus:outline-none"
            />
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-[#EF4444]" aria-live="polite">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="brutal-border brutal-shadow-sm brutal-hover bg-white px-4 py-2 text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              aria-disabled={loading || undefined}
              className="brutal-border brutal-shadow-sm brutal-hover bg-[#3B82F6] px-4 py-2 text-sm font-bold text-white disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="mx-auto size-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
