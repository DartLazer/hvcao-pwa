<template>
  <div>
    <div class="container col-12 col-md-auto mx-auto rounded-1">
      <h1>Afkortingen</h1>
      <div class="rounded-2 p-3 pb-5 pt-3 text-black" style="background: RGBA(248, 249, 250, 0.9)">
        <h4>Een lijst van afkortingen gebruikt in deze tool</h4>
        <ul>
          <li>
            CD - Compensatie Dag (Verdiend door landen/werkten in vrije tijd etc)
          </li>
          <li>
            EW - Extra Werk Dag (Verdiend wanneer een tbids periode bestaat uit 21 werkdagen)
          </li>
        </ul>
        <p>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useMainStore} from "~/store/mainStore";

let store = useMainStore();

onMounted(() => {
  store.setPageTitle('Afkortingen')
});
</script>