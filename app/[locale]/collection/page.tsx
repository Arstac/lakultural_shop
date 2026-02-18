import { CollectionViews } from "@/components/site/CollectionViews";
import { getAlbums, staticAlbums } from "@/lib/products";
import { getSiteSettings } from "@/lib/siteSettings";
import { getTranslations, getLocale } from "next-intl/server";

export default async function CollectionPage() {
    const t = await getTranslations("Products");
    const locale = await getLocale();
    const albums = await getAlbums();
    const settings = await getSiteSettings();
    const primaryColor = settings?.colors?.primary || "#CCFF00";
    const primaryForeground = settings?.colors?.primaryForeground || "#000000";
    const displayAlbums = albums.length > 0 ? albums : staticAlbums;

    return (
        <CollectionViews
            albums={displayAlbums}
            title={t("title") || "Our Collection"}
            description={t("description") || "Discover the latest sounds."}
            locale={locale}
            primaryColor={primaryColor}
            primaryForeground={primaryForeground}
        />
    );
}
