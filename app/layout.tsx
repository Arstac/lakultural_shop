import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KROMA | Riñoneras Artesanales",
  description: "Riñoneras hechas a mano. Tres tamaños, un estilo. Diseñadas para tu día a día.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="scroll-smooth" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased min-h-screen flex flex-col font-sans`}>
        {children}
      </body>
    </html>
  );
}

