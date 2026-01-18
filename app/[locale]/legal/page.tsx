"use client";

import { useTranslations } from "next-intl";

export default function LegalPage() {
    const t = useTranslations("Legal");

    return (
        <div className="container max-w-3xl mx-auto px-4 py-16 text-muted-foreground">
            <h1 className="text-3xl font-bold text-foreground mb-8">{t("title")}</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-4">{t("intro.title")}</h2>
                    <p>
                        {t("intro.content")}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-4">{t("shipping.title")}</h2>
                    <p>
                        {t("shipping.content")}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-4">{t("warranty.title")}</h2>
                    <p>
                        {t("warranty.content")}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-4">{t("privacy.title")}</h2>
                    <p>
                        {t("privacy.content")}
                    </p>
                </section>
            </div>
        </div>
    );
}

