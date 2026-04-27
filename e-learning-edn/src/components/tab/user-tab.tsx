"use client";
import { useEffect, useMemo, useState } from "react";
import { GetUsers, UpdateUser, DeleteUser, CreateUser } from "@/scripts/Api";
import { SkeletonTableRow } from "@/components/ui/skeleton";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Role = "admin" | "user";
const PAGE_SIZE = 10;

export default function UserTab({
  currentUserId,
}: {
  currentUserId: number | string;
}) {
  const [users, setUsers] = useState<UserApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // actions par ligne
  const [savingRoleId, setSavingRoleId] = useState<number | string | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [page, setPage] = useState(1);

  // modal création
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<Role>("user");
  const [creating, setCreating] = useState(false);

  const roles: Role[] = useMemo(() => ["user", "admin"], []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GetUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Erreur lors de la récupération des utilisateurs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onChangeRole = async (userId: number | string, nextRole: Role) => {
    // update optimiste
    const prev = users;
    setUsers((u) =>
      u.map((x) => (x.id === userId ? { ...x, role: nextRole } : x))
    );

    setSavingRoleId(userId);
    try {
      const updated = await UpdateUser(userId, { role: nextRole });
      if (!updated) throw new Error("Mise à jour impossible");
      // optionnel: sync exacte depuis backend
      setUsers((u) => u.map((x) => (x.id === userId ? updated : x)));
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erreur lors de la mise à jour du rôle");
      // rollback
      setUsers(prev);
    } finally {
      setSavingRoleId(null);
    }
  };

  const onDeleteUser = async (userId: number | string) => {
    const user = users.find((u) => u.id === userId);
    const ok = window.confirm(
      `Supprimer l'utilisateur ${
        user?.email ?? ""
      } ? Cette action est irréversible.`
    );
    if (!ok) return;

    setDeletingId(userId);
    try {
      const success = await DeleteUser(userId);
      if (!success) throw new Error("Suppression impossible");
      setUsers((u) => u.filter((x) => x.id !== userId));
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const onCreateUser = async () => {
    if (!createEmail.trim() || !createPassword.trim()) {
      setError("Email et mot de passe requis");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const res = await CreateUser({
        email: createEmail.trim(),
        password: createPassword,
        role: createRole,
      });
      if (!res.ok || !res.data) throw new Error(res.message || "Création impossible");

      setUsers((u) => [res.data!, ...u]);

      // reset + fermer
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("user");
      setIsCreateOpen(false);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const visibleUsers = users.filter((u) => u.id !== currentUserId);
  const totalPages = Math.max(1, Math.ceil(visibleUsers.length / PAGE_SIZE));
  const paginatedUsers = visibleUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Utilisateurs</h2>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + Créer un utilisateur
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead className="edn-degraded text-white text-left">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rôle</th>
              <th className="px-4 py-2">Créé le</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />)
              : null}
            {!loading && paginatedUsers.map((user, idx) => {
              const isSaving = savingRoleId === user.id;
              const isDeleting = deletingId === user.id;

              return (
                <tr
                  key={user.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-2">{user.email}</td>

                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded border border-gray-300 bg-white px-2 py-1"
                        value={(user.role as Role) || "user"}
                        disabled={isSaving || isDeleting}
                        onChange={(e) =>
                          onChangeRole(user.id, e.target.value as Role)
                        }>
                        {roles.map((r) => (
                          <option
                            key={r}
                            value={r}>
                            {r}
                          </option>
                        ))}
                      </select>

                      {isSaving && (
                        <span className="text-xs text-gray-500">
                          Sauvegarde…
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => onDeleteUser(user.id)}
                      disabled={isDeleting || isSaving}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:opacity-60">
                      {isDeleting ? "Suppression…" : "Supprimer"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {!loading && visibleUsers.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={4}>
                  Aucun utilisateur
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, visibleUsers.length)} sur {visibleUsers.length}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-50">
              <FaChevronLeft className="text-xs" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-3 py-1 rounded border text-xs ${p === page ? "bg-gray-200 font-bold" : "hover:bg-gray-50"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-50">
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      )}

      {/* Modal création */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">Créer un utilisateur</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Email nom de domaine obligatoire (ccir-campus.re)
                </label>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  type="email"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Mot de passe
                </label>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">Rôle</label>
                <select
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2"
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as Role)}>
                  {roles.map((r) => (
                    <option
                      key={r}
                      value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  disabled={creating}>
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={onCreateUser}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={creating}>
                  {creating ? "Création…" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
