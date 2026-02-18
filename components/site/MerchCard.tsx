"use client";

import Image from "next/image";
import Link from "next/link";
import { Merch } from "@/lib/products";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "next-intl";

interface MerchCardProps {
    merch: Merch;
}

export function MerchCard({ merch }: MerchCardProps) {
    const locale = useLocale();
    const { title, price, images, slug, stock } = merch;
    const coverImage = images && images.length > 0 ? images[0] : "/placeholder-merch.jpg";

    const isOutOfStock = stock <= 0;

    return (
        <Link href={`/${locale}/merch/${slug}`} className="group block h-full">
            <Card className="h-full border-none bg-transparent shadow-none transition-transform duration-300 hover:-translate-y-1">
                <CardContent className="p-0 relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive" className="text-sm font-medium">
                                Out of Stock
                            </Badge>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-1 p-4 pt-3">
                    <h3 className="font-medium text-lg leading-tight group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-muted-foreground font-medium">
                        {new Intl.NumberFormat(locale, {
                            style: "currency",
                            currency: "EUR",
                        }).format(price)}
                    </p>
                </CardFooter>
            </Card>
        </Link>
    );
}
