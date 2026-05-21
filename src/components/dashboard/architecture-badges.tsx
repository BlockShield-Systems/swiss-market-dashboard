import { Bot, Braces, Database, Flag, Server, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n";

type ArchitectureBadgesProps = {
  locale: Locale;
  compact?: boolean;
};

const architectureItems = [
  {
    label: "Next.js",
    icon: Server,
  },
  {
    label: "TypeScript",
    icon: Braces,
  },
  {
    label: "Neon Postgres",
    icon: Database,
  },
  {
    label: "Drizzle ORM",
    icon: ShieldCheck,
  },
  {
    label: "Upstash Redis",
    icon: Zap,
  },
  {
    label: "Vercel AI Gateway",
    icon: Bot,
  },
  {
    label: "Feature Flags",
    icon: Flag,
  },
] as const;

export function ArchitectureBadges({
  locale,
  compact = false,
}: ArchitectureBadgesProps) {
  const label =
    locale === "de" ? "Plattform-Architektur" : "Platform Architecture";

  return (
    <div className="space-y-2">
      {!compact ? (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {architectureItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <Badge
              key={item.label}
              variant={index === 0 ? "secondary" : "outline"}
              className="h-7 gap-1.5 px-2.5"
            >
              <Icon className="size-3.5" />
              {item.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
