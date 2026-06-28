import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME } from "@/lib/constants";
import { buildOrganizationJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://letravail.ma"),
  title: {
    default: `${SITE_NAME} — Le futur de l'emploi au Maroc`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: SITE_LOCALE.replace("-", "_"),
    siteName: SITE_NAME,
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={SITE_LOCALE}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Analytics />
        <JsonLd data={buildOrganizationJsonLd()} />
        <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
      </body>
    </html>
  );
}
