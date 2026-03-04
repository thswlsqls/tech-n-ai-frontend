"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/auth/header";
import { AccountsTable } from "@/components/admin/accounts-table";
import { CreateDialog } from "@/components/admin/create-dialog";
import { DetailDialog } from "@/components/admin/detail-dialog";
import { EditDialog } from "@/components/admin/edit-dialog";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { fetchAdminAccounts } from "@/lib/admin-api";
import { useToast } from "@/contexts/toast-context";
import type { AdminResponse } from "@/types/admin";

export default function AccountsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [accounts, setAccounts] = useState<AdminResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminResponse | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteAdmin, setDeleteAdmin] = useState<AdminResponse | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAccounts();
      setAccounts(data);
    } catch {
      showToast("Failed to load accounts.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/signin");
      return;
    }
    if (!isLoading && user) {
      loadAccounts();
    }
  }, [user, isLoading, router, loadAccounts]);

  if (isLoading || !user) return null;

  function handleView(admin: AdminResponse) {
    setDetailId(admin.id);
    setDetailOpen(true);
  }

  function handleEdit(admin: AdminResponse) {
    setEditAdmin(admin);
    setEditOpen(true);
  }

  function handleDelete(admin: AdminResponse) {
    setDeleteAdmin(admin);
    setDeleteOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Admin Accounts
          </h1>
          <button
            onClick={() => setCreateOpen(true)}
            className="brutal-border brutal-shadow-sm brutal-hover flex items-center gap-2 bg-[#3B82F6] px-4 py-2 text-sm font-bold text-white"
          >
            <Plus className="size-4" />
            Create Account
          </button>
        </div>

        <AccountsTable
          accounts={accounts}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={() => setCreateOpen(true)}
        />

        <CreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={loadAccounts}
        />

        <DetailDialog
          adminId={detailId}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />

        <EditDialog
          admin={editAdmin}
          open={editOpen}
          onOpenChange={setEditOpen}
          onUpdated={loadAccounts}
        />

        <DeleteDialog
          admin={deleteAdmin}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onDeleted={loadAccounts}
        />
      </main>
    </div>
  );
}
