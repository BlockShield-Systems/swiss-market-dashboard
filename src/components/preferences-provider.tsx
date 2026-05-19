"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type PreferencesContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isPending: boolean;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

interface PreferencesProviderProps {
  initialLocale: Locale;
  children: React.ReactNode;
}

export function PreferencesProvider({
  initialLocale,
  children,
}: PreferencesProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) {
        return;
      }

      setLocaleState(nextLocale);
      document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = nextLocale;

      startTransition(() => {
        router.refresh();
      });
    },
    [locale, router],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      isPending,
    }),
    [locale, setLocale, isPending],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider.");
  }

  return context;
}
