import { ParallaxHome } from "@/components/site/ParallaxHome";
import { getAlbums, staticAlbums, getHomePageContent, getEvents } from "@/lib/products";
import { getSiteSettings } from "@/lib/siteSettings";
import { getTranslations, getLocale } from "next-intl/server";
import { EventBanner } from "@/components/site/EventBanner";

export default async function Home() {
  const t = await getTranslations("Products");
  const tHero = await getTranslations("Hero");
  const locale = await getLocale();
  const albums = await getAlbums();
  const events = await getEvents();
  const homeContent = await getHomePageContent();
  const settings = await getSiteSettings();
  const primaryColor = settings?.colors?.primary || "#CCFF00";
  const displayAlbums = albums.length > 0 ? albums : staticAlbums;

  const translations = {
    title: tHero("title"),
    description: tHero("description"),
    cta: tHero("cta"),
    collectionTitle: t("title") || "Our Collection",
    collectionDesc: t("description") || "Discover the latest sounds.",
  };

  const bookings = events.filter((e) => new Date(e.date) > new Date());
  const nextEvent = bookings.length > 0 ? bookings[0] : null;

  return (
    <main className="min-h-screen">
      <ParallaxHome
        homeContent={homeContent}
        albums={displayAlbums}
        locale={locale}
        translations={translations}
        eventBannerSlot={<EventBanner events={events} locale={locale} primaryColor={primaryColor} />}
        nextEvent={nextEvent}
        primaryColor={primaryColor}
      />
    </main>
  );
}
