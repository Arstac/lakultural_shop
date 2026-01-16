import { products } from "@/lib/products";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/site/ProductGallery";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Lock } from "lucide-react";

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = products.find((p) => p.slug === slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-10 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                {/* Left: Gallery */}
                <div>
                    <ProductGallery images={product.images} productName={product.name} />

                    <div className="mt-8 hidden md:block text-muted-foreground text-sm space-y-2">
                        <p className="font-medium text-foreground">¿Dudas con el tamaño?</p>
                        <p>• La Mini: Llaves + Tarjetero</p>
                        <p>• La Todoterreno: Móvil + Gafas + Cartera</p>
                        <p>• La Maxi: Botella 50cl + Agenda + Todo lo demás</p>
                    </div>
                </div>

                {/* Right: Info & Purchase */}
                <div className="flex flex-col">
                    <Badge className="w-fit mb-4" variant="outline">
                        Hecho a mano
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        {product.name}
                    </h1>
                    <p className="text-3xl font-medium text-primary mb-6">
                        {product.price}€
                    </p>

                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                        {product.description}
                    </p>

                    <Button size="lg" className="w-full text-lg py-8 rounded-full mb-8 shadow-lg hover:shadow-xl transition-all" asChild>
                        <Link href={product.stripeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Comprar ahora - {product.price}€
                        </Link>
                    </Button>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="features">
                            <AccordionTrigger>Características</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {product.features.map((feature, i) => (
                                        <li key={i}>{feature}</li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="dimensions">
                            <AccordionTrigger>Medidas</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {product.dimensions}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="materials">
                            <AccordionTrigger>Materiales y Cuidados</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {product.materials}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Mobile size guide fallback */}
                    <div className="mt-8 md:hidden text-muted-foreground text-sm space-y-2 p-4 bg-muted/30 rounded-lg">
                        <p className="font-medium text-foreground">Referencia de tamaño:</p>
                        <p>• La Mini: Llaves + Tarjetero</p>
                        <p>• La Todoterreno: Móvil + Gafas + Cartera</p>
                        <p>• La Maxi: Botella 50cl + Agenda + Todo lo demás</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
