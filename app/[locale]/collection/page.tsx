import { ProductCard } from "@/components/site/ProductCard";
import { CollectionViews } from "@/components/site/CollectionViews";
import { getAlbums, staticAlbums } from "@/lib/products";
import { getTranslations, getLocale } from "next-intl/server";

export default async function CollectionPage() {
    const t = await getTranslations("Products");
    const locale = await getLocale();
    const albums = await getAlbums();
    const displayAlbums = albums.length > 0 ? albums : staticAlbums;

    return (
        <CollectionViews
            albums={displayAlbums}
            title={t("title") || "Our Collection"}
            description={t("description") || "Discover the latest sounds."}
            locale={locale}
        />
    );
}
