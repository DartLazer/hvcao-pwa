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
    <button class="btn btn-primary btn-block" type="submit">Submit</button>
  </form>
</template>

<script setup>
import {deleteQuestion, submitQuestion} from '~/services/api.js';


// Define props
const questionData = ref([]);
const successMessage = ref('');

// Initialize fields
const title = ref('');
const explanation = ref('');
const source = ref('');
const category = ref('');
const tags = ref('');

// Define emitters
const emit = defineEmits(['questionDeleted', 'errorAlert']);

const deleteQuestionMethod = async (id) => {
  try {
    const message = await deleteQuestion(id);
    emit('questionDeleted');
    emit(message[0], message[1]);
  } catch (error) {
    console.error(error.message);
    emit('errorAlert', error.message);
  }
};
const submitQuestionForm = async () => {
  try {
    const question = {
      title: title.value,
      explanation: explanation.value,
      source: source.value,
      category: category.value,
      tags: tags.value,
    };
    await submitQuestion(question);
    emit('questionSubmitted')
    emit('successAlert', 'Message submitted succesfully!')
    title.value = '';
    explanation.value = '';
    source.value = '';
    category.value = '';
    tags.value = '';
  } catch (error) {
    // Error handling
    console.error(error);
    emit('errorAlert', error.message)
    $nuxt.emit('submissionError', error);
  }
};

</script>
