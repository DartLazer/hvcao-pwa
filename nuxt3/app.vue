<template>
  <div>
    <head>
      <title>HVCAO - {{ store.pageTitle }}</title>
      <meta name="google-adsense-account" content="ca-pub-8641079467137219">
    </head>
    <!-- serviceworker -->
    <VitePwaManifest />
    <navbar/>
    <client-only>
      <MainContent>
        <nuxtPage/>
      </MainContent>
    </client-only>
  </div>
</template>

<script setup>
import Navbar from "./components/navbar"
import MainContent from "~/components/mainContent.vue";
import { useMainStore } from '~/store/mainStore';

let store = useMainStore();

const loadingData = ref(true)

const onDataLoaded = () => {
  loadingData.value = false
}

const transition = {
  name: 'page',
  mode: 'out-in'
}
</script>

<style>
.page-enter-active, .page-leave-active {
  transition: all 0.2s;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>