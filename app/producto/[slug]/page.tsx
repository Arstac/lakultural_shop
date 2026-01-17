import { products } from "@/lib/products";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/site/ProductDetail";

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    return products.map((product) => ({
        slug: product.slug,
    }));
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
