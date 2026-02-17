"use client";

import Link from "next/link";
import { Album } from "@/lib/products";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { Disc } from "lucide-react";

interface ProductCardProps {
    album: Album;
    locale?: string;
}

export function ProductCard({ album, locale }: ProductCardProps) {
    const currentLocale = locale || useLocale();
    const t = useTranslations("Products");

    return (
        <Card className="group relative border-none shadow-none hover:shadow-xl hover:z-50 transition-all duration-300 h-full flex flex-col bg-card">
            <CardHeader className="p-0 relative aspect-square rounded-md group">
                <Link href={`/${locale}/producto/${album.slug}`} className="block w-full h-full relative cursor-pointer">
                    {/* Vinyl Record Visual Effect */}
                    <div className="absolute inset-0 bg-black rounded-full scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-12 transition-all duration-700 ease-out z-0 flex items-center justify-center">
                        <div className="w-1/3 h-1/3 bg-zinc-800 rounded-full border-4 border-zinc-900 flex items-center justify-center">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="relative z-10 w-full h-full bg-muted transition-transform duration-500 group-hover:-translate-x-4 group-hover:rotate-[-2deg] overflow-hidden rounded-md">
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-20 pointer-events-none" />
                        {album.coverImage ? (
                            <img
                                src={album.coverImage}
                                alt={album.title}
                                className="w-full h-full object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-400">
                                <Disc className="w-16 h-16 mb-2 opacity-50" />
                                <span className="font-bold text-xl text-center px-4">{album.title}</span>
                            </div>
                        )}
                    </div>
                </Link>
            </CardHeader>
            <CardContent className="pt-6 flex-1 text-center">
                <div className="flex flex-col items-center mb-2">
                    <h3 className="text-xl font-bold leading-tight">{album.title}</h3>
                    <p className="text-muted-foreground text-sm font-medium">{album.artist}</p>
                </div>
                <div className="flex gap-2 justify-center mt-3">
                    <Badge variant="outline" className="text-sm font-semibold px-3 py-1 bg-white/50 backdrop-blur-sm">
                        Vinyl: {album.physicalPrice}€
                    </Badge>
                    <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                        Digital: {album.digitalPrice}€
                    </Badge>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full rounded-full" asChild>
                    <Link href={`/${locale}/producto/${album.slug}`}>
                        {t("viewDetails") || "View Details"}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
