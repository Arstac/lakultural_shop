import { getEventBySlug } from "@/lib/products";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Clock, Mail, Phone, User, ExternalLink } from "lucide-react";
import { EventPurchase } from "@/components/events/EventPurchase";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { EventDescription } from "@/components/site/EventDescription";

import { getTicketCount } from "@/app/actions/tickets";

export default async function EventPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;
    const event = await getEventBySlug(slug);

    if (!event) {
        notFound();
    }

    const soldCount = await getTicketCount(event.id);

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
                            <EventDescription description={event.description} />
                        </div>

                        {/* Location Map */}
                        {(event.mapUrl || event.location) && (() => {
                            // Helper to determine what to show
                            const isEmbedUrl = event.mapUrl?.includes('google.com/maps/embed') || event.mapUrl?.includes('output=embed');
                            const hasLocation = !!event.location;

                            // If we have a mapUrl but it's not an embed (e.g. share link), we show a button to open it
                            // validEmbedSrc will be the mapUrl if it's embeddable, OR a generated search embed if we have location
                            let validEmbedSrc = isEmbedUrl ? event.mapUrl : null;

                            if (!validEmbedSrc && hasLocation) {
                                // Fallback to search embed using location name
                                validEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                            }

                            return (
                                <div className="pt-8 border-t">
                                    <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                                        <MapPin className="w-6 h-6" />
                                        {event.location}
                                    </h3>

                                    {/* Map Embed - Only if we have a valid source */}
                                    {validEmbedSrc && (
                                        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm border bg-muted mb-4">
                                            <iframe
                                                src={validEmbedSrc}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                        </div>
                                    )}

                                    {/* External Link Button - If mapUrl exists (even if it's a share link) */}
                                    {event.mapUrl && (
                                        <div className="flex justify-end">
                                            <a
                                                href={event.mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                                            >
                                                Ver en Google Maps <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Organizer Contact */}
                        {event.organizer && (
                            <div className="pt-8 border-t">
                                <h3 className="text-2xl font-semibold mb-6">Organizado por</h3>
                                <div className="bg-card border rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start shadow-sm">
                                    <div className="relative w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-primary/20">
                                        <Image
                                            src={event.organizer.image}
                                            alt={event.organizer.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="text-center sm:text-left space-y-3">
                                        <h4 className="text-xl font-bold">{event.organizer.name}</h4>
                                        <div className="space-y-2 text-muted-foreground">
                                            {event.organizer.email && (
                                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    <a href={`mailto:${event.organizer.email}`} className="hover:text-primary transition-colors">
                                                        {event.organizer.email}
                                                    </a>
                                                </div>
                                            )}
                                            {event.organizer.phone && (
                                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    <a href={`tel:${event.organizer.phone}`} className="hover:text-primary transition-colors">
                                                        {event.organizer.phone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Purchase Card */}
                <div className="md:col-span-1">
                    <div className="sticky top-24">
                        <EventPurchase event={event} soldCount={soldCount} />
                    </div>
                </div>
            </div>
        </div>
    );
}
