import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zericard — GPose Portfolio",
  description:
    "Portfolio GPose de Zericard — photographie virtuelle FFXIV. Captures d'écran, lumière et silence d'Éorzéa.",
  keywords: ["FFXIV", "GPose", "Zericard", "Final Fantasy XIV", "screenshots", "portfolio"],
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
