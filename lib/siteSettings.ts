import { client } from "./sanity.client";
import { groq } from "next-sanity";

export interface SiteSettings {
    title?: string;
    description?: string;
    radius?: number;
    colors?: {
        background?: string;
        foreground?: string;
        primary?: string;
        primaryForeground?: string;
        secondary?: string;
        secondaryForeground?: string;
        muted?: string;
        mutedForeground?: string;
        accent?: string;
        accentForeground?: string;
        border?: string;
        input?: string;
        ring?: string;
    };
    social?: {
        instagram?: string;
        contact?: string;
    };
}

const siteSettingsQuery = groq`*[_type == "siteSettings"][0] {
    title,
    description,
    radius,
    colors,
    social
}`;

export const getSiteSettings = async (): Promise<SiteSettings | null> => {
    try {
        const data = await client.fetch(siteSettingsQuery);
        return data;
    } catch (error) {
        console.error("Error fetching site settings:", error);
        return null;
    }
};
