import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/siteSettings";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  const cssVariables = settings?.colors ? Object.entries(settings.colors).map(([key, value]) => {
    // Map Sanity keys to CSS variable names
    // e.g. primary -> --primary
    // We need to ensure we map correctly to what globals.css and tailwind uses
    // In globals.css: --primary, --background, etc.
    // key in sanity is 'primary', 'background'
    const varName = `--${key.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}`;
    return `${varName}: ${value};`;
  }).join(' ') : '';

  const radiusVar = settings?.radius ? `--radius: ${settings.radius}rem;` : '';

  return (
    <html className="scroll-smooth" suppressHydrationWarning>
      <head>
        {settings && (
          <style dangerouslySetInnerHTML={{
            __html: `
                  :root {
                      ${cssVariables}
                      ${radiusVar}
                  }
              `}} />
        )}
      </head>
      <body className={`${spaceGrotesk.variable} antialiased min-h-screen flex flex-col font-sans`}>
        {children}
      </body>
    </html>
  );
}

