"use client";

import { LeftPanel } from '@/components/auth'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { NewPasswordForm } from '@/components/auth/new-password-form'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import React, { useState, useEffect } from 'react'

const ResetPassword = () => {
    const [isSettingNewPassword, setIsSettingNewPassword] = useState(false)

    useEffect(() => {
        // Check if we have tokens in the URL hash (indicates password reset flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const hasTokens = hashParams.get('access_token') && hashParams.get('refresh_token')
        setIsSettingNewPassword(!!hasTokens)
    }, [])

    return (
        <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
            <div className='font-inter h-dvh w-full flex-center p-4 mx-auto'>
                <LeftPanel />
                <section className='md:w-[43.75%] w-full flex justify-center items-center'>
                    {isSettingNewPassword ? <NewPasswordForm /> : <ResetPasswordForm />}
                </section>
            </div>
        </ProtectedRoute>
    )
}

export default ResetPassword
