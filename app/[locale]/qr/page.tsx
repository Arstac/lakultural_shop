"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { verifyAdminPin } from "@/app/actions/auth";
import { validateTicket } from "@/app/actions/tickets";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Camera, CheckCircle, XCircle } from "lucide-react";

export default function QRScannerPage() {
    const [pin, setPin] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; ticket?: any } | null>(null);
    const [scannerActive, setScannerActive] = useState(false);
    const scannerRef = useRef<any>(null);

    const [scriptLoaded, setScriptLoaded] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const valid = await verifyAdminPin(pin);
        if (valid) {
            setIsAuthenticated(true);
        } else {
            alert("Invalid PIN");
        }
        setIsLoading(false);
    };

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (scannerRef.current) {
            scannerRef.current.pause(); // Pause scanning while processing
        }

        const result = await validateTicket(decodedText);
        setScanResult(result);

        // Resume scanning after a delay logic could be added here, 
        // or require manual reset. Manual reset is safer to read result.
    };

    const onScanFailure = (error: any) => {
        // handle scan failure, usually better to ignore and keep scanning
        // console.warn(`Code scan error = ${error}`);
    };

    const startScanner = () => {
        if (!isAuthenticated || !scriptLoaded) return;
        setScanResult(null);
        setScannerActive(true);

        // Allow DOM to update
        // Wait for DOM element and Script to be ready
        if (!(window as any).Html5QrcodeScanner) return;

        try {
            const html5QrcodeScanner = new (window as any).Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );
            html5QrcodeScanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = html5QrcodeScanner;
        } catch (e) {
            console.error("Error starting scanner", e);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        if (scannerRef.current) {
            scannerRef.current.resume();
        } else {
            startScanner();
        }
    };

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch((error: any) => {
                        console.error("Failed to clear html5QrcodeScanner. ", error);
                    });
                } catch (e) {
                    console.error("Error clearing scanner", e);
                }
            }
        };
    }, []);

    if (!isAuthenticated) {
        return (
            <div className="container flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Admin Access</CardTitle>
                        <CardDescription>Enter PIN to access QR Scanner</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Enter PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Access"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-xl mx-auto space-y-8">
            <Script
                src="https://unpkg.com/html5-qrcode"
                strategy="afterInteractive"
                onLoad={() => setScriptLoaded(true)}
            />

            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Ticket Scanner</h1>
                <p className="text-muted-foreground">Scan QR codes to validate entry.</p>
            </div>

            <Card>
                <CardContent className="p-6">
                    {!scannerActive && !scanResult ? (
                        <Button onClick={startScanner} className="w-full h-32 flex flex-col gap-2">
                            <Camera className="w-8 h-8" />
                            Start Scanner
                        </Button>
                    ) : (
                        <div id="reader" className="w-full"></div>
                    )}

                    {scanResult && (
                        <div className={`mt-6 p-4 rounded-lg flex flex-col items-center gap-2 text-center ${scanResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {scanResult.success ? (
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            ) : (
                                <XCircle className="w-12 h-12 text-red-600" />
                            )}
                            <h3 className="font-bold text-lg">{scanResult.message}</h3>
                            {scanResult.ticket && (
                                <div className="text-sm">
                                    <p>Attendee: {scanResult.ticket.attendeeName}</p>
                                    <p>Code: {scanResult.ticket.code}</p>
                                </div>
                            )}
                            <Button onClick={resetScanner} className="mt-4" variant={scanResult.success ? "default" : "destructive"}>
                                Scan Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
