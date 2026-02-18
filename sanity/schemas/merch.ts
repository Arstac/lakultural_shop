import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'merch',
    title: 'Merch',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
        }),
        defineField({
            name: 'images',
            title: 'Images',
            type: 'array',
            of: [{
                type: 'image',
                options: {
                    hotspot: true,
                },
            }],
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'sizes',
            title: 'Sizes',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: 'S', value: 'S' },
                    { title: 'M', value: 'M' },
                    { title: 'L', value: 'L' },
                    { title: 'XL', value: 'XL' },
                    { title: 'One Size', value: 'One Size' },
                ],
            },
        }),
        defineField({
            name: 'stock',
            title: 'Stock',
            type: 'number',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            media: 'images.0',
        },
    },
})
