import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "kantin. — savor the sip, share the bite",
    template: "%s — kantin.",
  },
  description:
    "Kantin. Alsancak ve Atakent şubeleri, şubeye özel menüler ve yaklaşan etkinlikler.",
  icons: { icon: "/assets/img/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <head>
        <meta name="theme-color" content="#0047BB" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/css/style.css?v=next-migration-1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
