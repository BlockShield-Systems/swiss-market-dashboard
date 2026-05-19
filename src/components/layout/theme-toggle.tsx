"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/components/preferences-provider";
import { getDictionary } from "@/lib/i18n";

function subscribe() {
  return () => { };
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale } = usePreferences();
  const t = getDictionary(locale);

  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <Button type="button" variant="outline" size="icon" disabled>
        <Sun className="size-4" />
        <span className="sr-only">{t.common.themeToggle}</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">{t.common.themeToggle}</span>
    </Button>
  );
}
