import { getEventBySlug } from "@/lib/products";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Clock } from "lucide-react";
import { EventPurchase } from "@/components/events/EventPurchase";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export default async function EventPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;
    const event = await getEventBySlug(slug);

    if (!event) {
        notFound();
    }

    const date = new Date(event.date);

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Image & Details */}
                <div className="md:col-span-2 space-y-8">
                    <div className="aspect-video relative rounded-xl overflow-hidden shadow-md">
                        <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold">{event.title}</h1>

                        <div className="flex flex-wrap gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{date.toLocaleDateString(locale, { dateStyle: 'long' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>{event.location}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none pt-4 text-foreground/90 leading-relaxed whitespace-pre-line">
                            {event.description}
                        </div>
                    </div>
                </div>

                {/* Right Column: Purchase Card */}
                <div className="md:col-span-1">
                    <div className="sticky top-24">
                        <EventPurchase event={event} />
                    </div>
                </div>
            </div>
        </div>
    );
}
