"use client";

import Link from "next/link";
import { Product } from "@/lib/products";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const locale = useLocale();

    return (
        <Card className="group overflow-hidden border-none shadow-none hover:shadow-lg transition-all duration-300">
            <CardHeader className="p-0">
                <div className="aspect-square relative overflow-hidden bg-muted">
                    {/* Placeholder for image until we have real ones */}
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                        <span className="font-bold text-2xl">{product.name}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{product.name}</h3>
                    <Badge variant="secondary" className="text-base">
                        {product.price}€
                    </Badge>
                </div>
                <p className="text-muted-foreground line-clamp-2">
                    {product.description}
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full rounded-full" asChild>
                    <Link href={`/${locale}/producto/${product.slug}`}>
                        Ver Detalles
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

