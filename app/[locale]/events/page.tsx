import { getEvents } from "@/lib/products";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket } from "lucide-react";

export default async function EventsPage() {
    const events = await getEvents();
    const t = useTranslations("Events"); // You might need to add translations later

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">{t("title") || "Upcoming Events"}</h1>

            {events.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <p className="text-xl">{t("noEvents") || "No upcoming events at the moment."}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <div key={event.id} className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md flex flex-col">
                            <div className="aspect-[16/9] relative overflow-hidden">
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1">
                                    <Ticket className="w-3 h-3" />
                                    {event.price === 0 ? "FREE" : `${event.price}€`}
                                </div>
                            </div>

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

                                <Button asChild className="w-full mt-auto">
                                    <Link href={`/tickets/${event.slug}`}>
                                        {t("getTickets") || "Get Tickets"}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
