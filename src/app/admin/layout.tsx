"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AuthProvider } from "@/context/AuthContext"

function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Login page - render without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // All other admin pages - show admin layout (no auth required)
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