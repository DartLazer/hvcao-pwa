<template>
  <div>
    <h2>CAO Database</h2>
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
import {ref, onMounted} from 'vue';

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

function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2 - date1) / oneDay));
}

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
</script>

<style>
/* Add any custom styles here */
</style>
