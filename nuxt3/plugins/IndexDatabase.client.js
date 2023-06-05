import { get, set } from 'idb-keyval';

export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.provide('db', {
        set: async (key, value) => {
            try {
                await set(key, value);
            } catch (error) {
                console.error('IndexedDB set error:', error);
            }
        },
        get: async (key) => {
            try {
                return await get(key);
            } catch (error) {
                console.error('IndexedDB get error:', error);
            }
        },
    });
});