"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => href === "/admin" ? pathname === href : pathname?.startsWith(href);

    return (
        <aside className="sticky top-0 h-screen w-64 overflow-y-auto border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-900 font-bold text-white dark:bg-white dark:text-gray-900">A</div>
                    <span className="font-semibold">Admin Panel</span>
                </Link>
            </div>

            <nav className="space-y-1 p-2">
                {
                    ADMIN_LINKS.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive(link.href)
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span>{link.label}</span>
                        </Link >
                    ))
                }
            </nav >
        </aside >
    );
}
