
export default defineNuxtPlugin((nuxtApp) => {
    if (process.client) {
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());
        gtag('config', 'G-YYVBR0QH6G');

        // Add the gtag.js script programmatically
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YYVBR0QH6G';
        document.head.appendChild(script);
    }
});
