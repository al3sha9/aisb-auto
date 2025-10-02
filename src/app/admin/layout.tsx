"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AuthProvider, useAuth } from "@/context/AuthContext"

function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  // Handle authentication-based redirects with useEffect to avoid rendering loops
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && pathname !== '/admin/login') {
        router.replace('/admin/login')
      } else if (isAuthenticated && pathname === '/admin/login') {
        router.replace('/admin/dashboard')
      }
    }
  }, [isAuthenticated, loading, pathname, router])

  // If authentication check is still in progress, show loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null
  }

  if (isAuthenticated && pathname === '/admin/login') {
    return null
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