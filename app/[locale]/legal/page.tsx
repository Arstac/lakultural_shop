export default function LegalPage() {
    return (
        <div className="container max-w-3xl mx-auto px-4 py-16 text-muted-foreground">
            <h1 className="text-3xl font-bold text-foreground mb-8">Términos y Condiciones</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-4">1. Introducción</h2>
                    <p>
                        Bienvenido a KROMA. Al acceder y utilizar este sitio web, aceptas cumplir con los siguientes términos y condiciones.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-4">2. Envíos y Devoluciones</h2>
                    <p>
                        Realizamos envíos a toda la península en 24/48h. Si no estás satisfecho con tu compra, dispones de 14 días naturales para realizar cambios o devoluciones, siempre que el producto esté en perfecto estado.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-4">3. Garantía</h2>
                    <p>
                        Nuestras riñoneras están hechas a mano con materiales de alta calidad. Ofrecemos una garantía de 2 años contra defectos de fabricación.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-4">4. Privacidad</h2>
                    <p>
                        Tus datos personales son tratados con confidencialidad y solo se utilizan para procesar tu pedido y mejorar tu experiencia de compra.
                    </p>
                </section>
            </div>
        </div>
    );
}
