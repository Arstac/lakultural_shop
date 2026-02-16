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
7. [Sistema de Rutas](#sistema-de-rutas)
8. [Internacionalización](#internacionalización)

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
- **UI**: Tailwind CSS + Shadcn UI
- **Estado**: Zustand (Carrito + Reproductor)
- **i18n**: next-intl
- **Pagos**: Stripe (integración API)

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
```

---

## Gestión del Estado (Zustand)

Ubicación: `lib/store.ts`

### 1. Cart Store (`useCart`)
Gestiona el carrito de compras. Soporta tres tipos de items:
- `album_physical`: Vinilo.
- `album_digital`: Descarga completa.
- `track`: Canción individual.

**Estructura del CartItem:**
```typescript
interface CartItem {
    cartId: string; // Unique ID
    type: 'album_physical' | 'album_digital' | 'track';
    album: Album;
    track?: Track; // Solo si type === 'track'
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
- Diseño estilo "Vinilo".
- Efecto hover: El disco sale de la funda.
- Muestra precios de Vinilo y Digital.

### `ProductDetail.tsx`
- Página de detalle del álbum.
- **Tracklist interactivo**: Botones de Play para cada canción.
- **Opciones de Compra**: Bloque para Vinilo/Digital y botones individuales por canción.

### `CartSheet.tsx`
- Adaptado para mostrar iconos diferentes según el tipo de producto (Disco, Descarga, Nota Musical).
- Calcula totales sumando precios variados.

---

## Sistema de Rutas

| Ruta | Descripción |
|------|-------------|
| `/[locale]/` | Home. Lista todos los álbumes. |
| `/[locale]/producto/[slug]` | Detalle del álbum y lista de canciones. |
| `/[locale]/rework` | **Desactivado** (Legacy). |

---

## Internacionalización

Se mantienen los archivos en `messages/` (es, en, ca, fr).
**Nota:** Es necesario actualizar las claves de traducción para cubrir los nuevos términos ("Vinyl", "Digital Album", "Tracklist", etc.). Actualmente se usan fallbacks en inglés en el código si faltan las traducciones.
