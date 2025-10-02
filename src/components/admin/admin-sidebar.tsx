"use client"

import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Users, 
  FileText, 
  Upload, 
  Video, 
  Trophy, 
  Settings,
  Sun,
  Moon,
  LogOut
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import LOGUS from "../../../public/loguss.png"
import { useAuth } from "@/context/AuthContext"

const navigation = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/admin", icon: Home },
      { title: "Students", url: "/admin/students", icon: Users },
    ]
  },
  {
    title: "Quiz Management",
    items: [
      { title: "Upload Excel", url: "/admin/upload", icon: Upload },
      { title: "Quiz Details", url: "/admin/quiz", icon: FileText },
      { title: "Quiz Results", url: "/admin/quiz-results", icon: Trophy },
    ]
  },
  {
    title: "Video Contest",
    items: [
      { title: "Submissions", url: "/admin/videos", icon: Video },
      { title: "Winners", url: "/admin/winners", icon: Trophy },
    ]
  },
  {
    title: "System",
    items: [
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ]
  }
]

export function AdminSidebar() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { logout } = useAuth()

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <div className="flex items-center">
            <Image src={LOGUS} alt="AISB Logo" width={40} height={40} />
            <h2 className="text-lg font-semibold ">
              AISB Admin
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Selection Automation Platform
          </p>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            size="sm"
            onClick={toggleTheme}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button 
            variant="destructive" 
            className="w-full justify-start" 
            size="sm"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            ali@typs.dev
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
