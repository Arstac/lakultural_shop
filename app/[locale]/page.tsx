import { Hero } from "@/components/site/Hero";
import { ProductCard } from "@/components/site/ProductCard";
import { ValueProps } from "@/components/site/ValueProps";
import { getAlbums, staticAlbums, getHomePageContent } from "@/lib/products";
import { getTranslations, getLocale } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("Products");
  const locale = await getLocale();
  const albums = await getAlbums();
  const homeContent = await getHomePageContent();
  const displayAlbums = albums.length > 0 ? albums : staticAlbums;

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
      <Hero content={homeContent} />

      <section id="productos" className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {t("title") || "Our Collection"}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("description") || "Discover the latest sounds."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayAlbums.map((album) => (
            <ProductCard key={album.id} album={album} locale={locale} />
          ))}
        </div>
      </section>

      <ValueProps />
    </div>
  );
}
