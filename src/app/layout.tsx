import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "kantin. — savor the sip, share the bite",
    template: "%s — kantin.",
  },
  description:
    "Kantin. Alsancak ve Atakent şubeleri, şubeye özel menüler ve yaklaşan etkinlikler.",
  icons: { icon: "/assets/img/favicon.svg" },
  robots: {
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
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/css/style.css?v=react-layout-1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
