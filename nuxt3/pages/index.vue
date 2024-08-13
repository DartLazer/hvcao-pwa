<template>
  <div>
    <h2>CAO FAQ Database</h2>
    <div v-if="showAlert" class="alert alert-info alert-dismissible fade show" role="alert">
      De informatie op HVCAO.nl is zorgvuldig samengesteld. Toch kunnen er verschillen zijn met de actuele CAO. Bij
      discrepanties is de officiële CAO of info van de VNV leidend.
      <button type="button" class="btn-close" @click="dismissAlert" aria-label="Close"></button>
    </div>
    <cao-accordion v-if="!delayLoadingAccordion"/>
    <div v-if="store.loadingAccordion">
      <div class="spinner-border" role="status">
      </div>
      Data wordt ingeladen...
    </div>
  </div>
</template>

<script setup>
import {useMainStore} from '~/store/mainStore';
import {onMounted, ref} from 'vue';
import {getCookie, setCookie} from "~/services/CookieHandler";
import {daysBetween} from "~/services/dateTimeUtils";

const store = useMainStore();
const delayLoadingAccordion = ref(true);
const showAlert = ref(false);

onMounted(() => {
  delayLoadingAccordion.value = false;
  store.cleanFiltersAndSearchBarNow();
  store.setPageTitle('Home');

  const alertLastShown = getCookie('alertLastShown');

  if (!alertLastShown || daysBetween(new Date(alertLastShown), new Date()) > 90) {
    showAlert.value = true;
  }
});

function dismissAlert() {
  showAlert.value = false;
  setCookie('alertLastShown', new Date().toISOString(), 90);
}

</script>

<style>
/* Add any custom styles here */
</style>
