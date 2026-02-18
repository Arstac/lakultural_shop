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

export interface DashboardOrder {
    _id: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    status: string;
    items: { name: string; type: string; quantity: number; price: number }[];
    createdAt: string;
}

export interface DashboardTicket {
    _id: string;
    code: string;
    status: string;
    eventTitle: string;
    attendeeName: string;
    attendeeEmail: string;
}

export interface DashboardEvent {
    _id: string;
    title: string;
    date: string;
    price: number;
    ticketCount: number;
}

export interface DashboardMerch {
    _id: string;
    title: string;
    price: number;
    stock: number;
}

export interface DashboardAlbum {
    _id: string;
    title: string;
    artist: string;
    physicalPrice: number;
    digitalPrice: number;
}

export interface DashboardSummary {
    totalRevenue: number;
    totalOrders: number;
    ticketsSold: number;
    merchSold: number;
    musicSold: number;
    averageOrderValue: number;
}

export interface DashboardData {
    orders: DashboardOrder[];
    tickets: DashboardTicket[];
    events: DashboardEvent[];
    merch: DashboardMerch[];
    albums: DashboardAlbum[];
    summary: DashboardSummary;
}

export async function getDashboardData(): Promise<DashboardData> {
    // Fetch all data in parallel
    const [orders, tickets, events, merch, albums] = await Promise.all([
        client.fetch<DashboardOrder[]>(`*[_type == "order"] | order(createdAt desc) {
            _id,
            orderId,
            customerName,
            customerEmail,
            amount,
            status,
            items[] { name, type, quantity, price },
            createdAt
        }`),
        client.fetch<DashboardTicket[]>(`*[_type == "ticket"] {
            _id,
            code,
            status,
            "eventTitle": event->title,
            attendeeName,
            attendeeEmail
        }`),
        client.fetch<any[]>(`*[_type == "event"] {
            _id,
            title,
            date,
            price,
            "ticketCount": count(*[_type == "ticket" && event._ref == ^._id])
        }`),
        client.fetch<DashboardMerch[]>(`*[_type == "merch"] {
            _id,
            title,
            price,
            stock
        }`),
        client.fetch<DashboardAlbum[]>(`*[_type == "album"] {
            _id,
            title,
            artist,
            physicalPrice,
            digitalPrice
        }`),
    ]);

    // Calculate summary from orders
    const safeOrders = orders || [];
    const safeTickets = tickets || [];

    let totalRevenue = 0;
    let ticketsSold = 0;
    let merchSold = 0;
    let musicSold = 0;

    for (const order of safeOrders) {
        if (order.status === "paid" || order.status === "shipped") {
            totalRevenue += order.amount || 0;
        }
        if (order.items) {
            for (const item of order.items) {
                const qty = item.quantity || 1;
                if (item.type === "event") ticketsSold += qty;
                else if (item.type === "merch") merchSold += qty;
                else musicSold += qty; // physical, digital, track
            }
        }
    }

    const paidOrders = safeOrders.filter(o => o.status === "paid" || o.status === "shipped");

    return {
        orders: safeOrders,
        tickets: safeTickets,
        events: events || [],
        merch: merch || [],
        albums: albums || [],
        summary: {
            totalRevenue,
            totalOrders: safeOrders.length,
            ticketsSold,
            merchSold,
            musicSold,
            averageOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
        },
    };
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
        const order = await client.fetch<{ _id: string } | null>(
            `*[_type == "order" && orderId == $orderId][0]{ _id }`,
            { orderId }
        );
        if (!order) return { success: false, message: "Order not found" };
        await client.patch(order._id).set({ status: newStatus }).commit();
        return { success: true };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, message: "Error updating order" };
    }
}

export async function cancelTicket(ticketId: string) {
    try {
        await client.patch(ticketId).set({ status: "cancelled" }).commit();
        return { success: true };
    } catch (error) {
        console.error("Error cancelling ticket:", error);
        return { success: false, message: "Error cancelling ticket" };
    }
}

export async function updateMerchStock(merchId: string, newStock: number) {
    try {
        await client.patch(merchId).set({ stock: newStock }).commit();
        return { success: true };
    } catch (error) {
        console.error("Error updating merch stock:", error);
        return { success: false, message: "Error updating stock" };
    }
}
