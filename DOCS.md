# Lakultural Music Shop - Documentación Técnica

**Versión:** 2.0.0
**Última actualización:** Febrero 2026
**Tipo de proyecto:** Tienda de Música (Vinilos y Digital)
**URL Local:** http://localhost:3001

---

## Índice
1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Modelo de Datos](#modelo-de-datos)
5. [Gestión del Estado (Zustand)](#gestión-del-estado-zustand)
6. [Componentes Principales](#componentes-principales)
7. [Server Actions](#server-actions)
8. [Sistema de Rutas](#sistema-de-rutas)
9. [Internacionalización](#internacionalización)
10. [Sistema de Diseño: The Studio Lab](#sistema-de-diseño-the-studio-lab)

---

## Resumen del Proyecto

Lakultural Music Shop es una plataforma híbrida de venta de música que combina la experiencia física (Vinilos) con la digital (MP3/WAV).
Los usuarios pueden:
- Navegar por una colección de Álbumes.
- **Reproducir previo** de las canciones (Player persistente).
- Comprar el **Vinilo Físico**.
- Comprar el **Álbum Digital**.
- Comprar **Canciones Individuales**.
- Comprar **Merchandising** (Ropa y Accesorios).

### Catálogo Actual (Mock)
- **Neon Nights** (Synthwave) - La Kultural
- **Analog Dreams** (Lo-Fi) - The Vintage Collective
- **Urban Rhythms** (Hip Hop) - Metro Beats

---

## Stack Tecnológico

El stack base se mantiene respecto a la versión anterior:
- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS + Shadcn UI + **Framer Motion** (Animaciones)
- **Estado**: Zustand (Carrito + Reproductor)
- **i18n**: next-intl
- **Pagos**: Stripe (Checkout + Webhooks)
- **Base de Datos**: Sanity.io (Productos + Pedidos)
- **Emails**: Nodemailer (Notificaciones de pedidos)

---

## Arquitectura del Proyecto

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Navegador]
    end

    subgraph "Layout & Context"
        Layout[Root Layout]
        Intl[NextIntlProvider]
        PlayerBar[Music Player (Sticky)]
    end

    subgraph "Pages"
        Home[Home Page (Parallax)]
        ProductPage[Product Detail]
        CollectionPage[Collection Page]
        EventsPage[Events Page]
    end

    subgraph "Global State (Zustand)"
        CartStore[Cart Store]
        PlayerStore[Player Store]
    end

    subgraph "Data & CMS"
        Sanity[Sanity.io CMS]
        Albums[Albums Data (lib/products)]
        HomePage[Home Content]
    end

    Browser --> Layout
    Layout --> Intl
    Intl --> Home
    Intl --> ProductPage
    Intl --> CollectionPage
    Intl --> EventsPage
    Layout --> PlayerBar
    
    Sanity --> Albums
    Sanity --> HomePage
    Home --> Albums
    Home --> HomePage
    ProductPage --> Albums
    
    Home -- Add to Cart --> CartStore
    ProductPage -- Play Track --> PlayerStore
    PlayerBar -- Read State --> PlayerStore
```

---

## Integración CMS (Sanity.io)

Se ha integrado **Sanity.io** para gestionar el contenido dinámico sin necesidad de desplegar código.

### Schemas
- **Album**: Productos principales (Título, Artista, Precios, Tracks).
- **Track**: Canciones individuales (Audio Preview [MP3], Precio).
- **Merch**: Productos de merchandising (Precio, Tallas, Stock, Imágenes).
- **Order**: Registro de pedidos (Cliente, Items, Estado, Total).
- **HomePage**: Singleton para editar la Portada (Hero Image, Textos, CTA).

### Rutas
- `/studio`: Panel de administración (requiere login).
- Librería `lib/products.ts`: Contiene las queries GROQ para obtener datos.
- Librería `lib/sanity.server.ts`: Cliente de Sanity **con permisos de escritura** (usa `SANITY_API_TOKEN`) para operaciones server-side (checkout, tickets).
- Fallback: Si Sanity no devuelve datos, se usa contenido estático de seguridad.

---

## Modelo de Datos

Ubicación: `lib/products.ts`

### Track
```typescript
interface Track {
    id: string;
    title: string;
    duration: string;
    previewUrl: string;
    price: number; // Precio individual
}
```

### Album
```typescript
interface Album {
    id: string;
    title: string;
    artist: string;
    slug: string;
    description: string;
    coverImage: string;
    physicalPrice: number; // Precio Vinilo
    digitalPrice: number;  // Precio Digital
    tracks: Track[];
    genre: string;
}

### Merch
```typescript
interface Merch {
    id: string;
    title: string;
    slug: string;
    price: number;
    images: string[];
    description: string;
    sizes: string[];
    stock: number;
}
```
```

### Order
```typescript
interface Order {
    orderId: string; // Stripe Session ID
    customerName: string;
    customerEmail: string;
    amount: number;
    status: 'pending' | 'paid' | 'shipped' | 'cancelled';
    items: {
        name: string;
        type: string;
        quantity: number;
        price: number;
    }[];
    createdAt: string;
}
```

---

## Gestión del Estado (Zustand)

Ubicación: `lib/store.ts`

### 1. Cart Store (`useCart`)
Gestiona el carrito de compras. Soporta tres tipos de items:
- `album_physical`: Vinilo.
- `album_digital`: Descarga completa.
- `track`: Canción individual.
- `album_physical`: Vinilo.
- `album_digital`: Descarga completa.
- `track`: Canción individual.
- `event`: Entrada para evento.
- `merch`: Producto de merchandising.

**Estructura del CartItem:**
```typescript
interface CartItem {
    cartId: string; // Unique ID
    type: 'album_physical' | 'album_digital' | 'track' | 'event' | 'merch';
    album?: Album;
    track?: Track; // Solo si type === 'track'
    event?: Event; // Solo si type === 'event'
    merch?: Merch; // Solo si type === 'merch'
    size?: string; // Solo si type === 'merch'
    quantity: number;
}
```

### 2. Player Store (`usePlayer`)
Gestiona la reproducción de música global.
- `currentTrack`: Pista actual.
- `isPlaying`: Estado de reproducción.
- `play(track, album)`: Inicia reproducción.
- `toggle()`: Pausa/Reanuda.

---

## Componentes Principales

### `CollectionViews.tsx`
- **Nuevo**: Componente cliente para la página de colección (`components/site/CollectionViews.tsx`).
- **Funcionalidad**: Permite alternar entre vista de "Vinilos" (Grid de álbumes) y "Música" (Lista de canciones).
- **Estado**: Gestiona localmente la vista activa.
- **Integración**: Usa `useCart` y `usePlayer` para reproducir música y añadir al carrito desde la lista.

### `ParallaxHome.tsx`
- **Nuevo**: Componente principal de la Home con efectos de scroll (Framer Motion).
- **Estructura**:
  - Hero Sticky: Imagen de fondo fija que se escala y desvanece al hacer scroll.
  - Título Animado: Aparece desde abajo (`translateY`) y cambia de opacidad.
  - Capa de Contenido: Se desliza sobre el Hero creando un efecto de profundidad.
- Recibe `EventBanner` como prop (`slot`) para evitar problemas de componentes servidor/cliente.

### `Player.tsx`
- Barra persistente en la parte inferior (`components/site/Player.tsx`).
- Incluido en `app/[locale]/layout.tsx`.
- Controles: Play/Pause, Prev/Next, Volumen.
- **Seek Slider**: Barra de progreso interactiva con tiempo transcurrido y restante. Permite avanzar y retroceder en la canción arrastrando el slider.
- Muestra: Carátula, Título, Artista.

### `ProductCard.tsx`
- Diseño estilo "Vinilo" con animación mejorada (mayor desplazamiento).
- Efecto hover: El disco sale de la funda y la carátula se oscurece.
- **Interacción**: Toda la imagen es clicable y lleva al detalle del producto.
- Muestra precios de Vinilo y Digital.

### `ProductDetail.tsx`
- Página de detalle del álbum.
- **Tracklist interactivo**: Botones de Play para cada canción.
- **Opciones de Compra**: Bloque para Vinilo/Digital y botones individuales por canción.
- **Carrito**: Botón de "Añadir al carrito" individual para cada canción.

### `CartSheet.tsx`
- Adaptado para mostrar iconos diferentes según el tipo de producto (Disco, Descarga, Nota Musical).
- Calcula totales sumando precios variados.

### `EventBanner.tsx`
- Componente visual para la Home.
- Muestra el próximo evento destacado con fecha, lugar y precio.
- **Mejora UI**: Refactorizado para eliminar contenedores redundantes. Diseño responsive con botones apilados en móvil para asegurar visibilidad.
- Botones para "Conseguir Entradas" o "Ver todos los eventos".

### `EventDescription.tsx`
- **Nuevo**: Componente para renderizar descripciones de eventos.
- **Funcionalidad**:
  - Parsea Markdown (negritas, listas, etc.) usando `react-markdown`.
  - Detecta automáticamente handles de Instagram (`@usuario`) y los convierte en badges estilizados con gradiente.
  - Abre los enlaces de Instagram en una nueva pestaña.

### `CountdownBanner.tsx`
- **Nuevo**: Componente cliente (`components/site/CountdownBanner.tsx`).
- **Funcionalidad**: Muestra una cuenta atrás en tiempo real hasta la fecha del próximo evento.
- **Diseño**: Estética "Técnica" con colores de alto contraste (Verde Ácido/Negro).
- **Integración**: Se inyecta en `ParallaxHome` y aparece con animación `sticky` al hacer scroll.
- **Lógica**: Recibe el evento más próximo desde `page.tsx` (filtrado por fecha). Si no hay eventos futuros, no se renderiza.

---

## Sistema de Rutas

| Ruta | Descripción |
|------|-------------|
| `/[locale]/` | Home Parallax. Hero dinámico + Event Banner + Lista de Álbumes. |
| `/[locale]/collection` | Música. Colección completa de álbumes. |
| `/[locale]/producto/[slug]` | Detalle del álbum y lista de canciones. |
| `/[locale]/events` | Lista de eventos próximos. |
| `/[locale]/events/[slug]` | Detalle del evento y compra de entradas. |
| `/[locale]/events` | Lista de eventos próximos. |
| `/[locale]/events/[slug]` | Detalle del evento y compra de entradas. |
| `/[locale]/merch` | Lista de productos de merchandising. |
| `/[locale]/merch/[slug]` | Detalle del producto de merchandising (selección de talla). |
| `/[locale]/rework` | **Desactivado** (Legacy). |

---

## Server Actions

Ubicación: `app/actions/`

Funciones que se ejecutan en el servidor para operaciones sensibles o interacciones con APIs externas:

- **`auth.ts`**: Verificación del PIN de administrador (`verifyAdminPin`) para acceder al escáner de QR.
- **`sanity_orders.ts`**: Obtención de detalles de pedidos desde Sanity (`getSanityOrderDetails`) para la página de confirmación.
- **`stripe.ts`**: Recuperación de detalles de la sesión de Stripe (`getOrderDetails`) tras el pago.
- **`tickets.ts`**: Lógica central del sistema de entradas:
    - `getTicketsByOrderId`: Busca tickets asociados a un pedido. Soporta búsqueda por:
        - `code` (UUID del ticket).
        - `order._ref` (ID interno de Sanity).
        - `order.orderId` (ID público del pedido).
    - `validateTicket`: Valida y "quema" (marca como usado) un ticket mediante su código QR.

---

## Internacionalización

Se mantienen los archivos en `messages/` (es, en, ca, fr).
**Estado:** Completo. Las traducciones para los 4 idiomas están implementadas, incluyendo nuevos términos para eventos y checkout.

---

## Sistema de Entradas (Eventos y QR)

### 1. Nuevos Schemas (Sanity)

**Event**
- Representa un evento físico (con fecha, lugar, precio, imagen).
- Se puede añadir al carrito como un producto más (type: 'event').
- **Interacción**: Las tarjetas de eventos son clicables en la imagen y tienen efecto de oscurecido al pasar el mouse.
- **Nuevos Campos**:
  - `mapUrl`: URL para embeber mapa (Google Maps). **Si se deja vacío, se usa la `location` para generar uno automático.**
  - `organizer`: Objeto con `name`, `email`, `phone`, `image`.
  - `earlyBirdPrice`: Precio reducido para las primeras X entradas.
  - `earlyBirdLimit`: Cantidad de entradas disponibles a precio reducido.
  - `earlyBirdDeadline`: Fecha límite para el precio reducido.

**Ticket**
- Se genera automáticamente tras la compra de un Evento.
- Campos:
  - `code`: UUID único (QR).
  - `status`: 'active' | 'used' | 'cancelled'.
  - `event`: Referencia al Evento.
  - `order`: Referencia al Pedido.
  - `attendeeName` / `attendeeEmail`: Datos del asistente.

### 2. Flujo de Compra y Generación
1. Usuario añade Evento al carrito.
2. Checkout:
   - **Validación de Precio (Seguridad)**: Tanto Stripe como el flujo gratuito recalcula el precio en el servidor (`api/checkout`) consultando Sanity en tiempo real. Esto permite aplicar precios dinámicos (Early Bird) de forma segura sin confiar en el cliente.
   - **Pago (Stripe)**: Si total > 0. Webhook genera los tickets.
   - **Gratis (0€)**: Flow específico (`/api/checkout/free`) que crea Order y Tickets directamente en Sanity.
3. Success Page: Enlace a "Ver Entradas" o envío por email (pendiente de implementar email).
4. Visualización: `/tickets/[id]` muestra los códigos QR. El parámetro `[id]` puede ser el OrderId, el ID interno de Sanity o el UUID del Ticket.

### 3. Validación (Admin)
- Ruta: `/qr`
- Protegida por PIN (`QR_ACCESS_PIN` en `.env`).
- Funcionalidad: Escáner de cámara (html5-qrcode) que valida el UUID contra Sanity.
- **Mejora**: Inicialización controlada mediante `useEffect` para evitar condiciones de carrera en la carga del elemento DOM.
- Lógica implementada en `app/actions/tickets.ts` (`validateTicket`):
  - Si existe y `status: 'active'` -> Marca como `used` y permite acceso.
  - Si `used` o `cancelled` -> Deniega acceso.

### 4. Variables de Entorno Nuevas
- `QR_ACCESS_PIN`: PIN para acceder al escáner.
- `SANITY_API_TOKEN`: Token con permisos de escritura (Editor) para crear Orders y Tickets y actualizar estado.

### 5. Configuración SMTP (Ionos)
Dado que el dominio `lakultural.eu` utiliza Ionos, la configuración recomendada para el archivo `.env.local` es:

```env
SMTP_HOST=smtp.ionos.es
SMTP_PORT=587
SMTP_USER=info@lakultural.eu
SMTP_PASS=tu_contraseña_del_correo
```

---

## Sistema de Diseño: The Studio Lab

El proyecto ha evolucionado hacia una estética "Technical & Acid" inspirada en secuenciadores de música y espacios de ingeniería de sonido.

### Principios Visuales
- **Minimalismo Técnico**: Ausencia de adornos. La belleza está en la función y la estructura.
- **Contraste Extremo**: Blanco puro vs Negro absoluto.
- **Acento Digital**: Uso de un verde ácido (#CCFF00) para indicar interactividad y estado activo.

### Paleta de Colores (Regla 60-30-10)
| Color | Hex | Uso | Porcentaje |
|-------|-----|-----|------------|
| **Base** | `#FFFFFF` | Fondo general | 60% |
| **Grid** | `#E5E5E5` | Rejilla técnica (Muted) | - |
| **Structure** | `#000000` | Textos, bordes, divisores | 30% |
| **Accent** | `#CCFF00` | Botones, hovers, cursores | 10% |

### Componentes Clave
1.  **GridBackground**: Fondo interactivo con rejilla técnica. Las celdas se iluminan en verde ácido al paso del ratón.
2.  **ProductCard**: Tarjetas con bordes negros sólidos (`border-2 border-black`). Tipografía mono-espaciada para detalles técnicos. Mantiene el efecto de "disco de vinilo" al hacer hover.
4.  **Header**: Fondo blanco translúcido (`rgba(255,255,255,0.9)`) con textos y bordes negros. El botón de **Contacto** utiliza el color **Primario** definido en Sanity (`settings.colors.primary`).
5.  **Botones y Enlaces**:
    -   **Ver Álbum / Conseguir Entradas**: Escala (1.05) y cambio de opacidad (0.9) progresivo (`duration-300`).
    -   **Logo**: Rotación de 12-15 grados al hacer hover.
    -   **Navegación**: Escala (1.10) y texto en negrita al hacer hover.
