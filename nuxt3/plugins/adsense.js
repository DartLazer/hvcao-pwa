// plugins/adsense.js

export default defineNuxtPlugin(() => {
    if (process.client) { // Ensure this code runs only in the client
        // Create the script element
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8641079467137219';
        script.crossOrigin = 'anonymous';
        // Append the script to the head
        document.head.appendChild(script);
    }
});
