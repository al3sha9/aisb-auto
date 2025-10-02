"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AuthProvider, useAuth } from "@/context/AuthContext"

function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()

  console.log('ProtectedAdminLayout render:', { 
    pathname, 
    isAuthenticated, 
    loading, 
    token: typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : 'SSR' 
  });

  // If authentication check is still in progress, show loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    )
  }

  // For login page, just render children without auth check
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // For other admin pages, check authentication
  if (!isAuthenticated) {
    console.log('Not authenticated, showing login prompt');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Please log in to access this page.</p>
          <a href="/admin/login" className="text-blue-500 underline">Go to Login</a>
        </div>
      </div>
    )
  }

  // Show admin layout with sidebar
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