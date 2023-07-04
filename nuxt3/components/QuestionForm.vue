<template>
  <form @submit.prevent="submitQuestionForm" class="form-signin ">
    <h2 class="form-signin-heading">Een vraag toevoegen</h2>
    <div class="form-group">
      <input type="text" class="form-control" placeholder="Titel" required autofocus v-model="title">
    </div>
    <div class="form-group">
      <textarea class="form-control"
                placeholder="Antwoord. Gebruik *tekst* voor schuine tekst en **tekst** voor dikgedrukte tekst." required
                rows="5" v-model="explanation"></textarea>
    </div>
    <div class="form-group">
      <input type="text" class="form-control" placeholder="Bron (bv: Hoofdstuk 8 Art. 2.3)" required v-model="source">
    </div>
    <div class="form-group">
      <select class="form-select" aria-label="category" required v-model="category">
        <option disabled value="">Categorie</option>
        <option value="basebeleid">Basebeleid</option>
        <option value="Compensatie">Compensatie</option>
        <option value="deeltijdenafbouw">Deeltijd & Afbouw</option>
        <option value="Handige Info">Handige Info Non-CAO</option>
        <option value="Overig">Overig Info CAO</option>
        <option value="Salaris">Salaris</option>
        <option value="Vakantie">Vakantie</option>
        <option value="WRR">WRR - CBM & Off-base melden</option>
        <option value="WRR-standbyenreserve">WRR - Standby & Reserve</option>
        <option value="WRR-uitvoering">WRR - Uitvoering & Ongepland Overnachten</option>
        <option value="WRR-planning;">WRR - Planning</option>
        <option value="WRR-jokverzoekenensnipperdagen">WRR - Jokerverzoeken & Snipperdagen</option>
      </select>
    </div>
    <div class="form-group">
      <input type="text" class="form-control" placeholder="Tags (comma seperated, helpen met zoeken)" required
             v-model="tags">
    </div>
    <button class="btn btn-primary btn-block" type="submit">{{ submitButtonText }}</button>

    <br/>
  </form>
  <handle-offline-questions />
</template>

<script setup>
import {submitQuestion} from '~/services/api.js';
import { useMainStore } from '~/store/mainStore'; // Import the store

// Initialize fields
const title = ref('');
const explanation = ref('');
const source = ref('');
const category = ref('');
const tags = ref('');

const submitButtonText = ref('Uploaden');

const store = useMainStore(); // Use the store

const addOfflineQuestion = function (questionObject) {
  store.addOfflineQuestion(questionObject) // Use the store method
}

const submitQuestionForm = async () => {
  const question = {
    title: title.value,
    explanation: explanation.value,
    source: source.value,
    category: category.value,
    tags: tags.value,
  };

  if (!navigator.onLine) { // Offline, save question into store and upload later
    addOfflineQuestion(question)
    store.showErrorAlert('Het is niet gelukt de vraag te uploaden. Hij is offline op uw apparaat opgeslagen. Probeer het later (wanneer je weer online bent) opnieuw.')
    return
  }
  try {
    const successfully_posted = await submitQuestion(question);
    if (!successfully_posted){
      addOfflineQuestion(question)
      store.showErrorAlert('Fout tijdens het uploaden van de vraag. De vraag is lokaal opgeslagen en kan later weer opnieuw geupload worden.') // Use the store method
      return
    }
    store.showSuccessAlert('Vraag succesvol geupload!') // Use the store method
    title.value = '';
    explanation.value = '';
    source.value = '';
    category.value = '';
    tags.value = '';
    store.requestRefresh()
  } catch (error) {
    // Error handling
    console.error(error);
    addOfflineQuestion(question)
    store.showErrorAlert(error.message) // Use the store method
  }
};

watchEffect(() => {
  submitButtonText.value = navigator.onLine ? 'Uploaden' : 'Offline opslaan om later te uploaden';
});
</script>