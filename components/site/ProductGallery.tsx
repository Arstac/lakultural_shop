"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    return (
        <div className="w-full flex justify-center">
            <Carousel className="w-full max-w-md md:max-w-lg">
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={index}>
                            <div className="aspect-square relative rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                                {/* Placeholder replacement logic */}
                                <div className="text-muted-foreground font-medium">
                                    {productName} - Vista {index + 1}
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </Carousel>
        </div>
    );
}
