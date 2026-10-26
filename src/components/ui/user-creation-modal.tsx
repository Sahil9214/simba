"use client"

import * as React from "react"
import { X, UserPlus, Eye, EyeOff } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Modal } from "./modal"
import { useForm } from "react-hook-form"
import type { CreateUserData } from "@/lib/types/userManagement.types"
import { useCreateUser, useCanManageUsers } from "@/hooks/api/useUserManagement"
import { toast } from "sonner"

interface UserCreationModalProps {
    isOpen: boolean
    onClose: () => void
    onUserCreated?: (user: any) => void
}

type UserFormData = {
    first_name: string
    last_name: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    role: 'super_admin' | 'admin' | 'manager' | 'staff' | 'readonly'
    is_active: boolean
}

export function UserCreationModal({ isOpen, onClose, onUserCreated }: UserCreationModalProps) {
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

    const createUserMutation = useCreateUser()
    const permissions = useCanManageUsers()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue
    } = useForm<UserFormData>({
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "+91 ",
            role: "staff",
            is_active: true
        },
        mode: "onBlur",
    })

    const watchedPassword = watch("password")
    const watchedRole = watch("role")

    // Don't render if user doesn't have permission to create users
    if (!permissions.canCreateUsers) {
        return null
    }

    const onSubmit = async (data: UserFormData) => {
        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        const createUserData: CreateUserData = {
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone.startsWith("+91 ") && data.phone.length > 4 ? data.phone : undefined,
            role: data.role,
            is_active: data.is_active
        }

        createUserMutation.mutate(createUserData, {
            onSuccess: (result) => {
                reset()
                onClose()
                onUserCreated?.(result)
            }
        })
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    // Generate random secure password
    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
        let password = ""
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setValue("password", password)
        setValue("confirmPassword", password)
    }

    const roleOptions = [
        { value: "staff", label: "Staff", description: "Basic access to assigned shops" },
        { value: "manager", label: "Manager", description: "Manage shops and staff" },
        { value: "admin", label: "Admin", description: "System administration access" },
        ...(permissions.canCreateUsers ? [
            { value: "super_admin", label: "Super Admin", description: "Full system access" }
        ] : [])
    ]

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New User">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Personal Information */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                            </label>
                            <Input
                                placeholder="Enter first name"
                                {...register("first_name", {
                                    required: "First name is required",
                                    minLength: { value: 2, message: "First name must be at least 2 characters" }
                                })}
                                className={errors.first_name ? "border-red-500" : ""}
                            />
                            {errors.first_name && (
                                <p className="text-xs text-red-600 mt-1">{errors.first_name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                            </label>
                            <Input
                                placeholder="Enter last name"
                                {...register("last_name", {
                                    required: "Last name is required",
                                    minLength: { value: 2, message: "Last name must be at least 2 characters" }
                                })}
                                className={errors.last_name ? "border-red-500" : ""}
                            />
                            {errors.last_name && (
                                <p className="text-xs text-red-600 mt-1">{errors.last_name.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                        Contact Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <Input
                                type="email"
                                placeholder="user@company.com"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
                                        message: "Please enter a valid email address"
                                    }
                                })}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <Input
                                placeholder="+91 98765 43210"
                                {...register("phone", {
                                    pattern: {
                                        value: /^\\+91\\s\\d{5}\\s\\d{5}$/,
                                        message: "Please use format: +91 98765 43210"
                                    }
                                })}
                                className={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                        Account Settings
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            User Role *
                        </label>
                        <Select value={watchedRole} onValueChange={(value: any) => setValue("role", value)}>
                            <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select user role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{role.label}</span>
                                            <span className="text-xs text-gray-500">{role.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>
                        )}
                    </div>
                </div>

                {/* Password Settings */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Password Settings
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generatePassword}
                            className="text-xs"
                        >
                            Generate Strong Password
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password *
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/,
                                            message: "Password must contain uppercase, lowercase and numbers"
                                        }
                                    })}
                                    className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm password"
                                    {...register("confirmPassword", {
                                        required: "Please confirm your password",
                                        validate: (value) => value === watchedPassword || "Passwords do not match"
                                    })}
                                    className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        {...register("is_active")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">
                        Activate user account immediately
                    </label>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 text-sm">
                            <p className="text-blue-800">
                                <strong>Admin Note:</strong> This user will be created with direct access - no email verification required.
                                Make sure to securely share the login credentials with the user.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={createUserMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={createUserMutation.isPending}
                        className="bg-gradient-to-b from-[#FF4250] to-[#D73742] text-white hover:opacity-90"
                    >
                        {createUserMutation.isPending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating User...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Create User Account
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
