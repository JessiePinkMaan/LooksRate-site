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

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LOXRATE — Подвал. Яблоко. Стоа.",
    template: "%s · LOXRATE",
  },
  description:
    "Твой честный рейтинг и проводник в мир луксмаксинга. Будь неудобным.",
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
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
      </body>
    </html>
  );
}
