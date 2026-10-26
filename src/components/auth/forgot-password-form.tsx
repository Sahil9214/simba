"use client";

import { useForm } from "react-hook-form";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { login_logo } from "@/assets/icons";
import React from "react";
import { INPUT_BASE, INPUT_ERROR, INPUT_NORMAL } from "@/lib/constants";
import Link from "next/link";

type NewPasswordValues = {
    newPassword: string;
    confirmPassword: string;
};

export function ForgotPasswordForm() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<NewPasswordValues>({
        defaultValues: { newPassword: "", confirmPassword: "" },
        mode: "onBlur",
    });

    const [showNew, setShowNew] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const onSubmit = async (data: NewPasswordValues) => {
        console.log("Password reset data:", data);
        // TODO: API call to save new password
    };

    // Shared input styles

    return (
        <section className=" w-full flex justify-center items-center">
            <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 flex flex-col items-center gap-10">
                {/* Logo */}
                <Image src={login_logo} alt="Simba Logo" width={132} height={56} />

                {/* Heading */}
                <div className="text-center space-y-2">
                    <h2 className="font-inter text-lg font-semibold text-neutral-900">
                        Create a new password
                    </h2>
                    <p className="font-inter text-sm text-neutral-500">
                        Choose something secure and easy to remember.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                    {/* New password */}
                    <div className="space-y-2">
                        <label
                            htmlFor="newPassword"
                            className="font-inter text-sm font-medium text-neutral-900"
                        >
                            New password
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                type={showNew ? "text" : "password"}
                                placeholder="Enter new password"
                                className={[
                                    INPUT_BASE,
                                    errors.newPassword ? INPUT_ERROR : INPUT_NORMAL,
                                ].join(" ")}
                                {...register("newPassword", {
                                    required: "New password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                })}
                            />
                            <button
                                type="button"
                                aria-label={showNew ? "Hide password" : "Show password"}
                                onClick={() => setShowNew((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-200"
                            >
                                {showNew ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-sm text-error">{errors.newPassword.message}</p>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-2">
                        <label
                            htmlFor="confirmPassword"
                            className="font-inter text-sm font-medium text-neutral-900"
                        >
                            Confirm new password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Re-enter new password"
                                className={[
                                    INPUT_BASE,
                                    errors.confirmPassword ? INPUT_ERROR : INPUT_NORMAL,
                                ].join(" ")}
                                {...register("confirmPassword", {
                                    required: "Please re-enter password",
                                    validate: (val) =>
                                        val === watch("newPassword") || "Passwords do not match",
                                })}
                            />
                            <button
                                type="button"
                                aria-label={showConfirm ? "Hide password" : "Show password"}
                                onClick={() => setShowConfirm((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-200"
                            >
                                {showConfirm ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-error">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 rounded-lg bg-gradient-to-b from-[#FF4250] to-[#D73742] text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                        style={{
                            boxShadow:
                                "0 4px 40px rgba(48,12,15,0.15), inset 0px -8px 8px #E43D48, inset 0px 8px 8px #FF4452",
                        }}
                    >
                        {isSubmitting ? "Saving..." : "Save & login"}
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
