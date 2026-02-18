import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { CartSheet } from '@/components/site/CartSheet';
import { Player } from '@/components/site/Player';
import { CookieConsent } from '@/components/site/CookieConsent';
import { GridBackground } from '@/components/site/GridBackground';
import { getSiteSettings } from '@/lib/siteSettings';

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params;

    // Validate locale
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Detect admin route to hide site shell
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    const isAdmin = pathname.includes('/admin');

    // Fetch messages for the locale
    const messages = await getMessages();

    // Fetch site settings (skip for admin routes to improve perf)
    const settings = isAdmin ? null : await getSiteSettings();

    if (isAdmin) {
        return (
            <NextIntlClientProvider locale={locale} messages={messages}>
                {children}
            </NextIntlClientProvider>
        );
    }

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <GridBackground />
            <CartSheet />
            <Header settings={settings!} />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <CookieConsent />
            <Player />
        </NextIntlClientProvider>
    );
}
