"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const locales = [
    { code: "ca", label: "Català" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
];

interface LanguageSwitcherProps {
    primaryColor?: string;
}

export function LanguageSwitcher({ primaryColor }: LanguageSwitcherProps) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [hovered, setHovered] = useState(false);

    const handleLocaleChange = (newLocale: string) => {
        // Replace current locale in path
        const segments = pathname.split("/");
        if (segments[1] && ["ca", "es", "fr", "en"].includes(segments[1])) {
            segments[1] = newLocale;
        } else {
            segments.splice(1, 0, newLocale);
        }
        const newPath = segments.join("/") || `/${newLocale}`;
        router.replace(newPath);
    };

    const currentLocale = locales.find((l) => l.code === locale);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 transition-colors duration-300 hover:bg-transparent"
                    style={{ color: hovered && primaryColor ? primaryColor : undefined }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentLocale?.label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map((l) => (
                    <DropdownMenuItem
                        key={l.code}
                        onClick={() => handleLocaleChange(l.code)}
                        className={locale === l.code ? "bg-accent" : ""}
                    >
                        {l.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
