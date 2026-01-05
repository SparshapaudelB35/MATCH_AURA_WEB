"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RegisterData, registerSchema } from "../schema";

export default function RegisterForm() {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
    });

    const submit = async (values: RegisterData) => {
        startTransition(async () => {
            // Simulate account creation
            await new Promise((resolve) => setTimeout(resolve, 1500));
            console.log("Welcome to the community!", values);
            router.push("/login");
        });
    };

    return (
        <div className="w-full max-w-xl p-14 space-y-12 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-center space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r  from-pink-500 to-rose-500 bg-clip-text text-transparent">
                    Create Account
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                    Your journey to find "the one" starts here.
                </p>
            </div>

            <form onSubmit={handleSubmit(submit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1" htmlFor="email">
                        Full Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register("name")}
                        placeholder="Jane Doe"
                        className="h-16 w-full rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-6 text-lg outline-none transition-all focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    {errors.name?.message && (
                        <p className="text-xs text-rose-500 font-medium ml-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="name@example.com"
                        className="h-16 w-full rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-6 text-lg outline-none transition-all focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    {errors.email?.message && (
                        <p className="text-sm text-rose-500 font-medium ml-1">{errors.email.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-bold uppercase tracking-wider text-zinc-400" htmlFor="password">
                                Password
                            </label>
                        </div>
                        <input
                            id="password"
                            type="password"
                            {...register("password")}
                            placeholder="••••••••"
                            className="h-16 w-full rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-6 text-lg outline-none transition-all focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                        {errors.password?.message && (
                            <p className="text-sm text-rose-500 font-medium ml-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-bold uppercase tracking-wider text-zinc-400" htmlFor="password">
                                Confirm Password
                            </label>
                        </div>
                        <input
                            id="password"
                            type="password"
                            {...register("password")}
                            placeholder="••••••••"
                            className="h-16 w-full rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-6 text-lg outline-none transition-all focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                        {errors.password?.message && (
                            <p className="text-sm text-rose-500 font-medium ml-1">{errors.password.message}</p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || pending}
                    className="group relative h-16 w-full rounded-3xl bg-gradient-to-r from-pink-500 to-rose-500 font-bold text-white shadow-2xl text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
                >
                    <span className="relative z-10">
                        {isSubmitting || pending ? "Finding your profile..." : "Join Now"}
                    </span>
                </button>

                <p className="text-[15px] text-center text-zinc-400 px-4">
                    By clicking "Join Now", you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>.
                </p>

                <div className="text-center text-base text-zinc-500 pt-2">
                    Already a member?{" "}
                    <Link href="/login" className="font-bold text-rose-500 hover:text-rose-600 transition-colors">
                        Log in
                    </Link>
                </div>
            </form>
        </div>
    );
}