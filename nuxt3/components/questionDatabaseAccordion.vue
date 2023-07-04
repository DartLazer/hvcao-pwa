<template>
  <div>
    <h3 class="pb-1">Question Database</h3>
    <div class="accordion" id="caoFAQAccordion">
      <div class="accordion-item" v-for="item in questionData" :key="item.id">
        <h2 class="accordion-header" :id="'heading' + item.id">
          <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              :data-bs-target="'#collapse' + item.id"
              aria-expanded="false"
              :aria-controls="'collapse' + item.id"
          >
            {{ item.title }}
          </button>
        </h2>
        <div :id="'collapse' + item.id" class="accordion-collapse collapse" :aria-labelledby="'heading' + item.id"
             data-bs-parent="#accordionExample">
          <div class="accordion-body">
            <p v-html="markupText(item.explanation)"></p>
            <p class="small">Bron: {{ item.source }}</p>
            <p class="small">Created by: <strong>{{ item.created_by }}</strong> at
              <strong>{{ item.date_created }}</strong></p>
            <p class="small">
              <strong>Tags: </strong>
              <span v-for="tag in item.tags">
                {{ tag }},
              </span>

            </p>
            <button class="btn btn-primary btn-sm mx-2" @click="updateEditModalData(item.id, item)"
                    data-bs-toggle="modal" data-bs-target="#editQuestionModal">
              Edit
            </button>

            <button class="btn btn-danger align btn-sm" @click="deleteItem(item.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!questionData" class="alert alert-danger mt-3" role="alert">
      Failed to fetch remote data
    </div>

    <!-- Edit Question Modal -->
    <div class="modal modal-lg fade" id="editQuestionModal" tabindex="-1" aria-labelledby="editQuestionModalLabel"
         aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-black" id="editQuestionModalLabel">Vraag aanpassen</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-black">
            <form @submit.prevent="submitQuestionForm" class="form-signin ">
              <div class="form-group">
                <input type="text" class="form-control" placeholder="Titel" required autofocus v-model="title">
              </div>
              <div class="form-group">
                <textarea style="white-space: pre-line;" class="form-control" placeholder="Antwoord" required
                          v-model="explanation" rows="5"></textarea>
              </div>
              <div class="form-group">
                <input type="text" class="form-control" placeholder="Bron (bv: Hoofdstuk 8 Art. 2.3)" required
                       v-model="source">
              </div>
              <div class="form-group">
                <select class="form-select" aria-label="category" required v-model="category">
                  <option disabled value="">Categorie</option>
                  <option value="Basebeleid">Basebeleid</option>
                  <option value="Compensatie">Compensatie</option>
                  <option value="Deeltijd & Afbouw">Deeltijd & Afbouw</option>
                  <option value="Handige Info">Handige Info Non-CAO</option>
                  <option value="Overig Info CAO">Overig Info CAO</option>
                  <option value="Salaris">Salaris</option>
                  <option value="Vakantie">Vakantie</option>
                  <option value="WRR - CBM & Off-base melden">WRR - CBM & Off-base melden</option>
                  <option value="WRR - Standby & Reserve">WRR - Standby & Reserve</option>
                  <option value="WRR - Uitvoering & Ongepland Overnachten">WRR - Uitvoering & Ongepland Overnachten</option>
                  <option value="WRR - Planning">WRR - Planning</option>
                  <option value="WRR - Jokerverzoeken & Snipperdagen">WRR - Jokerverzoeken & Snipperdagen</option>
                </select>
              </div>
              <div class="form-group">
                <input type="text" class="form-control" placeholder="Tags (comma seperated, helpen met zoeken)" required
                       v-model="tags">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <div v-if="showEditSuccessAlert.show" class="alert alert-success p-1" role="alert">
              {{ showEditSuccessAlert.message }}
            </div>
            <div v-if="showEditErrorAlert.show" class="alert danger p-1" role="alert">
              {{ showEditErrorAlert.message }}
            </div>
            <button type="button" @click="editQuestionForm" class="btn btn-primary">Opslaan</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Sluiten</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import {ref} from 'vue';
import {editQuestion, deleteQuestion as deleteQuestionAPI,} from '~/services/api.js';
import {markupText} from "~/services/markupCode";
import {useMainStore} from "~/store/mainStore";

const store = useMainStore();

// Initialize fields
const title = ref('');
const explanation = ref('');
const source = ref('');
const category = ref('');
const tags = ref('');
let editableQuestionId = null;
const showEditSuccessAlert = ref({show: false, message: ''});
const showEditErrorAlert = ref({show: false, message: ''});


const props = defineProps({
  questionData: {
    type: Array,
    required: true,
  },
});


const deleteItem = async (id) => {
  try {
    const message = await deleteQuestionAPI(id);
    store.showAlert(message[0], message[1])
    store.requestRefresh()
  } catch (error) {
    console.error(error.message);
    store.showErrorAlert(error.message)
  }
};

const updateEditModalData = function (questionId, questionObject) {
  title.value = questionObject.title;
  explanation.value = questionObject.explanation;
  source.value = questionObject.source;
  category.value = questionObject.category;
  tags.value = questionObject.tags.join(', ');  // convert array to string
  editableQuestionId = questionId;
}

// In the `editQuestionForm` function, convert string back to array
const editQuestionForm = async () => {
  try {
    const question = {
      title: title.value,
      explanation: explanation.value,
      source: source.value,
      category: category.value,
      tags: tags.value,
    };
    const responseMessage = await editQuestion(editableQuestionId, question);
    await showEditedAlert(responseMessage)
    store.requestRefresh()
  } catch (error) {
    // Error handling
    console.error(error);
    store.showErrorAlert(error.message)
  }
};

const showEditedAlert = function (messageArray) {
  const alertType = messageArray[0];
  const alertMessage = messageArray[1]
  // Read response and determine which message to show
  if (alertType === 'editedSuccessfullyAlert') {
    showEditSuccessAlert.value = {show: true, message: alertMessage}
  } else {
    showEditErrorAlert.value = {show: true, message: alertMessage}
  }

  // Make alert disappear after 3 seconds
  setTimeout(() => {
    showEditErrorAlert.value = {show: false, message: ''};
    showEditSuccessAlert.value = {show: false, message: ''};
  }, 3000);
}

</script>

<style>
.form-group {
  margin-bottom: 1rem;
}
</style>
