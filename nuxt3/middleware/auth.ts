export default defineNuxtRouteMiddleware((to) => {
    const nuxtApp = useNuxtApp()

    // skip middleware on server
    if (process.server) return

    // or only skip middleware on initial client load
    if (process.client && nuxtApp.isHydrating && nuxtApp.payload.serverRendered) return

    const token = sessionStorage.getItem('token')

    if (to.path === '/admin' && !token) {
        return navigateTo('/login')
    }

    if (to.path === '/login' && token) {
        return navigateTo('/admin')
    }
})