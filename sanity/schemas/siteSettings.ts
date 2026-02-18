import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'siteSettings',
    title: 'Configuración del Sitio',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Título del Sitio',
            type: 'string',
        }),
        defineField({
            name: 'description',
            title: 'Descripción (SEO)',
            type: 'text',
        }),
        defineField({
            name: 'mainNav',
            title: 'Menú Principal',
            type: 'string',
            description: 'Esto podría ser un array de objetos en el futuro para links dinámicos',
            hidden: true,
        }),
        defineField({
            name: 'radius',
            title: 'Radio de Bordes (rem)',
            type: 'number',
            description: 'El valor base para el radio de las esquinas (ej: 0.5 para 0.5rem). Dejar vacío para usar predeterminado.',
            initialValue: 0.5,
        }),
        defineField({
            name: 'logo',
            title: 'Logo',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative Text',
                }
            ]
        }),
        defineField({
            name: 'colors',
            title: 'Paleta de Colores',
            type: 'object',
            fields: [
                defineField({
                    name: 'background',
                    title: 'Fondo (Background)',
                    type: 'string',
                    description: 'Color de fondo principal (Hex: #ffffff)',
                }),
                defineField({
                    name: 'foreground',
                    title: 'Texto Principal (Foreground)',
                    type: 'string',
                    description: 'Color de texto principal (Hex: #000000)',
                }),
                defineField({
                    name: 'primary',
                    title: 'Primario',
                    type: 'string',
                    description: 'Color principal para botones y acentos importantes.',
                }),
                defineField({
                    name: 'primaryForeground',
                    title: 'Texto sobre Primario',
                    type: 'string',
                }),
                defineField({
                    name: 'secondary',
                    title: 'Secundario',
                    type: 'string',
                }),
                defineField({
                    name: 'secondaryForeground',
                    title: 'Texto sobre Secundario',
                    type: 'string',
                }),
                defineField({
                    name: 'muted',
                    title: 'Muted (Apagado)',
                    type: 'string',
                }),
                defineField({
                    name: 'mutedForeground',
                    title: 'Texto Muted',
                    type: 'string',
                }),
                defineField({
                    name: 'accent',
                    title: 'Acento',
                    type: 'string',
                }),
                defineField({
                    name: 'accentForeground',
                    title: 'Texto sobre Acento',
                    type: 'string',
                }),
                defineField({
                    name: 'border',
                    title: 'Bordes',
                    description: 'Bordes',
                    type: 'string',
                }),
                defineField({
                    name: 'headerBackground',
                    title: 'Fondo del Header',
                    type: 'string',
                    description: 'Color de fondo específico para el header. Si no se define, usará el Primario.',
                }),
                defineField({
                    name: 'headerForeground',
                    title: 'Texto del Header',
                    type: 'string',
                    description: 'Color de texto para el header.',
                }),
            ],
            options: {
                collapsible: true,
                collapsed: false,
            }
        }),
    ],
})
