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
import { AccountFormField } from "@/components/admin/account-form-field";

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
          <AccountFormField
            id="create-email"
            label="Email"
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value);
              handleChange("email", value);
            }}
            onBlur={() => handleBlur("email", email)}
            placeholder="admin@example.com"
            error={touched.email ? errors.email : undefined}
          />

          <AccountFormField
            id="create-username"
            label="Username"
            value={username}
            onChange={(value) => {
              setUsername(value);
              handleChange("username", value);
            }}
            onBlur={() => handleBlur("username", username)}
            placeholder="Enter username"
            error={touched.username ? errors.username : undefined}
          />

          <AccountFormField
            id="create-password"
            label="Password"
            type="password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              handleChange("password", value);
            }}
            onBlur={() => handleBlur("password", password)}
            placeholder="Enter password"
            error={touched.password ? errors.password : undefined}
          />

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
