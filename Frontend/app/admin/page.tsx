import { getAuthToken } from "@/lib/cookie";

interface DashboardUser {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    gender?: "male" | "female" | "other";
    role?: "user" | "admin";
    onboardingCompleted?: boolean;
    imageUrl?: string;
    profileImages?: string[];
    matchedUsers?: string[];
    createdAt?: string;
    updatedAt?: string;
}

interface AdminUsersResponse {
    success?: boolean;
    data?: DashboardUser[];
}

const getUsers = async () => {
    try {
        const token = await getAuthToken();
        if (!token) return [] as DashboardUser[];

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
        const res = await fetch(`${baseUrl}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) return [] as DashboardUser[];
        const json = (await res.json()) as AdminUsersResponse;
        return Array.isArray(json.data) ? json.data : [];
    } catch {
        return [] as DashboardUser[];
    }
};

export default async function Page() {
    const users = await getUsers();

    const totalUsers = users.length;
    const today = new Date().toISOString().slice(0, 10);

    const joinedToday = users.filter((user) => user.createdAt?.slice(0, 10) === today).length;
    const onboardingCompleted = users.filter((user) => Boolean(user.onboardingCompleted)).length;
    const profilesWithPhotos = users.filter(
        (user) => Boolean(user.imageUrl) || (Array.isArray(user.profileImages) && user.profileImages.length > 0)
    ).length;
    const totalMatchLinks = users.reduce((sum, user) => sum + (Array.isArray(user.matchedUsers) ? user.matchedUsers.length : 0), 0);

    const genderCounts = users.reduce(
        (acc, user) => {
            if (user.gender === "male") acc.male += 1;
            if (user.gender === "female") acc.female += 1;
            if (user.gender === "other") acc.other += 1;
            return acc;
        },
        { male: 0, female: 0, other: 0 }
    );

    const weeklyLabels = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return date.toISOString().slice(5, 10);
    });

    const weeklyCounts = weeklyLabels.map((label) => {
        const count = users.filter((user) => user.createdAt?.slice(5, 10) === label).length;
        return { label, count };
    });

    const maxWeeklyCount = Math.max(...weeklyCounts.map((item) => item.count), 1);

    const recentUsers = [...users]
        .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        })
        .slice(0, 6);

    const updatedAtValues = users
        .map((user) => user.updatedAt)
        .filter((value): value is string => Boolean(value))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const lastUpdated = updatedAtValues[0] ? new Date(updatedAtValues[0]).toLocaleString() : "-";

    return (
        <section className="space-y-6 py-6">
            <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-cyan-100 via-white to-orange-100 p-6 shadow-sm">
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-cyan-300/40 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-orange-300/30 blur-2xl" />
                <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">Control Center</p>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">Admin Dashboard</h1>
                        <p className="text-sm text-gray-700 md:text-base">All widgets below are built directly from your real user records.</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">
                        Last updated: <span className="font-semibold text-gray-900">{lastUpdated}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <div className="mt-3 flex items-end justify-between">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{totalUsers.toLocaleString()}</h2>
                        <span className="text-xs font-semibold text-emerald-600">Live</span>
                    </div>
                </article>
                <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-sm font-medium text-gray-600">Joined Today</p>
                    <div className="mt-3 flex items-end justify-between">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{joinedToday.toLocaleString()}</h2>
                        <span className="text-xs font-semibold text-cyan-600">Daily</span>
                    </div>
                </article>
                <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-sm font-medium text-gray-600">Onboarding Complete</p>
                    <div className="mt-3 flex items-end justify-between">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{onboardingCompleted.toLocaleString()}</h2>
                        <span className="text-xs font-semibold text-lime-600">
                            {totalUsers > 0 ? `${Math.round((onboardingCompleted / totalUsers) * 100)}%` : "0%"}
                        </span>
                    </div>
                </article>
                <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-sm font-medium text-gray-600">Total Match Links</p>
                    <div className="mt-3 flex items-end justify-between">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{totalMatchLinks.toLocaleString()}</h2>
                        <span className="text-xs font-semibold text-orange-600">From users</span>
                    </div>
                </article>
            </div>

            <div className="grid gap-4 xl:grid-cols-5">
                <article className="xl:col-span-3 rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">New Users (Last 7 Days)</h3>
                        <span className="text-xs text-gray-500">From createdAt</span>
                    </div>
                    <div className="mt-5 grid grid-cols-7 gap-2">
                        {weeklyCounts.map((item) => (
                            <div key={item.label} className="flex flex-col items-center gap-2">
                                <div className="flex h-28 w-full items-end">
                                    <div
                                        className="w-full rounded-t-md bg-cyan-500"
                                        style={{ height: `${Math.max((item.count / maxWeeklyCount) * 100, item.count > 0 ? 12 : 0)}%` }}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{item.count}</span>
                                <span className="text-[11px] text-gray-500">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="xl:col-span-2 rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                        <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-700">
                            {recentUsers.length} shown
                        </span>
                    </div>
                    <ul className="mt-4 space-y-3">
                        {recentUsers.length === 0 ? (
                            <li className="rounded-lg border border-gray-100 p-3 text-sm text-gray-500">No users found.</li>
                        ) : (
                            recentUsers.map((user) => (
                                <li key={user._id} className="rounded-lg border border-gray-100 p-3">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || user._id}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-600">{user.email || "No email"}</p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Joined {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                                    </p>
                                </li>
                            ))
                        )}
                    </ul>
                </article>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900">Gender Distribution</h3>
                    <p className="mt-2 text-sm text-gray-600">Based on user profile gender field.</p>
                    <div className="mt-4 space-y-3">
                        {[
                            { label: "Male", value: genderCounts.male, color: "bg-cyan-500" },
                            { label: "Female", value: genderCounts.female, color: "bg-orange-500" },
                            { label: "Other", value: genderCounts.other, color: "bg-lime-500" },
                        ].map((row) => (
                            <div key={row.label}>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span className="font-medium text-gray-700">{row.label}</span>
                                    <span className="text-gray-500">{row.value}</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-gray-100">
                                    <div
                                        className={`h-2.5 rounded-full ${row.color}`}
                                        style={{ width: `${totalUsers > 0 ? (row.value / totalUsers) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                    <p className="mt-2 text-sm text-gray-600">Directly derived from onboarding and image fields.</p>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-emerald-50 p-3">
                            <p className="text-xs text-emerald-700">Onboarded</p>
                            <p className="mt-1 text-lg font-bold text-emerald-800">{onboardingCompleted}</p>
                        </div>
                        <div className="rounded-lg bg-cyan-50 p-3">
                            <p className="text-xs text-cyan-700">With Photos</p>
                            <p className="mt-1 text-lg font-bold text-cyan-800">{profilesWithPhotos}</p>
                        </div>
                        <div className="rounded-lg bg-orange-50 p-3">
                            <p className="text-xs text-orange-700">Completion</p>
                            <p className="mt-1 text-lg font-bold text-orange-800">
                                {totalUsers > 0 ? `${Math.round((onboardingCompleted / totalUsers) * 100)}%` : "0%"}
                            </p>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
