"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  CloudSun,
  Info,
  LayoutDashboard,
  Menu,
  Settings2,
  TrendingUp,
} from "lucide-react";
import { usePreferences } from "@/components/preferences-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  TrendingUp,
  CloudSun,
  Info,
  Settings2,
};

type SidebarNavProps = {
  pathname: string;
  onNavigate?: () => void;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({ pathname, onNavigate }: SidebarNavProps) {
  const { locale } = usePreferences();
  const t = getDictionary(locale);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="border-b px-5 py-4">
        <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="flex size-12 items-center justify-center rounded-xl border bg-muted/30 p-2">
            <Image
              src="/branding/ai-techart.webp"
              alt={SITE_CONFIG.shortName}
              width={40}
              height={40}
              className="h-auto w-auto object-contain"
              priority
            />
          </div>

          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold">
              {SITE_CONFIG.shortName}
            </span>
            <span className="block text-xs text-muted-foreground">
              {t.sidebar.subtitle}
            </span>
          </div>
        </Link>

        <div className="mt-4 rounded-xl border bg-muted/20 p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border bg-background/80 p-2">
              <Image
                src="/branding/blockshield.webp"
                alt="BlockShield Systems"
                width={32}
                height={32}
                className="h-auto w-auto object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">BlockShield Systems</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {t.sidebar.ecosystemLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = isActivePath(pathname, item.href);

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "font-medium"
              )}
              asChild
            >
              <Link href={item.href} onClick={onNavigate}>
                {Icon ? <Icon className="size-4" /> : null}
                <span>{t.nav[item.key]}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="px-5 py-4">
        <Separator />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t.sidebar.footer}
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { locale } = usePreferences();
  const t = getDictionary(locale);
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r bg-background lg:block">
        <SidebarNav pathname={pathname} />
      </aside>

      <div className="fixed left-4 top-3 z-50 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" size="icon">
              <Menu className="size-5" />
              <span className="sr-only">{t.sidebar.openMenu}</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
            <SidebarNav
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
