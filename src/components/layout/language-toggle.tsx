"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/components/preferences-provider";
import { getDictionary, type Locale } from "@/lib/i18n";

const locales: Locale[] = ["de", "en"];

export function LanguageToggle() {
  const { locale, setLocale, isPending } = usePreferences();
  const t = getDictionary(locale);

  return (
    <div className="inline-flex items-center rounded-lg border bg-background p-1">
      {locales.map((item) => {
        const isActive = locale === item;

        return (
          <Button
            key={item}
            type="button"
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            disabled={isPending}
            className={cn(
              "h-8 min-w-11 px-3 text-xs font-semibold uppercase tracking-wide",
              !isActive && "text-muted-foreground",
            )}
            onClick={() => setLocale(item)}
          >
            {item === "de" ? t.common.german : t.common.english}
          </Button>
        );
      })}
    </div>
  );
}
