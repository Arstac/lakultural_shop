"use client";

import { useEffect, useState } from "react";
import { getTicketsByOrderId } from "@/app/actions/tickets";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket as TicketIcon, Calendar, MapPin } from "lucide-react";

import { use } from "react";

export default function TicketsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations("Tickets"); // Ensure messages exist or use fallback

    useEffect(() => {
        getTicketsByOrderId(id).then((data) => {
            setTickets(data);
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    if (tickets.length === 0) {
        return (
            <div className="container py-12 flex flex-col items-center gap-4">
                <TicketIcon className="w-16 h-16 text-muted-foreground" />
                <h1 className="text-2xl font-bold">No tickets found</h1>
                <p className="text-muted-foreground">We couldn't find any tickets for this order.</p>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Your Tickets</h1>
                <p className="text-muted-foreground">Present these QR codes at the entrance.</p>
            </div>

            <div className="space-y-6">
                {tickets.map((ticket) => (
                    <Card key={ticket._id} className="overflow-hidden border-2">
                        <CardHeader className="bg-primary/5 text-primary-foreground pb-4">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <TicketIcon className="w-5 h-5" />
                                {ticket.event?.title || "Unknown Event"}
                            </CardTitle>
                            <CardDescription className="space-y-1 mt-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    {ticket.event?.date ? new Date(ticket.event.date).toLocaleDateString() + ' ' + new Date(ticket.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBA"}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4" />
                                    {ticket.event?.location || "TBA"}
                                </div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center py-8 gap-4 bg-white">
                            <div className="bg-white p-2 rounded-lg border-2 border-black/10">
                                {/* Using QR Server API for display */}
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticket.code}`}
                                    alt="QR Code"
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="font-mono text-sm text-muted-foreground">{ticket.code}</p>
                                <p className="font-medium">{ticket.attendeeName}</p>
                                <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${ticket.status === 'active' ? 'bg-green-100 text-green-700' :
                                    ticket.status === 'used' ? 'bg-gray-100 text-gray-500 line-through' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {ticket.status.toUpperCase()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
