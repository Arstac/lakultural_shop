import { getEvents } from "@/lib/products";
import { getSiteSettings } from "@/lib/siteSettings";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { PageBanner } from "@/components/site/PageBanner";

export default async function EventsPage() {
    const events = await getEvents();
    const t = await getTranslations("Events");
    const settings = await getSiteSettings();
    const primaryColor = settings?.colors?.primary || "#CCFF00";

    return (
        <div>
            <PageBanner
                title={t("title") || "Upcoming Events"}
                subtitle={t("description")}
                primaryColor={primaryColor}
            />
            <div className="container mx-auto px-4 py-8">

                {events.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                        <p className="text-xl">{t("noEvents") || "No upcoming events at the moment."}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <div key={event.id} className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md flex flex-col">
                                <Link href={`/events/${event.slug}`} className="block aspect-[16/9] relative overflow-hidden cursor-pointer">
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-10 pointer-events-none" />
                                    <Image
                                        src={event.image}
                                        alt={event.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full text-base font-medium border-2 flex items-center gap-1.5 z-20 shadow-sm">
                                        <Ticket className="w-4 h-4" />
                                        {event.price === 0 ? "FREE" : `${event.price}€`}
                                    </div>
                                </Link>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-semibold mb-2 line-clamp-1">{event.title}</h3>

                                    <div className="space-y-2 mb-4 text-muted-foreground text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground line-clamp-3 mb-6 flex-1 text-sm">
                                        {event.description}
                                    </p>

                                    <Button asChild className="w-full mt-auto transition-all duration-300 hover:scale-105 hover:opacity-90">
                                        <Link href={`/events/${event.slug}`}>
                                            {t("getTickets") || "Get Tickets"}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
