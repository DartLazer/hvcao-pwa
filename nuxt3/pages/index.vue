<template>
  <div>
    <h2>CAO Database</h2>
    <cao-accordion v-if="!delayLoadingAccording"/>
    <div v-if="store.loadingAccordion">
      <div class="spinner-border" role="status">
      </div>
      Data wordt ingeladen...
    </div>
  </div>
</template>

<script setup>
import {useMainStore} from '~/store/mainStore';

const store = useMainStore();

const delayLoadingAccording = ref(true);

onMounted(() => {
  delayLoadingAccording.value = false;
});
</script>
