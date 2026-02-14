import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'album',
    title: 'Album',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'artist',
            title: 'Artist',
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
            name: 'coverImage',
            title: 'Cover Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'releaseDate',
            title: 'Release Date',
            type: 'date',
        }),
        defineField({
            name: 'genre',
            title: 'Genre',
            type: 'string',
        }),
        defineField({
            name: 'physicalPrice',
            title: 'Physical Price (Vinyl)',
            type: 'number',
        }),
        defineField({
            name: 'digitalPrice',
            title: 'Digital Price',
            type: 'number',
        }),
        defineField({
            name: 'tracks',
            title: 'Tracks',
            type: 'array',
            of: [{ type: 'track' }],
        }),
    ],
    preview: {
        select: {
            title: 'title',
            author: 'artist',
            media: 'coverImage',
        },
        prepare(selection) {
            const { author } = selection
            return { ...selection, subtitle: author && `by ${author}` }
        },
    },
})
