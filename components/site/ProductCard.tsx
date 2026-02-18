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
        <Card className="group relative border-2 border-black rounded-none shadow-none hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 h-full flex flex-col bg-white">
            <CardHeader className="p-0 relative aspect-square group overflow-visible">
                <Link href={`/${locale}/producto/${album.slug}`} className="block w-full h-full relative cursor-pointer">
                    {/* Vinyl Record Visual Effect */}
                    <div className="absolute inset-0 bg-black rounded-full scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-[0.98] group-hover:translate-x-12 transition-all duration-700 ease-out z-0 flex items-center justify-center shadow-xl border-2 border-white">
                        <div className="w-1/3 h-1/3 bg-zinc-800 rounded-full border-4 border-zinc-900 flex items-center justify-center">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="relative z-10 w-full h-full bg-white border-r-2 border-black transition-transform duration-500 group-hover:-translate-x-4 group-hover:rotate-[-2deg] overflow-hidden">
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
                    <h3 className="text-lg font-bold leading-tight uppercase tracking-tight">{album.title}</h3>
                    <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest mt-1">{album.artist}</p>
                </div>
                <div className="flex gap-2 justify-center mt-3">
                    <Badge variant="outline" className="text-xs font-mono uppercase tracking-wider border-black text-black rounded-none">
                        Vinyl: {album.physicalPrice}€
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono uppercase tracking-wider border-black text-black bg-transparent rounded-none">
                        Digital: {album.digitalPrice}€
                    </Badge>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full rounded-none bg-black text-white hover:bg-primary hover:text-black transition-all duration-300 hover:scale-105 hover:opacity-90 font-mono uppercase tracking-widest border border-black" asChild>
                    <Link href={`/${locale}/producto/${album.slug}`}>
                        {t("viewDetails") || "View Details"}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
