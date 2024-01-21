// plugins/posthog-plugin.js

import posthog from 'posthog-js';

export default defineNuxtPlugin((nuxtApp) => {
    posthog.init('phc_w2NTLyEDV6xsJg6VY9aBIbnfK30EJGcHQWfA6ezHtKA', {
        api_host: 'https://eu.posthog.com',
    });
});
