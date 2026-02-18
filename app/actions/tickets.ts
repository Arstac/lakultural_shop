"use server";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

export async function getTicketsByOrderId(orderId: string) {
    if (!orderId) return [];

    try {
        // Find the Order _id first because tickets reference user's orderId by reference to document, 
        // but easier to search by order->orderId
        // Search by:
        // 1. Ticket Code (direct match)
        // 2. Order internal ID (_ref)
        // 3. Order external ID (orderId field)
        const query = `*[_type == "ticket"] {
            _id,
            code,
            status,
            attendeeName,
            "event": event->{
                title,
                date,
                location,
                image
            },
            "order": order->{
                _id,
                orderId
            }
        }[code == $orderId || order._id == $orderId || order.orderId == $orderId]`;

        const tickets = await client.fetch(query, { orderId });
        return tickets;
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return [];
    }
}

export async function validateTicket(code: string) {
    if (!code) return { success: false, message: "No code provided" };

    try {
        const ticket = await client.fetch(`*[_type == "ticket" && code == $code][0]`, { code });

        if (!ticket) {
            return { success: false, message: "Ticket not found" };
        }

        if (ticket.status === 'used') {
            return { success: false, message: "Ticket already used", ticket };
        }

        if (ticket.status === 'cancelled') {
            return { success: false, message: "Ticket is cancelled", ticket };
        }

        // Update status to used
        await client.patch(ticket._id)
            .set({ status: 'used' })
            .commit();

        return { success: true, message: "Ticket validated successfully", ticket };

    } catch (error) {
        console.error("Error validating ticket:", error);
        return { success: false, message: "Error validating ticket" };
    }
}

export async function getTicketCount(eventId: string) {
    try {
        const count = await client.fetch(`count(*[_type == "ticket" && event._ref == $eventId && status != "cancelled"])`, { eventId });
        return count;
    } catch (error) {
        console.error("Error counting tickets:", error);
        return 0;
    }
}
