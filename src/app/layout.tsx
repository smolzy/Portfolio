import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zericard — GPose Portfolio",
  description:
    "Portfolio GPose de Zericard — photographie virtuelle FFXIV. Captures d'écran, lumière et silence d'Éorzéa.",
  keywords: ["FFXIV", "GPose", "Zericard", "Final Fantasy XIV", "screenshots", "portfolio"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Zericard — GPose Portfolio",
    description: "Portfolio GPose FFXIV de Zericard",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
