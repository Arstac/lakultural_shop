export default {
    name: 'order',
    title: 'Order',
    type: 'document',
    fields: [
        {
            name: 'orderId',
            title: 'Order ID (Stripe Session ID)',
            type: 'string',
        },
        {
            name: 'customerName',
            title: 'Customer Name',
            type: 'string',
        },
        {
            name: 'customerEmail',
            title: 'Customer Email',
            type: 'string',
        },
        {
            name: 'amount',
            title: 'Amount (EUR)',
            type: 'number',
        },
        {
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Paid', value: 'paid' },
                    { title: 'Shipped', value: 'shipped' },
                    { title: 'Cancelled', value: 'cancelled' },
                ],
            },
        },
        {
            name: 'items',
            title: 'Items',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'name', type: 'string' },
                        { name: 'type', type: 'string' }, // physical, digital, track
                        { name: 'quantity', type: 'number' },
                        { name: 'price', type: 'number' },
                    ]
                }
            ]
        },
        {
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        },
    ],
}
