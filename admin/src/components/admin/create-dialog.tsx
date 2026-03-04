"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createAdminAccount } from "@/lib/admin-api";
import { AuthError } from "@/lib/auth-fetch";
import { useToast } from "@/contexts/toast-context";
import { validateEmail, validateUsername, validatePassword } from "@/lib/utils";

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateDialogProps) {
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setEmail("");
    setUsername("");
    setPassword("");
    setErrors({});
    setTouched({});
  }

  function validateField(name: string, value: string) {
    let error: string | null = null;
    if (name === "email") error = validateEmail(value);
    if (name === "username") error = validateUsername(value);
    if (name === "password") error = validatePassword(value);

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

    const emailErr = validateField("email", email);
    const usernameErr = validateField("username", username);
    const passwordErr = validateField("password", password);
    setTouched({ email: true, username: true, password: true });

    if (emailErr || usernameErr || passwordErr) return;

    setLoading(true);
    try {
      await createAdminAccount({ email, username, password });
      showToast("Account created successfully.", "success");
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      if (err instanceof AuthError) {
        // Handle field-specific server errors
        if (err.code === "VALIDATION_ERROR") {
          const msg = (err.serverMessage ?? "").toLowerCase();
          if (msg.includes("email")) {
            setErrors((prev) => ({ ...prev, email: "This email is already in use." }));
            setTouched((prev) => ({ ...prev, email: true }));
          } else if (msg.includes("username")) {
            setErrors((prev) => ({ ...prev, username: "This username is already taken." }));
            setTouched((prev) => ({ ...prev, username: true }));
          } else {
            showToast(err.message, "error");
          }
        } else {
          showToast(err.message, "error");
        }
      } else {
        showToast("Failed to create account.", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>Add a new administrator account.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="create-email"
              className="mb-1.5 block text-sm font-bold uppercase tracking-wide"
            >
              Email
            </label>
            <input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                handleChange("email", e.target.value);
              }}
              onBlur={() => handleBlur("email", email)}
              placeholder="admin@example.com"
              className="brutal-border w-full px-4 py-3 text-base focus:border-[#3B82F6] focus:outline-none"
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-[#EF4444]" aria-live="polite">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="create-username"
              className="mb-1.5 block text-sm font-bold uppercase tracking-wide"
            >
              Username
            </label>
            <input
              id="create-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                handleChange("username", e.target.value);
              }}
              onBlur={() => handleBlur("username", username)}
              placeholder="Enter username"
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
              htmlFor="create-password"
              className="mb-1.5 block text-sm font-bold uppercase tracking-wide"
            >
              Password
            </label>
            <input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                handleChange("password", e.target.value);
              }}
              onBlur={() => handleBlur("password", password)}
              placeholder="Enter password"
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
              onClick={() => handleOpenChange(false)}
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
                "Create"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
