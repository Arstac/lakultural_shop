"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "cookie-consent";

export function CookieConsent() {
    const t = useTranslations("Cookies");
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(STORAGE_KEY);
        if (!consent) {
            // Small delay so it doesn't flash on initial load
            const timer = setTimeout(() => setVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(STORAGE_KEY, "accepted");
        setVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem(STORAGE_KEY, "rejected");
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-24 md:max-w-md z-[60] font-mono"
                >
                    <div className="bg-black text-white border-2 border-white/20 rounded-lg p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                        {/* Close button */}
                        <button
                            onClick={handleReject}
                            className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Content */}
                        <div className="flex items-start gap-3 mb-4">
                            <Cookie className="h-5 w-5 text-[#CCFF00] mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-white/80 leading-relaxed pr-4">
                                {t("message")}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleAccept}
                                className="flex-1 bg-[#CCFF00] text-black text-sm font-bold uppercase tracking-wider py-2.5 px-4 rounded hover:bg-[#b8e600] active:scale-95 transition-all duration-200"
                            >
                                {t("accept")}
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 bg-transparent text-white/60 text-sm font-bold uppercase tracking-wider py-2.5 px-4 rounded border border-white/20 hover:border-white/40 hover:text-white active:scale-95 transition-all duration-200"
                            >
                                {t("reject")}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
