import type { Metadata, Viewport } from "next";
import { Shippori_Mincho, Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";

const display = Shippori_Mincho({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Frysuroll — Big Hots & Sushi Delivery",
  description:
    "Peça Big Hots crocantes e sushi fresco. Cardápio visual, sacola rápida e acompanhamento em tempo real.",
  applicationName: "Frysuroll",
  icons: {
    icon: "/images/logo-mark.svg",
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
        <AdminAuthProvider>
          <CartProvider>{children}</CartProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
