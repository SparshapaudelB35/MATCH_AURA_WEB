"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const leftText = pathname === "/login"
        ? {
            title: "Where real connections begin",
            subtitle: "Match with people who share your energy, values,intentions and aura."
        }
        : pathname === "/register"
            ? {
                title: "Create your profile",
                subtitle: "Let your aura lead the way to love."
            }
            : null;

    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[30%_70%]">
            {/* Left panel */}
            <div className="relative hidden lg:flex flex-col justify-center px-16 overflow-hidden rounded-md">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-600/80 via-pink-500/70 to-fuchsia-600/80" />
                <div className="mb-1 flex justify-left">
                    <Image src="/images/logo.png" alt="Logo" width={120} height={120} priority />
                </div>
                {leftText && (
                    <div className="relative z-10 max-w-md text-white space-y-4">
                        <h1 className="text-4xl font-extrabold leading-tight">{leftText.title}</h1>
                        <p className="text-white/80">{leftText.subtitle}</p>
                    </div>
                )}
            </div>

            {/* Right panel */}
            <div className="flex items-center justify-center w-full min-h-screen px-4 sm:px-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-900">
                {children}
            </div>
        </div>

    );
}
