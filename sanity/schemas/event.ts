import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'event',
    title: 'Event',
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
            name: 'date',
            title: 'Date & Time',
            type: 'datetime',
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'string',
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'mapUrl',
            title: 'Google Maps Embed URL',
            type: 'url',
            description: 'Paste the "Embed a map" src URL from Google Maps here',
        }),
        defineField({
            name: 'organizer',
            title: 'Organizer',
            type: 'object',
            fields: [
                defineField({ name: 'name', type: 'string', title: 'Name' }),
                defineField({ name: 'email', type: 'string', title: 'Email' }),
                defineField({ name: 'phone', type: 'string', title: 'Phone' }),
                defineField({ name: 'image', type: 'image', title: 'Image', options: { hotspot: true } }),
            ]
        }),
    ],
})
