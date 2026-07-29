import type { Metadata, Viewport } from "next";
import { Rowdies, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import { AuthProvider } from "@/hooks/useAdminAuth";
import { SiteChatbot } from "@/components/store/SiteChatbot";

const display = Rowdies({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://frysushi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fry Sushi — Hot rolls em Goiânia",
    template: "%s · Fry Sushi",
  },
  description:
    "Delivery de sushi frito em Goiânia. Big Hots crocantes, cardápio visual e pedido rápido.",
  applicationName: "Fry Sushi",
  authors: [{ name: "Fry Sushi" }],
  creator: "Fry Sushi",
  publisher: "Fry Sushi",
  keywords: [
    "Fry Sushi",
    "sushi Goiânia",
    "hot roll",
    "delivery sushi",
    "Big Hot",
  ],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/images/logo-fry-sushi.png", type: "image/png", sizes: "1024x1024" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon.png"],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Fry Sushi",
    title: "Fry Sushi — Hot rolls em Goiânia",
    description:
      "Delivery de sushi frito em Goiânia. Big Hots crocantes e pedido rápido.",
    images: [
      {
        url: "/images/og-logo.png",
        width: 512,
        height: 512,
        alt: "Logo Fry Sushi",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Fry Sushi — Hot rolls em Goiânia",
    description:
      "Delivery de sushi frito em Goiânia. Big Hots crocantes e pedido rápido.",
    images: ["/images/og-logo.png"],
  },
  other: {
    "og:logo": `${siteUrl}/images/logo-fry-sushi.png`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0c0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-screen font-sans text-[var(--rice)]">
        <AuthProvider>
          <CartProvider>
            {children}
            <SiteChatbot />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
