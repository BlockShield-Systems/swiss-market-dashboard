import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PreferencesProvider } from "@/components/preferences-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_CONFIG } from "@/lib/constants";
import { getLocale } from "@/lib/i18n-server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = new URL(SITE_CONFIG.url);
const openGraphImageUrl = new URL(SITE_CONFIG.ogImagePath, SITE_CONFIG.url);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: SITE_CONFIG.name,
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [...SITE_CONFIG.keywords],
  authors: [{ name: SITE_CONFIG.author, url: SITE_CONFIG.primaryWebsiteUrl }],
  creator: SITE_CONFIG.creator,
  publisher: SITE_CONFIG.publisher,
  category: "technology",
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    type: "website",
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    locale: SITE_CONFIG.locale,
    alternateLocale: SITE_CONFIG.alternateLocale,
    images: [
      {
        url: openGraphImageUrl,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} preview image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [openGraphImageUrl],
    creator: "@ai_techart",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
