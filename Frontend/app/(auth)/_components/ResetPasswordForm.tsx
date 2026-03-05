"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ResetPasswordData, resetPasswordSchema } from "../schema";
import { handleResetPassword } from "@/lib/actions/auth-action";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [serverError, setServerError] = useState("");
    const [serverMessage, setServerMessage] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onSubmit",
    });

    const onSubmit = async (values: ResetPasswordData) => {
        setServerError("");
        setServerMessage("");

        if (!token) {
            setServerError("Reset token is missing. Open the link from your email again.");
            return;
        }

        const res = await handleResetPassword(token, values);
        if (!res.success) {
            setServerError(res.message || "Unable to reset password");
            return;
        }

        setServerMessage(res.message);
        setTimeout(() => {
            router.push("/login");
        }, 1200);
    };

    return (
        <div className="w-full max-w-xl p-14 space-y-10 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                    Set new password
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-base">
                    Choose a secure password for your account.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1" htmlFor="password">
                        New Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        {...register("password")}
                        className="h-14 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-5 text-base outline-none transition-all focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    {errors.password?.message && (
                        <p className="text-sm text-rose-500 font-medium ml-1">{errors.password.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1" htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        {...register("confirmPassword")}
                        className="h-14 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-5 text-base outline-none transition-all focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    {errors.confirmPassword?.message && (
                        <p className="text-sm text-rose-500 font-medium ml-1">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {serverError && <p className="text-sm text-rose-500 font-medium">{serverError}</p>}
                {serverMessage && <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{serverMessage}</p>}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 font-bold text-white shadow-xl text-base transition-all hover:opacity-90 disabled:opacity-70"
                >
                    {isSubmitting ? "Updating password..." : "Reset password"}
                </button>

                <div className="text-center text-sm text-zinc-500">
                    Back to{" "}
                    <Link href="/login" className="font-bold text-rose-500 hover:text-rose-600 transition-colors">
                        Log in
                    </Link>
                </div>
            </form>
        </div>
    );
}
