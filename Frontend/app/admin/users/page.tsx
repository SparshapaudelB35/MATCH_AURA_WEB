"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role?: "user" | "admin";
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      setUsers(json.data || []);
    } catch (err: any) {
      toast.error(err.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const total = users.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pagedUsers = users.slice(startIndex, endIndex);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleString() : "-";

  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm("Delete this user? This action cannot be undone.");
    if (!confirmed) return;
    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Failed to delete user");
      }
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch (err: any) {
      toast.error(err.message || "Error deleting user");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Users</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage all accounts in one place.</p>
        </div>
        <Link
          href="/admin/users/create"
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-zinc-800 transition"
        >
          Create User
        </Link>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-zinc-500">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-zinc-100" />
          <p className="text-zinc-600">No users found.</p>
          <p className="text-sm text-zinc-400 mt-1">Create your first user to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-zinc-600">
            <span>
              Showing {startIndex + 1}-{endIndex} of {total}
            </span>
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-zinc-200 rounded-lg px-2 py-1.5 bg-white shadow-sm"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Username</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Created</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Updated</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-zinc-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.imageUrl ? (
                          <img
                            src={`${baseUrl}${user.imageUrl}`}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                            alt={`${user.firstName || "User"} avatar`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center text-xs font-semibold">
                            {(user.firstName?.[0] || "U").toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-zinc-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-zinc-500">{user._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-700">{user.username}</td>
                    <td className="px-5 py-4 text-sm text-zinc-700">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-600">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-4 text-sm text-zinc-600">{formatDate(user.updatedAt)}</td>
                    <td className="px-5 py-4 text-right">
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
                          className="inline-flex items-center rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        >
                          {deletingId === user._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-2 text-sm rounded-lg border border-zinc-200 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="text-sm text-zinc-600">
              Page {safePage} of {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-2 text-sm rounded-lg border border-zinc-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
