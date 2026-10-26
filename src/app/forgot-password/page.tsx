import React from 'react'
import { ForgotPasswordForm, LeftPanel } from '@/components/auth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'


const ForgotPassword = () => {
    return (
        <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
            <div className='font-inter h-dvh w-full flex-center p-4  mx-auto'>
                <LeftPanel />
                <section className='md:w-[43.75%] w-full flex justify-center items-center '>
                    <ForgotPasswordForm />
                </section>
            </div>
        </ProtectedRoute>
    )
}

export default ForgotPassword
