import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.settings.title,
    description: t.settings.description,
  };
}

export default async function SettingsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const currentLanguage =
    locale === "de" ? t.common.german : t.common.english;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t.settings.title}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground md:text-base">
          {t.settings.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.languageTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t.settings.languageText}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageToggle />
            <Badge variant="secondary">
              {t.common.current}: {currentLanguage}
            </Badge>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {t.common.savedHint}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.themeTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t.settings.themeText}
          </p>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Badge variant="secondary">{t.common.theme}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.summaryTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>{t.settings.intro}</p>

          <div className="rounded-xl border bg-muted/20 p-4">
            <h2 className="text-sm font-semibold text-foreground">
              {t.settings.implementationNoteTitle}
            </h2>
            <p className="mt-2">{t.settings.implementationNote}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
