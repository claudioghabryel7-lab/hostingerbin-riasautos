import type { Metadata, Viewport } from "next";
import { Rowdies, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import { AuthProvider } from "@/hooks/useAdminAuth";

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

export const metadata: Metadata = {
  title: "Fry Sushi — Hot rolls em Goiânia",
  description:
    "Delivery de sushi frito em Goiânia. Big Hots crocantes, cardápio visual e pedido rápido.",
  applicationName: "Fry Sushi",
  icons: {
    icon: "/images/logo-fry-sushi.png",
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
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
