import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'track',
    title: 'Track',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'duration',
            title: 'Duration (mm:ss)',
            type: 'string',
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
        }),
        defineField({
            name: 'previewAudio',
            title: 'Preview Audio (MP3)',
            type: 'file',
            options: {
                accept: 'audio/mpeg,audio/mp3',
            },
        }),
    ],
})
