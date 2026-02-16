"use server";

export async function verifyAdminPin(pin: string) {
    const correctPin = process.env.QR_ACCESS_PIN;
    if (!correctPin) {
        console.error("QR_ACCESS_PIN environment variable is not set");
        return false;
    }
    return pin === correctPin;
}
