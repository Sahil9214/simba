"use client";

import { useForm } from "react-hook-form";
import Image from "next/image";
import { login_logo } from "@/assets/icons";
import { INPUT_BASE, INPUT_ERROR, INPUT_NORMAL } from "@/lib/constants";
import { useResetPassword } from "@/hooks/auth/useAuthMutations";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";


type ResetFormValues = {
    email: string;
};

export function ResetPasswordForm() {
    const [emailSent, setEmailSent] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ResetFormValues>({
        defaultValues: { email: "" },
        mode: "onBlur",
    });
    const router = useRouter();
    const resetPasswordMutation = useResetPassword();

    const onSubmit = async (data: ResetFormValues) => {
        resetPasswordMutation.mutate(data, {
            onSuccess: () => {
                setEmailSent(true);
            }
        });
    };

    const isLoading = resetPasswordMutation.isPending;


    return (
        <section className="font-inter w-full flex justify-center items-center">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 flex flex-col items-center gap-8">
                {/* Logo */}
                <Image src={login_logo} alt="Simba Logo" width={132} height={56} />

                {/* Heading + Subtext */}
                <div className="w-full text-center space-y-1 md:mt-10">
                    <h2 className="font-inter text-lg font-semibold text-black">
                        {emailSent ? 'Check your email' : 'Reset your password'}
                    </h2>
                    <p className="font-inter text-sm text-custom-gray">
                        {emailSent
                            ? `We've sent a password reset link to ${getValues('email')}`
                            : 'Enter your registered email, and we will send you a reset link.'
                        }
                    </p>
                </div>

                {/* Form */}
                {!emailSent ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="font-inter text-sm font-medium text-neutral-900"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your work email"
                                aria-invalid={Boolean(errors.email)}
                                className={[
                                    INPUT_BASE,
                                    errors.email ? INPUT_ERROR : INPUT_NORMAL,
                                ].join(" ")}
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Enter a valid email",
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-sm text-rose-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 cursor-pointer rounded-lg bg-gradient-to-b from-[#FF4250] to-[#D73742] text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                            style={{
                                boxShadow:
                                    "0 4px 40px rgba(48,12,15,0.15), inset 0px -8px 8px #E43D48, inset 0px 8px 8px #FF4452",
                            }}
                        >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <div className="w-full space-y-4 text-center">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-600">
                            If an account with that email exists, you&apos;ll receive a password reset link shortly.
                        </p>
                    </div>
                )}

                {/* Footer */}
                <p className="text-sm text-neutral-500 cursor-pointer">
                    <Button variant="link" size="sm" onClick={() => router.back()} className="underline hover:opacity-80">
                        Back to login
                    </Button>
                </p>
            </div>
        </section>
    );
}
