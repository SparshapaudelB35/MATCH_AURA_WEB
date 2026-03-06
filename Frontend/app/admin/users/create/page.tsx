import CreateUserForm from "../_component/CreateUserForm";
import Link from "next/link";


export default function Page() {
    return (
        <section className="mx-auto max-w-4xl space-y-6 py-6">
            <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-cyan-100 via-white to-orange-100 p-6 shadow-sm">
                <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-cyan-300/40 blur-2xl" />
                <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-orange-300/40 blur-2xl" />
                <div className="relative z-10">
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center rounded-lg border border-zinc-300 bg-white/90 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-white"
                    >
                        {"<-"} Back to Users
                    </Link>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Admin Management</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">Create User</h1>
                    <p className="mt-1 text-sm text-zinc-700">Add a new account with complete profile and secure credentials.</p>
                </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
                <CreateUserForm />
            </div>
        </section>
    );
}
