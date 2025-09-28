"use client"

import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AuthProvider, useAuth } from "@/context/AuthContext"

function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  // If authentication check is still in progress, show loading
  if (loading) {
    return <div>Loading authentication...</div>
  }

  // If authentication check is complete AND user is not authenticated AND not on login page, redirect
  if (!isAuthenticated && pathname !== '/admin/login') {
    router.push('/admin/login')
    return null // Render nothing while redirecting
  }

  // If authenticated and on the login page, redirect to dashboard
  if (isAuthenticated && pathname === '/admin/login') {
    router.push('/admin/dashboard')
    return null // Render nothing while redirecting
  }

  // Don't show sidebar on login page
  const isLoginPage = pathname === '/admin/login'
  
  if (isLoginPage) {
    return children
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedAdminLayout>{children}</ProtectedAdminLayout>
    </AuthProvider>
  )
}