import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'homePage',
    title: 'Home Page',
    type: 'document',
    fields: [
        defineField({
            name: 'title', // Internal title for the document
            title: 'Document Title',
            type: 'string',
            initialValue: 'Home Page Content',
            hidden: true,
        }),
        defineField({
            name: 'heroImage',
            title: 'Hero Background Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'headline',
            title: 'Main Headline',
            type: 'string',
            description: 'e.g. "Sonido Analógico. La Kultural Records."',
        }),
        defineField({
            name: 'subheadline',
            title: 'Subheadline',
            type: 'string',
            description: 'e.g. "Tienda de Discos independiente..."',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'ctaText',
            title: 'Button Text',
            type: 'string',
            initialValue: 'Explorar Catálogo',
        }),
    ],
    preview: {
        select: {
            title: 'headline',
        },
        prepare(selection) {
            return { title: selection.title || 'Home Page' }
        },
    },
})
