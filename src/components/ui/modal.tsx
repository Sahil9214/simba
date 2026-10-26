"use client"


import { X, Send } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { UserRole } from "@/lib/rbac-types"
import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)
    const previousFocusRef = useRef<HTMLElement | null>(null)

    // Handle Escape key to close modal - MOVED BEFORE EARLY RETURN
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        if (isOpen) {
            // Store the currently focused element
            previousFocusRef.current = document.activeElement as HTMLElement

            document.addEventListener("keydown", handleEscape)
            // Prevent body scroll when modal is open
            document.body.style.overflow = "hidden"
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [isOpen, onClose])

    // Focus trapping effect
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            const firstElement = focusableElements[0] as HTMLElement
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

            const handleTabKey = (e: KeyboardEvent) => {
                if (e.key === "Tab") {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus()
                            e.preventDefault()
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus()
                            e.preventDefault()
                        }
                    }
                }
            }

            const handleKeyDown = (e: KeyboardEvent) => {
                // Prevent keyboard events from reaching background elements
                if (!modalRef.current?.contains(e.target as Node)) {
                    e.stopPropagation()
                    // Focus the modal if user tries to interact with background
                    firstElement?.focus()
                }
            }

            document.addEventListener("keydown", handleTabKey)
            document.addEventListener("keydown", handleKeyDown, true) // Use capture phase

            // Focus first element when modal opens
            setTimeout(() => firstElement?.focus(), 100)

            return () => {
                document.removeEventListener("keydown", handleTabKey)
                document.removeEventListener("keydown", handleKeyDown, true)
                // Restore previous focus when modal closes
                if (previousFocusRef.current && !isOpen) {
                    previousFocusRef.current.focus()
                }
            }
        }
    }, [isOpen])

    // Early return AFTER hooks
    if (!isOpen) return null

    // Prevent clicks inside modal from closing it
    const handleModalContentClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    // Prevent keyboard events from bubbling to parent elements
    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation()
    }

    return (
        <div
            className={cn("fixed inset-0 z-50 flex items-center justify-center cursor-pointer", className)}
            onKeyDown={handleKeyDown}
        >
            {/* Backdrop with blur effect */}
            <div
                className="fixed inset-0 bg-black/20 bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
                onKeyDown={(e) => e.stopPropagation()}
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 border border-gray-200"
                onClick={handleModalContentClick}
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                <div className="flex items-center rounded-t-lg justify-between p-4 border-b border-gray-200 bg-tertiary-color">
                    <h2 className="mx-auto font-inter font-semibold text-base leading-normal text-sidebar-foreground flex-none order-0 flex-grow-0">{title}</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0 hover:bg-gray-200"
                        aria-label='close-modal'
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

interface AddSalespersonModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: {
        firstName: string
        lastName: string
        role: string
        email: string
        phoneNumber: string
    }) => Promise<void>
    onInviteSent: (data: {
        firstName: string
        lastName: string
        email: string,
        phoneNumber: string,
        role: string
    }) => void
    isLoading?: boolean
}

export function AddSalespersonModal({ isOpen, onClose, onSubmit, onInviteSent, isLoading = false }: AddSalespersonModalProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        role: "",
        email: "",
        phoneNumber: "+91 "
    })

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        role: "",
        email: "",
        phoneNumber: ""
    })

    const validateName = (name: string, fieldName: string): string => {
        // Check if empty
        if (!name.trim()) {
            return `${fieldName} is required`
        }

        // Check minimum length
        if (name.trim().length < 2) {
            return `${fieldName} must be at least 2 characters`
        }

        // Check maximum length
        if (name.trim().length > 50) {
            return `${fieldName} must not exceed 50 characters`
        }

        // Check for valid characters (letters, spaces, hyphens, apostrophes)
        const nameRegex = /^[a-zA-Z\s'-]+$/
        if (!nameRegex.test(name)) {
            return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
        }

        return ""
    }

    const validateEmail = (email: string): string => {
        // Check if empty
        if (!email.trim()) {
            return "Email is required"
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address"
        }

        // Check maximum length
        if (email.length > 100) {
            return "Email must not exceed 100 characters"
        }

        return ""
    }

    const validatePhoneNumber = (phoneNumber: string): string => {
        // Check if empty
        if (!phoneNumber.trim()) {
            return "Phone number is required"
        }

        // Remove spaces and check if it starts with +91
        const cleaned = phoneNumber.replace(/\s/g, "")

        if (!cleaned.startsWith("+91")) {
            return "Phone number must start with +91"
        }

        // Check if the rest are digits and has exactly 10 digits after +91
        const digitsOnly = cleaned.slice(3)
        if (!/^\d{10}$/.test(digitsOnly)) {
            return "Phone number must have exactly 10 digits after +91"
        }

        return ""
    }

    const validateRole = (role: string): string => {
        // Check if empty
        if (!role.trim()) {
            return "Role is required"
        }

        return ""
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Validate on change for all fields
        let error = ""
        if (field === "firstName") {
            error = validateName(value, "First Name")
        } else if (field === "lastName") {
            error = validateName(value, "Last Name")
        } else if (field === "email") {
            error = validateEmail(value)
        } else if (field === "phoneNumber") {
            error = validatePhoneNumber(value)
        } else if (field === "role") {
            error = validateRole(value)
        }

        setErrors(prev => ({
            ...prev,
            [field]: error
        }))
    }

    const handleBlur = (field: string) => {
        let error = ""
        if (field === "firstName") {
            error = validateName(formData[field], "First Name")
        } else if (field === "lastName") {
            error = validateName(formData[field], "Last Name")
        } else if (field === "email") {
            error = validateEmail(formData[field])
        } else if (field === "phoneNumber") {
            error = validatePhoneNumber(formData[field])
        } else if (field === "role") {
            error = validateRole(formData[field])
        }

        setErrors(prev => ({
            ...prev,
            [field]: error
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate all fields before submission
        const firstNameError = validateName(formData.firstName, "First Name")
        const lastNameError = validateName(formData.lastName, "Last Name")
        const emailError = validateEmail(formData.email)
        const phoneNumberError = validatePhoneNumber(formData.phoneNumber)
        const roleError = validateRole(formData.role)

        setErrors({
            firstName: firstNameError,
            lastName: lastNameError,
            role: roleError,
            email: emailError,
            phoneNumber: phoneNumberError
        })

        // Stop submission if there are errors
        if (firstNameError || lastNameError || emailError || phoneNumberError || roleError) {
            return
        }

        try {
            // Wait for the API call to complete successfully
            await onSubmit(formData)



            // Reset form and close modal only on success
            setFormData({
                firstName: "",
                lastName: "",
                role: "",
                email: "",
                phoneNumber: "+91 "
            })
            setErrors({
                firstName: "",
                lastName: "",
                role: "",
                email: "",
                phoneNumber: ""
            });

            onClose()
        } catch (error) {
            // If API call fails, don't show success modal or close the form
            console.error("Failed to add salesperson:", error)
            // The error handling should be done in the parent component
            // The modal stays open so user can try again
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Salesperson">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name and Last Name Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                        </label>
                        <Input
                            placeholder="Enter first name"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            onBlur={() => handleBlur("firstName")}
                            className={`w-full ${errors.firstName ? "border-red-500" : ""}`}
                            required
                            type="text"
                            aria-label="Enter frst name"

                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                        </label>
                        <Input
                            placeholder="Enter last name"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            onBlur={() => handleBlur("lastName")}
                            className={`w-full ${errors.lastName ? "border-red-500" : ""}`}
                            required
                            type="text"
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                        )}
                    </div>
                </div>

                {/* Role Row */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Role
                    </label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                        <SelectTrigger className={`w-full ${errors.role ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>

                            <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                            <SelectItem value={UserRole.STAFF}>Staff</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.role && (
                        <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                    )}
                </div>

                {/* Email and Phone Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <Input
                            type="email"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            onBlur={() => handleBlur("email")}
                            className={`w-full ${errors.email ? "border-red-500" : ""}`}
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <Input
                            placeholder="+91 "
                            value={formData.phoneNumber}
                            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                            onBlur={() => handleBlur("phoneNumber")}
                            className={`w-full ${errors.phoneNumber ? "border-red-500" : ""}`}
                            required
                        />
                        {errors.phoneNumber && (
                            <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="px-6 border-gray-300"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 bg-gradient-to-b from-[#FF4250] to-[#D73742] text-white hover:opacity-90 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        {isLoading ? "Sending..." : "Send Invite"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

interface InviteSentSuccessModalProps {
    isOpen: boolean
    onClose: () => void
    firstName: string
    lastName: string
    email: string
}

export function InviteSentSuccessModal({ isOpen, onClose, firstName, lastName, email }: InviteSentSuccessModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 border border-gray-200">
                {/* Header */}
                <div className="flex items-center rounded-t-lg justify-center p-4 border-b border-gray-200 bg-tertiary-color">
                    <h2 className="text-lg font-semibold text-gray-900">Invite Sent Successfully</h2>
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                    <p className="text-gray-700 mb-4">
                        <span className="text-blue-600 font-medium">{firstName} {lastName}</span> has been invited to join Simba. An email was
                        sent to <span className="text-blue-600 font-medium">{email}</span> with a link to set up their
                        account.
                    </p>
                    <Button
                        onClick={onClose}
                        className="mt-4 px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    )
}
