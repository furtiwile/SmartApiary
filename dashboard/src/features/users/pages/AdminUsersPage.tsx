import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Trash2, UserX, Users } from "lucide-react";
import { PageLayout } from "../../../layouts/PageLayout";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { useNotify } from "../../../hooks/useNotify";
import { useApis } from "../../../shared/api/useApis";
import type { UserDto } from "../models/UserDto";

type PendingAction = {
  type: "suspend" | "delete";
  user: UserDto;
} | null;

function fullName(user: UserDto) {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { auth: authApi } = useApis();
  const { success, error } = useNotify();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => authApi.getUsers(),
  });

  const userCounts = useMemo(() => {
    return users.reduce(
      (counts, user) => ({
        total: counts.total + 1,
        active: counts.active + (user.isActive === false ? 0 : 1),
      }),
      { total: 0, active: 0 }
    );
  }, [users]);

  async function confirmAction() {
    if (!pendingAction) return;

    const { type, user } = pendingAction;
    const ok = type === "delete"
      ? await authApi.deleteUser(user.id)
      : await authApi.suspendUser(user.id);

    if (!ok) {
      error("Action failed", "The user could not be updated. Please try again.");
      setPendingAction(null);
      return;
    }

    if (type === "delete") {
      queryClient.setQueryData<UserDto[]>(["admin-users"], (old) =>
        old?.filter((item) => item.id !== user.id)
      );
      success("User deleted", `${fullName(user)} has been removed.`);
    } else {
      queryClient.setQueryData<UserDto[]>(["admin-users"], (old) =>
        old?.map((item) => item.id === user.id ? { ...item, isActive: false } : item)
      );
      success("User suspended", `${fullName(user)} has been suspended.`);
    }

    setPendingAction(null);
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
              <Users className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-200 tracking-tight">Users</h1>
              <p className="text-slate-400 text-sm">
                {userCounts.total} total, {userCounts.active} active
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 p-20">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500" />
              <span className="text-slate-400 font-medium">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-slate-700" />
              <p className="font-medium text-slate-400">No users found</p>
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-slate-900/40">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Phone</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">Role</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user) => {
                  const isActive = user.isActive !== false;
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/70">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-200">{fullName(user)}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{user.phoneNumber || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
                          <Shield className="h-3 w-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        }`}>
                          {isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            disabled={!isActive}
                            onClick={() => setPendingAction({ type: "suspend", user })}
                            title="Suspend user"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            Suspend
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingAction({ type: "delete", user })}
                            title="Delete user"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-800/40 bg-rose-500/5 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => { if (!open) setPendingAction(null); }}
        title={pendingAction?.type === "delete" ? "Delete user?" : "Suspend user?"}
        description={
          pendingAction
            ? `${fullName(pendingAction.user)} will ${pendingAction.type === "delete" ? "be permanently deleted" : "no longer be able to use the system"}.`
            : ""
        }
        confirmLabel={pendingAction?.type === "delete" ? "Delete User" : "Suspend User"}
        onConfirm={confirmAction}
      />
    </PageLayout>
  );
}
