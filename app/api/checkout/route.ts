import { NextResponse } from "next/server";
import Stripe from "stripe";
import { CartItem } from "@/lib/store";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

const SHIPPING_RATE_ID = process.env.STRIPE_SHIPPING_RATE_ID; // Optional if using free shipping

export async function POST(req: Request) {
    try {
        const { items } = (await req.json()) as { items: CartItem[] };

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Empty cart" }, { status: 400 });
        }

        // Transform cart items to Stripe line items
        const lineItems = items.map((item) => {
            // Priority: Use priceId IF it exists (ideal for production)
            // Fallback: Create ad-hoc price data (good for testing/prototyping)
            if (item.variant.priceId && item.variant.priceId.startsWith("price_")) {
                return {
                    price: item.variant.priceId,
                    quantity: item.quantity,
                }
            } else {
                return {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `${item.product.name} - ${item.variant.name}`,
                            description: item.product.description,
                            images: item.variant.image ? [new URL(item.variant.image, req.headers.get("origin") || "http://localhost:3000").toString()] : undefined,
                        },
                        unit_amount: Math.round(item.product.price * 100), // cents
                    },
                    quantity: item.quantity,
                }
            }
        });

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: lineItems,
            shipping_address_collection: {
                allowed_countries: ["ES"], // Spain only for now
            },
            // shipping_options: SHIPPING_RATE_ID ? [{ shipping_rate: SHIPPING_RATE_ID }] : [],
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0,
                            currency: 'eur',
                        },
                        display_name: 'Envío Estándar',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 2 },
                            maximum: { unit: 'business_day', value: 4 },
                        },
                    },
                },
            ],
            success_url: `${req.headers.get("origin")}/success`,
            cancel_url: `${req.headers.get("origin")}/`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
