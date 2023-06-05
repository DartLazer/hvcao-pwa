import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

// Cache image files with a cache-first strategy for 30 days
registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg)$/,
    new StaleWhileRevalidate({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            }),
        ],
    }),
);

// Use a Network First strategy for all other requests.
registerRoute(
    ({request}) => request.destination !== 'image',
    new NetworkFirst()
);