import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  FileBarChart,
  Users,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import logo from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "./ui/button";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Items", url: "/items", icon: Package },
  { title: "Suppliers", url: "/suppliers", icon: Truck },
  { title: "Reports", url: "/reports", icon: FileBarChart },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { user, signOutUser } = useAuth();
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <img src={logo} alt="ESSA" className="h-10 w-auto" />
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-sidebar-foreground">ESSA</span>
            <span className="text-xs text-sidebar-foreground/60">Inventory control</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/users")}>
                    <Link to="/users">
                      <Users />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/settings")}>
                    <Link to="/settings">
                      <SettingsIcon />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.displayName ?? user?.email ?? "—"}
            </p>
            <p className="text-xs capitalize text-sidebar-foreground/60">{user?.role}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => signOutUser()}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}