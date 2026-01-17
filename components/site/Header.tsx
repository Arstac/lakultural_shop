import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { CartButton } from "@/components/site/CartButton";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="text-xl font-bold uppercase tracking-widest text-primary">
                        KROMA
                    </Link>
                </div>

                {/* Right Side: Social & Contact */}
                <div className="flex items-center gap-4">
                    <CartButton />
                    <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                    </Link>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="mailto:hola@kroma.com">
                            Contacto
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
