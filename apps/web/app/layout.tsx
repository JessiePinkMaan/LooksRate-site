import type { Metadata, Viewport } from "next";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/oswald/400.css";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/400-italic.css";

import {
  CustomCursor,
  EffectsProvider,
  EffectsToggle,
  SoundToggle,
} from "@loxrate/ui";

import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { TransitionProvider } from "@/components/motion/TransitionProvider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "LOXRATE — Подвал. Яблоко. Стоа.",
    template: "%s · LOXRATE",
  },
  description:
    "Твой честный рейтинг и проводник в мир луксмаксинга. Будь неудобным.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "LOXRATE",
    title: "LOXRATE — Подвал. Яблоко. Стоа.",
    description:
      "Твой честный рейтинг и проводник в мир луксмаксинга. Будь неудобным.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "LOXRATE — Будь неудобным",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOXRATE — Подвал. Яблоко. Стоа.",
    description:
      "Твой честный рейтинг и проводник в мир луксмаксинга. Будь неудобным.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#030303",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "LOXRATE",
                  url: process.env.SITE_URL ?? "http://localhost:3000",
                  sameAs: ["https://t.me/loxrating"],
                },
                {
                  "@type": "WebSite",
                  name: "LOXRATE",
                  url: process.env.SITE_URL ?? "http://localhost:3000",
                  inLanguage: "ru",
                },
              ],
            }),
          }}
        />
        <SmoothScroll>
          <TransitionProvider>
            <EffectsProvider />
            <CustomCursor />
            <div className="concrete-overlay" aria-hidden />
            <div className="grain-overlay" aria-hidden />
            <div className="vignette-overlay" aria-hidden />
            <div className="relative z-10">{children}</div>
            <div className="fixed bottom-4 left-4 z-50 flex flex-wrap gap-2">
              <EffectsToggle />
              <SoundToggle />
            </div>
          </TransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
