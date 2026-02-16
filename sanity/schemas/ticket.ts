import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'ticket',
    title: 'Ticket',
    type: 'document',
    fields: [
        defineField({
            name: 'code',
            title: 'QR Code (UUID)',
            type: 'string',
            readOnly: true,
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Active', value: 'active' },
                    { title: 'Used', value: 'used' },
                    { title: 'Cancelled', value: 'cancelled' },
                ],
            },
            initialValue: 'active',
        }),
        defineField({
            name: 'event',
            title: 'Event',
            type: 'reference',
            to: [{ type: 'event' }],
        }),
        defineField({
            name: 'order',
            title: 'Order',
            type: 'reference',
            to: [{ type: 'order' }],
        }),
        defineField({
            name: 'attendeeName',
            title: 'Attendee Name',
            type: 'string',
        }),
        defineField({
            name: 'attendeeEmail',
            title: 'Attendee Email',
            type: 'string',
        }),
    ],
    preview: {
        select: {
            title: 'code',
            subtitle: 'attendeeName',
            status: 'status',
        },
        prepare(selection) {
            const { title, subtitle, status } = selection
            return {
                title: `${title} (${status})`,
                subtitle: subtitle,
            }
        },
    },
})
