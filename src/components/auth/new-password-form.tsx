"use client";

import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { login_logo } from "@/assets/icons";
import { INPUT_BASE, INPUT_ERROR, INPUT_NORMAL } from "@/lib/constants";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type NewPasswordFormValues = {
    password: string;
    confirmPassword: string;
};

/**
 * NewPasswordForm component for setting a new password after reset
 * Handles the password reset flow when users click the email link
 *
 * @example
 * ```tsx
 * // In reset-password page
 * <NewPasswordForm />
 * ```
 */
export function NewPasswordForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tokens, setTokens] = useState<{ access_token: string; refresh_token: string } | null>(null);

    const searchParams = useSearchParams();
    // const updatePasswordMutation = useUpdatePassword();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<NewPasswordFormValues>({
        defaultValues: { password: "", confirmPassword: "" },
        mode: "onBlur",
    });

    // Extract tokens from URL hash (Supabase auth redirect)
    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
            setTokens({ access_token: accessToken, refresh_token: refreshToken });
        }
    }, []);
    const isLoading = false;
    const password = watch("password");
    // const isLoading = updatePasswordMutation.isPending;

    const onSubmit = async (data: NewPasswordFormValues) => {
        if (!tokens) {
            console.error('No tokens available for password reset');
            return;
        }

        // The tokens are already in the session from the URL redirect
        // We just need to update the password
        // updatePasswordMutation.mutate({
        //     email: '', // Email not needed for password update with valid tokens
        //     password: data.password
        // });
    };

    // Show error if no tokens are available
    if (!tokens) {
        return (
            <section className="font-inter w-full flex justify-center items-center">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 flex flex-col items-center gap-8">
                    <Image src={login_logo} alt="Simba Logo" width={132} height={56} />
                    <div className="w-full text-center space-y-4">
                        <h2 className="font-inter text-lg font-semibold text-black">
                            Invalid Reset Link
                        </h2>
                        <p className="font-inter text-sm text-gray-600">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link
                            href="/reset-password"
                            className="inline-block w-full h-11 rounded-lg bg-gradient-to-b from-[#FF4250] to-[#D73742] text-sm font-medium text-white transition hover:brightness-110 flex items-center justify-center"
                            style={{
                                boxShadow: "0 4px 40px rgba(48,12,15,0.15), inset 0px -8px 8px #E43D48, inset 0px 8px 8px #FF4452",
                            }}
                        >
                            Request New Reset Link
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="font-inter w-full flex justify-center items-center">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 flex flex-col items-center gap-8">
                {/* Logo */}
                <Image src={login_logo} alt="Simba Logo" width={132} height={56} />

                {/* Heading + Subtext */}
                <div className="w-full text-center space-y-1 md:mt-10">
                    <h2 className="font-inter text-lg font-semibold text-black">
                        Set new password
                    </h2>
                    <p className="font-inter text-sm text-custom-gray">
                        Enter your new password below.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                    {/* New Password Input */}
                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="font-inter text-sm font-medium text-neutral-900"
                        >
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your new password"
                                aria-invalid={Boolean(errors.password)}
                                className={[
                                    INPUT_BASE,
                                    errors.password ? INPUT_ERROR : INPUT_NORMAL,
                                ].join(" ")}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters",
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                                    },
                                })}
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-200"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-rose-600">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2">
                        <label
                            htmlFor="confirmPassword"
                            className="font-inter text-sm font-medium text-neutral-900"
                        >
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your new password"
                                aria-invalid={Boolean(errors.confirmPassword)}
                                className={[
                                    INPUT_BASE,
                                    errors.confirmPassword ? INPUT_ERROR : INPUT_NORMAL,
                                ].join(" ")}
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) =>
                                        value === password || "Passwords do not match",
                                })}
                            />
                            <button
                                type="button"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-200"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-rose-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 rounded-lg bg-gradient-to-b from-[#FF4250] to-[#D73742] text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                        style={{
                            boxShadow:
                                "0 4px 40px rgba(48,12,15,0.15), inset 0px -8px 8px #E43D48, inset 0px 8px 8px #FF4452",
                        }}
                    >
                        {isLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-sm text-neutral-500">
                    <Link href="/" className="underline hover:opacity-80">
                        Back to login
                    </Link>
                </p>
            </div>
        </section>
    );
}
