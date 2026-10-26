"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { login_logo } from "@/assets/icons"
import Link from "next/link"
import { INPUT_BASE, INPUT_ERROR, INPUT_NORMAL, SELLER_SCREEN } from "@/lib/constants"
import { useSignIn } from "@/hooks/auth/useAuthMutations"
import Image from "next/image"

type FormValues = {
    email: string
    password: string
}

const link = process.env.NEXT_PUBLIC_API_URL
// const link = `https://app.simbabeer.com`

export function LoginForm({ className, screen }: { className?: string, screen?: string }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: { email: "", password: "" },
        mode: "onBlur",
    })

    const [show, setShow] = React.useState(false)

    const signInMutation = useSignIn()

    const onSubmit = async (values: FormValues) => {
        signInMutation.mutate(values)
    }

    const isLoading = signInMutation.isPending

    return (
        <div className={`w-full max-w-md rounded-xl ${screen === SELLER_SCREEN ? 'bg-transparent' : 'bg-transparent'} p-6 ${className}`}>
            <div className="mb-10 flex flex-col items-center gap-2">
                <Image src={login_logo} alt="simba login" width={132} height={56} />
                {screen && <h1 className="font-inter text-base font-semibold text-text">{screen}</h1>}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="font-inter text-sm font-medium text-text">
                        Email address
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your work email"
                        aria-invalid={Boolean(errors.email)}
                        className={[
                            INPUT_BASE,
                            errors.email
                                ? INPUT_ERROR
                                : INPUT_NORMAL,
                        ].join(" ")}
                        {...register("email", {
                            required: "Use the email linked to your Simba account.",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Use the email linked to your Simba account.",
                            },
                        })}
                    />


                    <p className={"font-inter text-sm " + (errors.email ? "text-error" : "text-placeholder-gray")}>
                        {errors.email && "Use the email linked to your Simba account."}
                    </p>
                </div>

                {/* Password */}
                <div >
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="font-inter text-sm font-medium text-text">
                            Password
                        </label>
                        {/* <Link href={`https://${link}/reset-password`} className="font-inter text-sm text-error underline hover:opacity-80 cursor-pointer">
                            Forgot your password?
                        </Link> */}
                        <Link href={`/reset-password`} className="font-inter text-sm text-error underline hover:opacity-80 cursor-pointer">
                            Forgot your password?
                        </Link>
                    </div>

                    <div className="relative">
                        <input
                            id="password"
                            type={show ? "text" : "password"}
                            placeholder="Enter your password"
                            aria-invalid={Boolean(errors.password)}
                            className={[
                                INPUT_BASE,
                                errors.password
                                    ? INPUT_ERROR
                                    : INPUT_NORMAL,
                            ].join(" ")}
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 6, message: "Your password must be at least 6 characters" },
                            })}
                        />

                        <button
                            type="button"
                            aria-label={show ? "Hide password" : "Show password"}
                            onClick={() => setShow((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-200 cursor-pointer"
                        >
                            {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="font-inter text-sm mt-2 text-rose-600">{errors.password.message}</p>}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    aria-label="Login"
                    disabled={isLoading}
                    className="font-inter cursor-pointer w-full flex justify-center items-center py-3 px-4 gap-2 h-11 rounded-lg bg-gradient-to-b from-[#FF4250] to-[#D73742] shadow-[0_4px_40px_rgba(48,12,15,0.15)]  font-medium text-sm leading-normal text-[#FAFAFA] flex-none order-2 self-stretch flex-grow-0 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    style={{ boxShadow: 'inset 0px -8.19481px 8.19481px #E43D48, inset 0px 8.19481px 8.19481px #FF4452' }}
                >
                    {isLoading ? "Signing in..." : "Login"}
                </button>

                {/* Footer help */}
                <p className=" font-inter text-center text-sm text-custom-gray">
                    Need help?{" "}
                    <a href="mailto:info@simbabeer.com" className="underline cursor-pointer">
                        Contact support
                    </a>
                </p>
            </form>
        </div>
    )
}
