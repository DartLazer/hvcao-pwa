<template>
  <div>
    <div class="search-container pb-3">
      <input v-model="search" class="form-control" placeholder="Zoeken..."/>
      <button v-if="search" class="clear-search" @click="store.cleanFiltersAndSearchBarNow()">&#10005;</button>
    </div>


    <select class="form-select form-group" aria-label="category" required v-model="category">
      <option value="">Alle Categorieën</option>
      <option v-for="(cat, index) in uniqueCategories" :value="cat" :key="index">{{ cat }}</option>
    </select>


    <div class="accordion pb-3" id="caoFAQAccordion">
      <div class="accordion-item" v-for="(item) in filteredQuestionData" :key="item.id">
        <h2 class="accordion-header" :id="'heading' + item.id">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                  :data-bs-target="'#collapse' + item.id" aria-expanded="false" :aria-controls="'collapse' + item.id">
            {{ item.title }}

          </button>
        </h2>
        <div :id="'collapse' + item.id" class="accordion-collapse collapse" :aria-labelledby="'heading' + item.id"
             data-bs-parent="#accordionExample">
          <div class="accordion-body">
            <MarkedExplanation :rawText="item.explanation"/>
            <p class="small">Bron: <strong>{{ item.source }}</strong></p>
            <p class="small">Toegevoegd op: <strong>{{ item.date_updated }}</strong></p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="search && filteredQuestionData.length === 0">
      <p>Geen resultaten gevonden...</p>
    </div>
  </div>
</template>

<script setup>
import {get, set, del, keys} from 'idb-keyval';
import {fetchLatestQuestionId, fetchQuestionData} from "~/services/api";
import {markupText} from "~/services/markupCode";
import {useMainStore} from "~/store/mainStore";


const store = useMainStore();
const search = ref('');
const questionsDataObject = ref([]);
const category = ref('');
let stopWatch;


async function loadQuestionData() {
  // Function that loads the question data from the indexedDB into an object if available.
  const allKeys = await keys();
  const questionKeys = allKeys.filter(key => String(key).startsWith('question-'));
  if (questionKeys.length === 0) {
    store.loadingAccordion = true;
    console.log("No question data available.")
    return
  }
  questionsDataObject.value = [];
  for (const key of questionKeys) {
    const question = await get(key);
    question.markedExplanation = markupText(question.explanation);
    questionsDataObject.value.push(question);
  }
}

async function performVersionCheck() {
  // Checks with the remote API which question set ID is available.
  // If different then it will update the indexedDB
  const remoteVersion = await fetchLatestQuestionId()
  const localVersion = await get('questionsVersion');

  if (remoteVersion !== localVersion) {
    const questionsData = await fetchQuestionData();
    const allKeys = await keys();
    const questionKeys = allKeys.filter(key => String(key).startsWith('question-'));

    for (const key of questionKeys) {
      await del(key);
    }
    for (const question of questionsData) {
      await set('question-' + question.id, question);
    }
    await set('questionsVersion', remoteVersion);
    await loadQuestionData();
  }
  store.loadingAccordion = false;
}

// Generates a list of unique categories dynamically.
const uniqueCategories = computed(() => {
  const categories = questionsDataObject.value.map(item => item.category);
  return [...new Set(categories)].sort(); // remove duplicates
});


const filteredQuestionData = computed(() => {
      let searchLower = search.value.toLowerCase();
      if (searchLower) {
        return questionsDataObject.value.filter(item =>
            item.title.toLowerCase().includes(searchLower) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      if (category.value !== '') {
        return questionsDataObject.value.filter(item =>
            item.category.toLowerCase().includes(category.value.toLowerCase())
        );
      } else {
        return questionsDataObject.value;
      }
    }
);

const clearSearchAndFilters = function () {
  search.value = '';
  category.value = '';
};


const goToQuestionID = function () {
  search.value = store.goToQuestionID;

  // Stop the watch to prevent a retrigger
  stopWatch();

  store.goToQuestionID = '';

  // Restart the watcher
  stopWatch = watch(() => store.goToQuestionID, goToQuestionID);
}

// Initialize the watcher and capture its stop method in stopWatch
stopWatch = watch(() => store.goToQuestionID, goToQuestionID);


watch(() => store.cleanFiltersAndSearchBar, clearSearchAndFilters);


onMounted(async () => {
  await loadQuestionData();
  await performVersionCheck();
});
watchEffect(() => {
  if (search.value) {
    category.value = '';
  }
});

watchEffect(() => {
  if (category.value) {
    search.value = '';
  }
});
</script>

<style>
.search-container {
  position: relative;
}

.clear-search {
  position: absolute;
  right: 8px; /* Adjusted for better spacing */
  top: 33%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 2rem; /* Increased size for better visibility */
  color: #ac2925;
  line-height: 1; /* Adjusted for vertical centering */
}

.form-group {
  margin-bottom: 1rem;
}
</style>
