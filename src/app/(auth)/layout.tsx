import { AuthLayout } from '@/layouts/auth-layout'

export default function AuthXLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AuthLayout>
        <main className="flex h-full min-h-screen w-full items-center justify-center">
          {children}
        </main>
      </AuthLayout>
    </>
  )
}
