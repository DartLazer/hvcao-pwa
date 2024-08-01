<template>
  <div>
    <div class="container  col-md-auto rounded-1">
      <h1>Welkom bij de Transavia CAO FAQ Webapp</h1>
      <div class="rounded-2 p-3  text-black" style="background: RGBA(248, 249, 250, 0.9)">
        <div class="pb-3 pt-3">
          <h5>De handige CAO FAQ</h5>
          <p>Deze webapp streeft ernaar om een uitgebreide tool te worden om de belangrijkste elementen uit het CAO snel toegankelijk te maken.
          De app is ondertussen voorzien van een uitgebreide CAO FAQ, blokbescherming-tool & pensioenbijdrage calculator.</p>
          <p>De webapp is ontwikkeld door <a class="link-secondary" href="https://www.sky-t.nl">Rik Beernink
            (Sky-T)</a>, de maker van o.a. <a href="www.vluchtjeruilen.nl" class="link-secondary">vluchtjeruilen.nl</a>.
            De vragen database wordt zorgvuldig onderhouden door meerdere
            collega's van Transavia.</p>
          <h5 class="pt-3">Zin om te helpen?</h5>
          <p>We zijn op zoek naar collega's met diepgaande kennis van het CAO en sterke schrijfvaardigheden om bij te
            dragen aan het opzetten en onderhouden van de vragen database. Als je wat tijd over hebt en graag een
            bijdrage
            wilt leveren, <a class="link-secondary" href="https://wa.me/31652500397">neem dan contact met ons op via
              WhatsApp!</a></p>

          <h5 class="pt-3">Hoe kan ik deze webapp offline gebruiken?</h5>
          <p>Apple gebruikers: <i>Druk op het delen icoontje (vierkantje met pijl naar
            boven) en klik op zet op beginscherm.</i><br/>
            Voor Android gebruikers: <i>installeer de app via de pop-up of druk op instellingen
              en dan zet op thuis/beginscherm.</i></p>

          <h5 class="pt-3">Vragen, opmerkingen of suggesties?</h5>
          <p>Altijd welkom! <a class="link-secondary" href="https://wa.me/31652500397">Stuur mij even een whatsapp
            bericht</a> en dan kom ik zo snel mogelijk bij je terug!</p>
        </div>

        <buy-me-coffee />

        <p class="small">Deze web-app is geschreven met Nuxt3, Vuejs3, Django en Docker. Als je benieuwd bent naar de
          code <a href="https://github.com/DartLazer/hvcao-pwa" class="link-secondary">klik dan hier!</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useMainStore} from "~/store/mainStore";

let store = useMainStore();

onMounted(() => {
  store.setPageTitle('About')
});
</script>