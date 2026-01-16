export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string;
    features: string[];
    dimensions: string;
    materials: string;
    images: string[];
    stripeLink: string;
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
            "/placeholder-mini-2.jpg",
            "/placeholder-mini-3.jpg"
        ],
        stripeLink: "https://buy.stripe.com/test_placeholder_mini"
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
            "/placeholder-todo-2.jpg",
            "/placeholder-todo-3.jpg"
        ],
        stripeLink: "https://buy.stripe.com/test_placeholder_todoterreno"
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
            "/placeholder-maxi-2.jpg",
            "/placeholder-maxi-3.jpg"
        ],
        stripeLink: "https://buy.stripe.com/test_placeholder_maxi"
    }
];
