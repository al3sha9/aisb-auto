"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AuthProvider, useAuth } from "@/context/AuthContext"

function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  // Login page - no protection needed
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Check if user has token
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('admin_access_token')

  // Protected pages - simple check
  if (!isAuthenticated && !hasToken) {
    window.location.href = '/admin/login'
    return <div>Redirecting to login...</div>
  }

  // Show admin layout
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