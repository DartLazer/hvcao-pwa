<template>
  <div>
    <h2>CAO Database</h2>
    <div v-if="loadingAccordion">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      Data wordt ingeladen...
    </div>
    <client-only>
      <cao-accordion v-if="!loadingAccordion"/>
    </client-only>
  </div>
</template>

<script>
import CaoAccordion from "../components/caoAccordion";

export default {
  components: {CaoAccordion},
  data() {
    return {
      loadingAccordion: true,
    };
  },
  mounted() {
    this.loadingAccordion = false;
  }
};
</script>
