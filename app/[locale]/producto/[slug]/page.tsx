import { products } from "@/lib/products";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/site/ProductDetail";
import { routing } from "@/i18n/routing";

interface ProductPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export async function generateStaticParams() {
    // Generate all combinations of locale + slug
    const params: { locale: string; slug: string }[] = [];
    for (const locale of routing.locales) {
        for (const product of products) {
            params.push({ locale, slug: product.slug });
        }
    }
    return params;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = products.find((p) => p.slug === slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-10 md:py-20">
            <ProductDetail product={product} />
        </div>
    );
}
