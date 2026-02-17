import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const to = searchParams.get("to") || "info@lakultural.eu";

    console.log("Testing sendOrderConfirmationEmail to:", to);

    try {
        await sendOrderConfirmationEmail({
            orderId: "TEST-123456",
            customerName: "Test User",
            customerEmail: to,
            items: [
                { title: "Test Ticket Event", quantity: 2, price: 0 },
                { title: "Test Paid Item", quantity: 1, price: 15.50 }
            ],
            total: 15.50
        }, [
            { code: "QR-CODE-1", eventName: "Test Event", attendeeName: "Test User" },
            { code: "QR-CODE-2", eventName: "Test Event", attendeeName: "Test User" }
        ]);

        return NextResponse.json({
            success: true,
            message: `Email sent to ${to} using lib/email.ts function`
        });

    } catch (error: any) {
        console.error("Test route error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
