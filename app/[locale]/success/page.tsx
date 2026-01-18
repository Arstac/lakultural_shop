"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export default function SuccessPage() {
    const t = useTranslations("Success");
    const locale = useLocale();

    return (
        <div className="container flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16">
            <div className="p-6 rounded-full bg-green-100 text-green-600 mb-8 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-16 h-16" />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                {t("title")}
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-md">
                {t("description")}
            </p>

            <Button size="lg" asChild>
                <Link href={`/${locale}`}>
                    {t("backHome")}
                </Link>
            </Button>
        </div>
    );
}

