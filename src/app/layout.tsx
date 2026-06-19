import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME } from "@/lib/constants";
import { buildOrganizationJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://letravail.ma"
  ),
  title: {
    default: `${SITE_NAME} — Offres d'emploi au Maroc`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: SITE_LOCALE.replace("-", "_"),
    siteName: SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={SITE_LOCALE}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <JsonLd data={buildOrganizationJsonLd()} />
        <Header />
        <main className="min-h-[calc(100vh-16rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
