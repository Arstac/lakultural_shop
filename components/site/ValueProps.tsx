import { HandMetal, Droplets, Truck } from "lucide-react";

export function ValueProps() {
    return (
        <section className="py-16 bg-muted/50">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 rounded-full bg-primary/10 text-primary">
                            <HandMetal className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">Hecho a mano</h3>
                        <p className="text-muted-foreground">
                            Cada pieza es única, fabricada artesanalmente en nuestro taller local.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 rounded-full bg-primary/10 text-primary">
                            <Droplets className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">Tela Impermeable</h3>
                        <p className="text-muted-foreground">
                            Materiales resistentes a la lluvia para proteger tus pertenencias.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 rounded-full bg-primary/10 text-primary">
                            <Truck className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">Envío Rápido</h3>
                        <p className="text-muted-foreground">
                            Recibe tu Kroma en 24/48h y empieza a disfrutarla cuanto antes.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
