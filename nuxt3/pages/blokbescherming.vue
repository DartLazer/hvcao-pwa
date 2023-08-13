<template>
  <div>
    <div class="container col-12 col-md-auto mx-auto rounded-1">
      <h1>Blokbescherming</h1>
      <div class="rounded-2 p-3 pb-5 pt-3 text-black" style="background: RGBA(248, 249, 250, 0.9)">
        <h3>Wat is blokbescherming?</h3>
        <p>
          De blokbescherming verwijst naar de regels en bepalingen die zijn opgesteld om wijzigingen in de roosters van
          vliegers te reguleren. Deze bescherming stelt vliegers in staat om vooraf geplande schema's te behouden en
          biedt
          compensatie indien wijzigingen noodzakelijk zijn.
        </p>

        <p>
          Veranderingen in het rooster, zoals een andere vlucht- of simulatoropdracht, moeten in overeenstemming met
          specifieke regels gebeuren. Als een schemawijziging wordt gemaakt waarvoor de toestemming van de vlieger
          vereist is, zal expliciet om
          toestemming worden gevraagd.
          Er is ook compensatie beschikbaar voor de vliegers in de vorm van een PD bij
          dergelijke wijzigingen.
        </p>
        <p class="small">Blokbescherming wordt beschreven in Bijlage 7 Sectie C.9 van ons CAO</p>

        <blockbescherming-calculator/>
        <h3>
          Wat mag wanneer veranderd worden?
        </h3>
        <table class="table table-striped table-bordered">
          <thead class="thead-dark">
          <tr>
            <th>Tijd tot aanmelden</th>
            <th>Toestemming vereist voor wijzigingen</th>
            <th>Compensatie indien bewilligen</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td> &gt336 uur (14 dagen)</td>
            <td>Geen</td>
            <td>Geen</td>
          </tr>
          <tr>
            <td>&gt168 uur (7 dagen)</td>
            <td>Voor wijzigingen > 3 uur</td>
            <td>1 PD</td>
          </tr>
          <tr>
            <td>&gt24 uur (1 dag)</td>
            <td>Voor wijzigingen > 3 uur</td>
            <td>1 PD</td>
          </tr>
          <tr>
            <td> &lt24 uur</td>
            <td>Vervroegen: Alle wijzingen, verlaten: indien afmelden &gt 2 uur</td>
            <td>1 PD</td>
          </tr>
          </tbody>
        </table>

        <blok-bescherming-tabel-accordion />

        <h3>Uitzonderingen op de blokbescherming</h3>
        <ul>
          <li>
            <b>Standby</b> op standby diensten geldt geen blokbescherming.
          </li>
          <li>
            Schemawijzigingen als gevolg van eigen verzoeken uit het verzoekensysteem, ruilingen, het niet verkrijgen
            van een medische verklaring of kwalificatie, en BIC- of sociale restricties, vallen niet onder de
            blokbescherming.
          </li>
          <li>
            Schemawijzigingen die plaatsvinden tijdens een TQ of commando-opleiding (tot aan de eerste dag van de
            lijntraining). De vlieger hoeft niet om bewilliging gevraagd te worden, maar de compensatie geldt wel.
          </li>
          <li>
            Indien de vlieger zich heeft aangemeld voor een vluchtopdracht en er veranderingen aan de ingetekende
            vluchtopdracht noodzakelijk zijn vanwege de sluitingstijd van EIN of RTM. De overige bepalingen van G.8
            (maximale FDP)
            blijven wel van toepassing.
          </li>
          <li>
            Bij calamiteiten geldt de blokbescherming in redelijkheid niet. Dit houdt in dat de voorwaarde van
            bewilliging, zoals opgenomen in de blokbescherming, niet van toepassing is. De compensatie, zowel met
            bewilliging als zonder bewilliging, zal conform C.9.c worden toegekend. De calamiteitenbepaling geldt 24 uur
            vanaf het moment dat de calamiteit is ontstaan. In overleg met de VNV kan deze periode worden verlengd
            indien de calamiteit van dien aard is dat het redelijk is deze periode te verlengen. In alle gevallen zal
            het de insteek zijn om de wijzigingen te minimaliseren qua hoeveelheid en tijd. De calamiteitenbepaling zal
            niet vaker dan 5 keer per jaar worden gebruikt. In overleg met de VNV kan hiervan worden afgeweken.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useMainStore} from "~/store/mainStore";

let store = useMainStore();

onMounted(() => {
  store.setPageTitle('Blokbescherming')
});
</script>

<style>
li {
  padding-top: 1rem;
}


/* Custom styles for full-screen width on phones */
@media (max-width: 576px) {
  /* Phones */
  .container {
    width: 99%;
    padding-left: 0;
    padding-right: 0;
  }
}


 .button-accordion{
   background: #f5eddf;
 }
</style>
