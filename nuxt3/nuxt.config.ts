export default defineNuxtConfig({
    app: {
        pageTransition: {name: 'page', mode: 'out-in'}
    },
    css: ['~/assets/styles/main.scss', '~/assets/styles/background.css'],
    plugins: [{src: '~/plugins/IndexDatabase.client.js', mode: 'client'}, ],
    modules: ['@vite-pwa/nuxt'],
    pwa: {
        registerType: 'autoUpdate',
        includeAssets: ['~/assets/styles/main.scss', '~/assets/styles/background.css', '~/public/static/background2.jpg'],
        manifest: {
            name: 'HV CAO Pwa',
            short_name: 'HVCAO',
            description: 'Een vragen-database over de meeste gestelde cockpit vragen',
            icons: [
                {
                    src: '/logos/iconx160.png',
                    sizes: '160x160',
                    type: 'image/png',
                },
                {
                    src: '/logos/iconx256.png',
                    sizes: '256x256',
                    type: 'image/png',
                },
                {
                    src: '/logos/iconx512.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
            ],
            start_url: '/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#000000',


        },
        workbox: {
            globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico}'],
        },
        installPrompt: true,
        periodicSyncForUpdates: 86400, // check for updates every 24 hours
    },
})
