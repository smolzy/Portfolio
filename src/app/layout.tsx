import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zericard GPose Portfolio",
  description:
    "Zericard's own FFXIV Gpose portfolio",
  keywords: [
    "FFXIV",
    "GPose",
    "Zericard",
    "Final Fantasy XIV",
    "screenshots",
    "portfolio",
    "photographie virtuelle",
    "Éorzéa",
    "gpose photography",
  ],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Zericard GPose Portfolio",
    description:
      "Zericard's own FFXIV Gpose portfolio",
    type: "website",
    url: "https://zericard.com",
    siteName: "Zericard Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zericard GPose Portfolio",
    description:
      "Zericard's own FFXIV Gpose portfolio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* dns-prefetch for Cloudinary - gallery loads async so we skip preconnect */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Viewport meta for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem("zericard_theme");
                  var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var theme = saved || (systemDark ? "dark" : "light");
                  document.documentElement.setAttribute("data-theme", theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
