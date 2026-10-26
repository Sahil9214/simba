import React from 'react'
import { LoginForm } from '@/components/auth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { SELLER_SCREEN } from '@/lib/constants'


const SellerLoginForm = () => {
    return (
        <ProtectedRoute requireAuth={false} redirectTo="/staff/profile">
            <main className='seller-login-page  flex justify-center items-center h-screen '>
                <LoginForm screen={SELLER_SCREEN} />
            </main>
        </ProtectedRoute>
    )
}

export default SellerLoginForm



