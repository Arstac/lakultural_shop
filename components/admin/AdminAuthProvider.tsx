"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { verifyAdminPin } from "@/app/actions/auth";

interface AdminAuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (pin: string) => Promise<boolean>;
    logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
    return ctx;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (pin: string) => {
        setIsLoading(true);
        const valid = await verifyAdminPin(pin);
        if (valid) setIsAuthenticated(true);
        setIsLoading(false);
        return valid;
    };

    const logout = () => setIsAuthenticated(false);

    return (
        <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}
