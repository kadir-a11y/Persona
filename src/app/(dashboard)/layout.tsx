"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  FileText,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  FolderKanban,
  Radar,
  PanelLeftClose,
  PanelLeftOpen,
  KeyRound,
  User,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { BugReporter } from "@/components/bug-reporter";

const navItems = [
  { href: "/personas", label: "Personas", icon: Users },
  { href: "/content", label: "İçerik", icon: FileText },
  { href: "/campaigns", label: "Kampanyalar", icon: Megaphone },
  { href: "/projects", label: "Projeler", icon: FolderKanban },
  { href: "/monitoring", label: "İzleme", icon: Radar },
  { href: "/tasks", label: "Görevler", icon: ListChecks },
  { href: "/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

function Sidebar({
  className,
  collapsed,
  onToggle,
}: {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<{ name: string; email: string }>({ name: "", email: "" });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (s?.user) setUserInfo({ name: s.user.name || "Kullanıcı", email: s.user.email || "" });
      })
      .catch(() => {});
  }, []);

  const userName = userInfo.name || "Kullanıcı";
  const userEmail = userInfo.email;
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("flex h-full flex-col", className)}>
        <div className="flex h-14 items-center justify-between px-3">
          <Link
            href="/personas"
            className={cn(
              "flex items-center gap-2 font-semibold",
              collapsed && "justify-center"
            )}
          >
            <Users className="h-6 w-6 shrink-0" />
            {!collapsed && <span className="text-lg">Persona</span>}
          </Link>
          {onToggle && !collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggle}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className={cn("flex-1 py-4", collapsed ? "px-2" : "px-3")}>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md text-sm font-medium transition-colors",
                    collapsed
                      ? "justify-center px-2 py-2"
                      : "gap-3 px-3 py-2",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>
        </ScrollArea>
        <Separator />
        <div className={cn("p-2 flex items-center", collapsed ? "flex-col gap-1" : "gap-2 px-3")}>
          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-2 rounded-md p-1.5 text-sm transition-colors hover:bg-muted w-full",
                collapsed ? "justify-center" : ""
              )}>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-medium truncate">{userName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side={collapsed ? "right" : "top"} align="start" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings?tab=security" className="cursor-pointer">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Şifre Değiştir
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Collapse toggle — only in collapsed mode */}
          {collapsed && onToggle && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={onToggle}
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Menüyü Genişlet
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden border-r bg-sidebar-background md:block transition-all duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <Sidebar collapsed={collapsed} onToggle={toggleCollapse} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r bg-sidebar-background">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-4 border-b px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <div className="flex items-center gap-2 font-semibold">
            <Users className="h-5 w-5" />
            Persona
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[1800px] p-6">{children}</div>
        </main>
      </div>

      <BugReporter />
    </div>
  );
}
