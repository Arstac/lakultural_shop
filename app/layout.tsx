import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Kultural Records | Tienda de Música",
  description: "Vinilos, Cassettes y Descargas Digitales. Tu tienda de música independiente.",
  icons: {
    icon: "/icon.png", // TODO: Replace with music icon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="scroll-smooth" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} antialiased min-h-screen flex flex-col font-sans`}>
        {children}
      </body>
    </html>
  );
}

