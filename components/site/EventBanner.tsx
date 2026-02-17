import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Event } from "@/lib/products";
import { getTranslations } from "next-intl/server";

interface EventBannerProps {
    events: Event[];
    locale: string;
}

export async function EventBanner({ events, locale }: EventBannerProps) {
    const t = await getTranslations("Events");

    if (!events || events.length === 0) {
        return null;
    }

    // Get the next upcoming event
    const nextEvent = events[0];
    const date = new Date(nextEvent.date);

    return (
        <section className="w-full bg-muted/50 py-12 border-y">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-8 bg-card rounded-xl overflow-hidden shadow-lg border">
                    {/* Image Side */}
                    <div className="w-full md:w-1/2 aspect-video md:aspect-[16/9] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10" />
                        <Image
                            src={nextEvent.image}
                            alt={nextEvent.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold z-20 shadow-md">
                            {t("title") || "Upcoming Event"}
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold mb-4">{nextEvent.title}</h2>

                        <div className="flex flex-col gap-3 mb-6 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span className="text-lg">
                                    {date.toLocaleDateString(locale, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                                <span className="text-lg">
                                    {date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span className="text-lg">{nextEvent.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-primary" />
                                <span className="text-lg font-medium">
                                    {nextEvent.price === 0 ? t("free") : `${nextEvent.price}€`}
                                </span>
                            </div>
                        </div>

                        <p className="text-muted-foreground mb-8 line-clamp-3">
                            {nextEvent.description}
                        </p>

                        <div className="flex gap-4">
                            <Button asChild size="lg" className="w-full md:w-auto">
                                <Link href={`/${locale}/events/${nextEvent.slug}`}>
                                    {t("getTickets") || "Get Tickets"}
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full md:w-auto">
                                <Link href={`/${locale}/events`}>
                                    See All Events
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
