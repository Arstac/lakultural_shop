export interface Variant {
    id: string;
    name: string;
    description?: string;
    image: string; // Specific image for this variant
    priceId?: string; // Stripe Price ID (starts with price_...)
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string;
    features: string[];
    dimensions: string;
    materials: string;
    images: string[]; // Fallback gallery
    variants: Variant[];
    category?: 'standard' | 'rework';
}

export const products: Product[] = [
    {
        id: "mini",
        name: "La Mini",
        slug: "la-mini",
        price: 20,
        description: "Perfecta para lo esencial. Llaves, tarjetas y poco más. Libertad total.",
        features: [
            "Compacta y ligera",
            "Correa ajustable",
            "Cierre de seguridad"
        ],
        dimensions: "15cm x 10cm x 5cm",
        materials: "Nylon impermeable de alta resistencia.",
        images: [
            "/placeholder-mini-1.jpg",
            "/placeholder-mini-2.jpg"
        ],
        variants: [
            { id: "mini-black", name: "Negro", image: "/placeholder-mini-1.jpg", priceId: "replace_with_price_id_mini_black" },
            { id: "mini-olive", name: "Verde Oliva", image: "/placeholder-mini-2.jpg", priceId: "replace_with_price_id_mini_olive" }
        ],
        category: 'standard'
    },
    {
        id: "todoterreno",
        name: "La Todoterreno",
        slug: "la-todoterreno",
        price: 25,
        description: "El equilibrio perfecto. Cabe el móvil, gafas y cartera. Tu compañera diaria.",
        features: [
            "Tamaño versátil",
            "Bolsillo interior con cremallera",
            "Tela resistente al agua"
        ],
        dimensions: "20cm x 14cm x 6cm",
        materials: "Lona encerada y forro de algodón.",
        images: [
            "/placeholder-todo-1.jpg",
            "/placeholder-todo-2.jpg"
        ],
        variants: [
            { id: "todo-navy", name: "Azul Marino", image: "/placeholder-todo-1.jpg", priceId: "replace_with_price_id_todo_navy" },
            { id: "todo-sand", name: "Arena", image: "/placeholder-todo-2.jpg", priceId: "replace_with_price_id_todo_sand" },
            { id: "todo-terracotta", name: "Terracota", image: "/placeholder-todo-3.jpg", priceId: "replace_with_price_id_todo_terracotta" }
        ],
        category: 'standard'
    },
    {
        id: "maxi",
        name: "La Maxi",
        slug: "la-maxi",
        price: 30,
        description: "Para los que no dejan nada en casa. Botella de agua, agenda y más.",
        features: [
            "Gran capacidad",
            "Doble compartimento",
            "Refuerzo en la base"
        ],
        dimensions: "25cm x 18cm x 8cm",
        materials: "Cordura 1000D y cremalleras YKK.",
        images: [
            "/placeholder-maxi-1.jpg",
            "/placeholder-maxi-2.jpg"
        ],
        variants: [
            { id: "maxi-camo", name: "Camuflaje", image: "/placeholder-maxi-1.jpg", priceId: "replace_with_price_id_maxi_camo" },
            { id: "maxi-black", name: "Negro Total", image: "/placeholder-maxi-2.jpg", priceId: "replace_with_price_id_maxi_black" }
        ],
        category: 'standard'
    },
    // REWORK ITEMS
    {
        id: "rework-denim-01",
        name: "Kroma Denim Vol.1",
        slug: "kroma-denim-vol-1",
        price: 45,
        description: "Pieza única confeccionada a partir de tejanos vintage recuperados.",
        features: [
            "Pieza única 1/1",
            "Tejido denim reciclado",
            "Forro interior estampado"
        ],
        dimensions: "22cm x 15cm x 6cm",
        materials: "Denim vintage 100% algodón.",
        images: [
            "/rework-placeholder.png"
        ],
        variants: [
            { id: "rework-denim-01", name: "Denim Único", image: "/rework-placeholder.png", priceId: "replace_with_price_id_rework_01" }
        ],
        category: 'rework'
    },
    {
        id: "rework-patchwork-01",
        name: "Patchwork Ecléptico",
        slug: "patchwork-ecleptico",
        price: 50,
        description: "Mezcla de texturas y colores en una composición irrepetible.",
        features: [
            "Diseño Patchwork exclusivo",
            "Correa de seguridad reforzada",
            "Bolsillo secreto"
        ],
        dimensions: "20cm x 14cm x 6cm",
        materials: "Retales de algodón y lona técnica.",
        images: [
            "/rework-placeholder.png"
        ],
        variants: [
            { id: "rework-patchwork-01", name: "Patchwork", image: "/rework-placeholder.png", priceId: "replace_with_price_id_rework_02" }
        ],
        category: 'rework'
    }
];
