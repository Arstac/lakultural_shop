import { getMerch } from "@/lib/products";
import { MerchCard } from "@/components/site/MerchCard";
import { getSiteSettings } from "@/lib/siteSettings";
import { getTranslations } from "next-intl/server";
import { PageBanner } from "@/components/site/PageBanner";

export default async function MerchPage() {
    const merchItems = await getMerch();
    const t = await getTranslations("Merch");
    const settings = await getSiteSettings();
    const primaryColor = settings?.colors?.primary || "#CCFF00";

    return (
        <div>
            <PageBanner
                title={t("title")}
                subtitle={t("description")}
                primaryColor={primaryColor}
            />
            <div className="container mx-auto px-4 py-8">

                {merchItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {merchItems.map((item) => (
                            <MerchCard key={item.id} merch={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-muted-foreground">{t("noItems")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
