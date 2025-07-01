'use client';
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import {
  Home,
  Wallet,
  ArrowLeftRight,
  Settings,
  HelpCircle,
  Loader2,
  Handshake,
  LogOut,
  MessageSquare,
  Shield,
  MessageCircleQuestion,
  Users,
} from 'lucide-react'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { DashboardHeader } from '@/components/dashboard-header'
import { FinancialProvider, useFinancials } from '@/context/financial-context'
import { BottomNavbar } from '@/components/bottom-navbar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, theme } = useFinancials();
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);


  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-start gap-3 p-2 h-auto w-full text-left">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-foreground">{user?.displayName}</span>
                <span className="text-xs text-muted-foreground truncate max-w-32">{user?.email}</span>
              </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Dashboard">
                <Link href="/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/accounts')} tooltip="Accounts">
                <Link href="/dashboard/accounts">
                  <Wallet />
                  <span>Accounts</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard/transactions'} tooltip="Transactions">
                <Link href="/dashboard/transactions">
                  <ArrowLeftRight />
                  <span>Transactions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard/borrowing'} tooltip="Borrowing">
                <Link href="/dashboard/borrowing">
                  <Handshake />
                  <span>Borrowing</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard/lending'} tooltip="Lending">
                <Link href="/dashboard/lending">
                  <Users />
                  <span>Lending</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/chat')} tooltip="Chat">
                <Link href="/dashboard/chat">
                  <MessageSquare />
                  <span>Chat</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {user.isAdmin && (
               <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/chat')} tooltip="User Chats">
                    <Link href="/dashboard/admin/chat">
                      <MessageSquare />
                      <span>User Chats</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin/feedback')} tooltip="Feedback">
                    <Link href="/dashboard/admin/feedback">
                      <MessageCircleQuestion />
                      <span>Feedback</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroup>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard/settings'} tooltip="Settings">
                <Link href="/dashboard/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard/help'} tooltip="Help">
                <Link href="/dashboard/help">
                  <HelpCircle />
                  <span>Help</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={logout}
                tooltip="Logout"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                variant="ghost"
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
            {children}
            <footer className="mt-8 pt-4 text-center text-sm text-muted-foreground border-t">
              Developed by <a href="https://jonespeter.site/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">JOnesPeter</a> ❤️ © 2025. All rights reserved.
            </footer>
          </main>
        </div>
      </SidebarInset>
      <BottomNavbar />
    </SidebarProvider>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FinancialProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </FinancialProvider>
  )
}
