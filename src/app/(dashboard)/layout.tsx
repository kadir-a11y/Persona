"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Tags,
  FileText,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  FolderKanban,
  Bug,
  Radar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { BugReporter } from "@/components/bug-reporter";

const navItems = [
  { href: "/personas", label: "Personas", icon: Users },
  { href: "/roles", label: "Roller", icon: Shield },
  { href: "/tags", label: "Etiketler", icon: Tags },
  { href: "/content", label: "İçerik", icon: FileText },
  { href: "/campaigns", label: "Kampanyalar", icon: Megaphone },
  { href: "/projects", label: "Projeler", icon: FolderKanban },
  { href: "/monitoring", label: "İzleme", icon: Radar },
  { href: "/ai-content", label: "AI İçerik", icon: Sparkles },
  { href: "/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/bug-reports", label: "Bug Bildirimleri", icon: Bug },
];

function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex h-14 items-center px-4">
        <Link href="/personas" className="flex items-center gap-2 font-semibold">
          <Users className="h-6 w-6" />
          <span className="text-lg">Persona</span>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 border-r bg-sidebar-background md:block">
        <Sidebar />
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
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>

      <BugReporter />
    </div>
  );
}
