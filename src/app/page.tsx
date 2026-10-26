import { LeftPanel, LoginForm } from "@/components/auth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false} redirectTo="/">
      <div className='min-h-screen h-dvh w-full flex-center p-4 mx-auto'>
        <LeftPanel />
        <section className=' seller-login-page  md:w-[43.75%] w-full flex justify-center items-center '>
          <LoginForm />
        </section>
      </div>
    </ProtectedRoute>
  )
}
