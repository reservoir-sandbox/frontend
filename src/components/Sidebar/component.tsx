import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Home,
  History,
  ChevronsUpDown,
  LogOut
} from "lucide-react"

import logo from "@/assets/reservoir-logo.png"
import { Link, useLocation } from "react-router-dom"
import type { User } from '@/types/auth';

const menu = [
  { name: 'Main', url: '/', icon: Home },
  { name: 'Past Reports', url: '/past-reports', icon: History }
];

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

export default function AppSidebar({ user, onLogout }: SidebarProps) {
  const location = useLocation()
  const { isMobile } = useSidebar()

  const getProfileImage = () => {
    // eslint-disable-next-line react-hooks/purity
    const id = Math.floor(Math.random() * 8) + 1;
    return `/profile-pics/${id}.jpg`;
  }

  const profileImage = getProfileImage();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-center py-6 border-b mb-2">
        <img
          src={logo}
          alt="reservoir sandbox logo"
          className="w-50"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menu.map((item) => {
              const isActive = location.pathname === item.url

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild className={`rounded-xl ${isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : ""
                    }`}>
                    <Link to={item.url}>
                      <item.icon strokeWidth={2} />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.username}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={profileImage} alt={user.username} />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.username}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}