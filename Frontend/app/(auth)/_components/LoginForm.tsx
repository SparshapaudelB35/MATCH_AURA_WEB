"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";
import { handleLogin } from "@/lib/actions/auth-action";

export default function LoginForm() {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit",
    });
    const [error, setError] = useState("");
    const onSubmit = async (values: LoginData) => {
        // call action here
        setError("");
        try {
            const res = await handleLogin(values);
            if (!res.success) {
                throw new Error(res.message || "Login failed");
            }
            // handle redirect (optional)
            startTransition(() => {
                router.push("/auth/dashboard");
            });
        } catch (err: Error | any) {
            setError(err.message || "Login failed");
        }
    };

    return (
        <div className="w-full max-w-xl p-14 space-y-12 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800">
            {/* Header Section */}
            <div className="text-center space-y-3">
                <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                    Welcome back
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                    Ready to find your perfect match?
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

                {/* Email Field */}
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register("email")}  // change here
                        placeholder="name@example.com"
                        className="h-16 w-full rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-6 text-lg outline-none transition-all focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    {errors.email?.message && (
                        <p className="text-sm text-rose-500 font-medium ml-1">{errors.email.message}</p>
                    )}
                </div>


                {/* Password Field */}
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

                {/* Meta Info */}
                <div className="flex justify-between text-sm text-zinc-400">
                    <span>Private & secure</span>
                    <Link href="#" className="hover:text-rose-500 transition">Forgot password?</Link>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || pending}
                    className="group relative h-16 w-full rounded-3xl bg-gradient-to-r from-pink-500 to-rose-500 font-bold text-white shadow-2xl text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
                >
                    <span className="relative z-10">
                        {isSubmitting || pending ? "Finding your profile..." : "Sign In"}
                    </span>
                </button>

                {/* Footer Link */}
                <div className="text-center text-base text-zinc-500">
                    New here?{" "}
                    <Link href="/register" className="font-bold text-rose-500 hover:text-rose-600 transition-colors">
                        Create an account
                    </Link>
                </div>
            </form>
        </div>
    );

}