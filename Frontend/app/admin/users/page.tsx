"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username: string;
  role?: "user" | "admin";
  gender?: "male" | "female" | "other";
  onboardingCompleted?: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UsersApiResponse {
  success?: boolean;
  message?: string;
  data?: User[];
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
};

const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "-");

const isToday = (value?: string) => {
  if (!value) return false;
  return new Date(value).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  const fetchUsers = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = (await res.json()) as UsersApiResponse;
      if (!res.ok || payload.success === false) {
        throw new Error(payload.message || "Failed to fetch users");
      }

      const normalizedUsers = (Array.isArray(payload.data) ? payload.data : [])
        .filter((user) => user.role !== "admin")
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });

      setUsers(normalizedUsers);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      if (showLoader) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim().toLowerCase();
      return (
        fullName.includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term)
      );
    });
  }, [users, query]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      joinedToday: users.filter((user) => isToday(user.createdAt)).length,
      onboarded: users.filter((user) => Boolean(user.onboardingCompleted)).length,
      withPhotos: users.filter((user) => Boolean(user.imageUrl)).length,
    };
  }, [users]);

  const total = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pagedUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm("Delete this user? This action cannot be undone.");
    if (!confirmed) return;

    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const payload = (await res.json()) as UsersApiResponse;
      if (!res.ok || payload.success === false) {
        throw new Error(payload.message || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((user) => user._id !== userId));
      toast.success("User deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-6 py-6">
      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-orange-100 via-white to-cyan-100 p-6 shadow-sm">
        <div className="absolute -left-8 -top-8 h-36 w-36 rounded-full bg-orange-300/30 blur-2xl" />
        <div className="absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-cyan-300/30 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">Admin Management</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">Users Panel</h1>
            <p className="mt-1 text-sm text-zinc-700">Manage all non-admin accounts from one workspace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fetchUsers(false)}
              disabled={refreshing}
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <Link
              href="/admin/users/create"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Create User
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-600">Total Users</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.total.toLocaleString()}</p>
        </article>
        <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-600">Joined Today</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.joinedToday.toLocaleString()}</p>
        </article>
        <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-600">Onboarding Complete</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.onboarded.toLocaleString()}</p>
        </article>
        <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-600">Profiles With Photo</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.withPhotos.toLocaleString()}</p>
        </article>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-zinc-500">Loading users...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, username, or email"
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 lg:max-w-md"
            />
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
              <span>
                Showing {total === 0 ? 0 : startIndex + 1}-{endIndex} of {total}
              </span>
              <div className="flex items-center gap-2">
                <span>Rows</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-zinc-300 px-2 py-1.5"
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
              <p className="text-zinc-700">No users matched your search.</p>
              <p className="mt-1 text-sm text-zinc-500">Try a different keyword or clear the search input.</p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm md:block">
                <table className="min-w-full divide-y divide-zinc-200">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Username</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Gender</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Onboarding</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Created</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedUsers.map((user) => {
                      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed user";
                      return (
                        <tr key={user._id} className="border-t border-zinc-100 hover:bg-zinc-50/70">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {user.imageUrl ? (
                                <img
                                  src={`${baseUrl}${user.imageUrl}`}
                                  className="h-10 w-10 rounded-full object-cover"
                                  alt={`${fullName} avatar`}
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                                  {(user.firstName?.[0] || "U").toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-zinc-900">{fullName}</p>
                                <p className="text-xs text-zinc-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-700">{user.username}</td>
                          <td className="px-4 py-3 text-sm text-zinc-700 capitalize">{user.gender || "-"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                user.onboardingCompleted
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-zinc-100 text-zinc-700"
                              }`}
                            >
                              {user.onboardingCompleted ? "Complete" : "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-600">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                href={`/admin/users/edit/${user._id}`}
                                className="inline-flex items-center rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(user._id)}
                                disabled={deletingId === user._id}
                                className="inline-flex items-center rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                              >
                                {deletingId === user._id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {pagedUsers.map((user) => {
                  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed user";
                  return (
                    <article key={user._id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{fullName}</p>
                          <p className="text-xs text-zinc-600">@{user.username}</p>
                          <p className="mt-1 text-xs text-zinc-500">{user.email}</p>
                        </div>
                        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold capitalize text-zinc-700">
                          {user.gender || "-"}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
                        <span>{user.onboardingCompleted ? "Onboarding complete" : "Onboarding pending"}</span>
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Link
                          href={`/admin/users/edit/${user._id}`}
                          className="inline-flex items-center rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={deletingId === user._id}
                          className="inline-flex items-center rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-600 disabled:opacity-60"
                        >
                          {deletingId === user._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={safePage === 1}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-zinc-600">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safePage === totalPages}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
