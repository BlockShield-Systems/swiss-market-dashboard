import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PreferencesProvider } from "@/components/preferences-provider";
import { getLocale } from "@/lib/i18n-server";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  authors: [{ name: SITE_CONFIG.author }],
  metadataBase: new URL(SITE_CONFIG.url),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PreferencesProvider initialLocale={locale}>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex flex-1 flex-col lg:pl-72">
                <Header />
                <main className="flex-1 space-y-6 p-6 pt-4 md:p-8 md:pt-6">
                  {children}
                </main>
              </div>
            </div>
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

