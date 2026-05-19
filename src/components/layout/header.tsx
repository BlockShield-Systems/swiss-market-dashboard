"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings2 } from "lucide-react";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { usePreferences } from "@/components/preferences-provider";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";
import type { NavItemKey } from "@/lib/constants";

function getPageKey(pathname: string): NavItemKey {
  if (pathname.startsWith("/crypto")) return "crypto";
  if (pathname.startsWith("/weather")) return "weather";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/settings")) return "settings";
  return "overview";
}

export function Header() {
  const pathname = usePathname();
  const { locale } = usePreferences();
  const t = getDictionary(locale);

  const pageKey = getPageKey(pathname);
  const pageMeta = t.header[pageKey];

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex min-h-14 items-center gap-4 px-4 lg:px-6">
        <div className="w-10 shrink-0 lg:hidden" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground md:text-base">
            {pageMeta.title}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground md:block">
            {pageMeta.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />

          <Button type="button" variant="outline" size="icon" asChild>
            <Link href="/settings" aria-label={t.nav.settings}>
              <Settings2 className="size-4" />
              <span className="sr-only">{t.nav.settings}</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
