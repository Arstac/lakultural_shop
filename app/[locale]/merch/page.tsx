import { getMerch } from "@/lib/products";
import { MerchCard } from "@/components/site/MerchCard";
import { getTranslations } from "next-intl/server";

export default async function MerchPage() {
    const merchItems = await getMerch();
    const t = await getTranslations("Merch");

    return (
        <div className="container mx-auto px-4 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight mb-4">{t("title")}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t("description")}
                </p>
            </header>

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
    );
}
