import {PostHog} from 'posthog-node'

export default defineNuxtPlugin((nuxtApp) => {
// PostHog snippet goes here
// Modify the snippet to fit into the Nuxt context
// Make sure to replace the 'YOUR_API_KEY' and other configurations with your actual data
    const client = new PostHog(
        'phc_w2NTLyEDV6xsJg6VY9aBIbnfK30EJGcHQWfA6ezHtKA',
        {host: 'https://eu.posthog.com'}
    )
});