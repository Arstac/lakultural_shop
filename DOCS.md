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

---

## Resumen del Proyecto

Lakultural Music Shop es una plataforma híbrida de venta de música que combina la experiencia física (Vinilos) con la digital (MP3/WAV).
Los usuarios pueden:
- Navegar por una colección de Álbumes.
- **Reproducir previo** de las canciones (Player persistente).
- Comprar el **Vinilo Físico**.
- Comprar el **Álbum Digital**.
- Comprar **Canciones Individuales**.

### Catálogo Actual (Mock)
- **Neon Nights** (Synthwave) - La Kultural
- **Analog Dreams** (Lo-Fi) - The Vintage Collective
- **Urban Rhythms** (Hip Hop) - Metro Beats

---

## Stack Tecnológico

El stack base se mantiene respecto a la versión anterior:
- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS + Shadcn UI (Tipografía: Space Grotesk)
- **Estado**: Zustand (Carrito + Reproductor)
- **i18n**: next-intl
- **Pagos**: Stripe (Checkout + Webhooks)
- **Base de Datos**: Sanity.io (Productos + Pedidos)

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
        Home[Home Page]
        ProductPage[Product Detail]
    end

    subgraph "Global State (Zustand)"
        CartStore[Cart Store]
        PlayerStore[Player Store]
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
- **Order**: Registro de pedidos (Cliente, Items, Estado, Total).
- **HomePage**: Singleton para editar la Portada (Hero Image, Textos, CTA).

### Rutas
- `/studio`: Panel de administración (requiere login).
- Librería `lib/products.ts`: Contiene las queries GROQ para obtener datos.
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
- `event`: Entrada para evento.

**Estructura del CartItem:**
```typescript
interface CartItem {
    cartId: string; // Unique ID
    type: 'album_physical' | 'album_digital' | 'track' | 'event';
    album?: Album;
    track?: Track; // Solo si type === 'track'
    event?: Event; // Solo si type === 'event'
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

### `Player.tsx`
- Barra persistente en la parte inferior (`components/site/Player.tsx`).
- Incluido en `app/[locale]/layout.tsx`.
- Controles: Play/Pause, Prev/Next, Volumen.
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

---

## Sistema de Rutas

| Ruta | Descripción |
|------|-------------|
| `/[locale]/` | Home. Lista todos los álbumes. |
| `/[locale]/producto/[slug]` | Detalle del álbum y lista de canciones. |
| `/[locale]/events/[slug]` | Detalle del evento y compra de entradas. |
| `/[locale]/rework` | **Desactivado** (Legacy). |

---

## Server Actions

Ubicación: `app/actions/`

Funciones que se ejecutan en el servidor para operaciones sensibles o interacciones con APIs externas:

- **`auth.ts`**: Verificación del PIN de administrador (`verifyAdminPin`) para acceder al escáner de QR.
- **`sanity_orders.ts`**: Obtención de detalles de pedidos desde Sanity (`getSanityOrderDetails`) para la página de confirmación.
- **`stripe.ts`**: Recuperación de detalles de la sesión de Stripe (`getOrderDetails`) tras el pago.
- **`tickets.ts`**: Lógica central del sistema de entradas:
    - `getTicketsByOrderId`: Busca tickets asociados a un pedido.
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
   - **Pago (Stripe)**: Si total > 0. Webhook genera los tickets.
   - **Gratis (0€)**: Flow específico (`/api/checkout/free`) que crea Order y Tickets directamente en Sanity.
3. Success Page: Enlace a "Ver Entradas" o envío por email (pendiente de implementar email).
4. Visualización: `/tickets/[orderId]` muestra los códigos QR.

### 3. Validación (Admin)
- Ruta: `/qr`
- Protegida por PIN (`QR_ACCESS_PIN` en `.env`).
- Funcionalidad: Escáner de cámara (html5-qrcode) que valida el UUID contra Sanity.
- Lógica implementada en `app/actions/tickets.ts` (`validateTicket`):
  - Si existe y `status: 'active'` -> Marca como `used` y permite acceso.
  - Si `used` o `cancelled` -> Deniega acceso.

### 4. Variables de Entorno Nuevas
- `QR_ACCESS_PIN`: PIN para acceder al escáner.
- `SANITY_API_TOKEN`: Token con permisos de escritura (Editor) para crear Orders y Tickets y actualizar estado.
