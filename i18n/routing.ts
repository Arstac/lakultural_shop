import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['ca', 'es', 'fr', 'en'],
    defaultLocale: 'es',
    localePrefix: 'always'
});
