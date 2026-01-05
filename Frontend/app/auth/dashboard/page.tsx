import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
            <div className="w-full max-w-3xl p-12 space-y-8 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-700 text-center">
                <div className="flex justify-center">
                    <Image src="/images/logo.png" alt="Logo" width={96} height={96} />
                </div>

                <h1 className="text-4xl font-extrabold">Welcome to your Dashboard</h1>
                <p className="text-zinc-500">This is a dummy page that you can use as a landing page after sign in.</p>

                <div className="space-x-4">
                    <Link href="/" className="inline-block rounded-lg px-6 py-3 bg-zinc-100 dark:bg-zinc-700 font-semibold hover:opacity-90">
                        Home
                    </Link>
                    <Link href="/login" className="inline-block rounded-lg px-6 py-3 bg-rose-500 text-white font-semibold hover:opacity-90">
                        Sign out
                    </Link>
                </div>
            </div>
        </div>
    );
}
