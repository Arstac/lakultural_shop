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
            name: 'pricingTiers',
            title: 'Pricing Tiers',
            type: 'array',
            description: 'Define multiple pricing tiers. They are evaluated in order — the first tier whose conditions are met will be the active price. If none match, the base Price above is used.',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'name', type: 'string', title: 'Tier Name', description: 'e.g. "Early Bird", "General", "Last Minute"' }),
                        defineField({ name: 'price', type: 'number', title: 'Ticket Price' }),
                        defineField({ name: 'startDate', type: 'datetime', title: 'Start Date', description: 'When this tier becomes available (optional).' }),
                        defineField({ name: 'endDate', type: 'datetime', title: 'End Date', description: 'When this tier expires (optional).' }),
                        defineField({ name: 'ticketLimit', type: 'number', title: 'Ticket Limit', description: 'Max tickets sold at this price (optional, based on total sold count).' }),
                    ],
                    preview: {
                        select: { title: 'name', subtitle: 'price' },
                        prepare({ title, subtitle }) {
                            return { title: title || 'Unnamed Tier', subtitle: subtitle !== undefined ? `${subtitle}€` : 'No price set' }
                        }
                    }
                }
            ],
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
