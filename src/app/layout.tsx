import type { Metadata, Viewport } from "next";
import { getSiteUrl, isIndexableDeployment } from "@/lib/deployment/config";
import "./globals.css";

const siteUrl = getSiteUrl();
const indexable = isIndexableDeployment();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "kantin. — Savor the sip. Share the bite.",
    template: "%s — kantin.",
  },
  description:
    "Kantin. Alsancak ve Atakent şubeleri, şubeye özel menüler ve yaklaşan etkinlikler.",
  icons: { icon: "/assets/img/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "kantin.",
    title: "kantin. — Savor the sip. Share the bite.",
    description:
      "Kantin. Alsancak ve Atakent şubeleri, şubeye özel menüler ve yaklaşan etkinlikler.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "kantin. — Savor the sip. Share the bite.",
    description:
      "Kantin. Alsancak ve Atakent şubeleri, şubeye özel menüler ve yaklaşan etkinlikler.",
  },
  robots: indexable
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          noimageindex: false,
        },
      }
    : {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
        },
      },
};

export const viewport: Viewport = {
  themeColor: "#0047BB",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
