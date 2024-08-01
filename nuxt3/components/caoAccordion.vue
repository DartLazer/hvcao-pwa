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
          <button class="accordion-button collapsed d-flex justify-content-between align-items-center" type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#collapse' + item.id" aria-expanded="false" :aria-controls="'collapse' + item.id"
                  @click="markAsSeen(item.id)"
          >
            <span>{{ item.title }}</span>
            <span>
              <span class="badge bg-info ms-2" v-if="item.status === 'new'">Nieuw</span>
              <span class="badge bg-warning ms-2" v-if="item.status === 'updated'">Veranderd</span>
            </span>
          </button>
        </h2>
        <div :id="'collapse' + item.id" class="accordion-collapse collapse" :aria-labelledby="'heading' + item.id"
             data-bs-parent="#accordionExample">
          <div class="accordion-body">
            <MarkedExplanation :rawText="item.explanation"/>
            <hr class="thin-hr-line"/>
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
import {fetchLatestQuestionDatabaseVersion, fetchQuestionData} from "~/services/api";
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
  const remoteVersion = await fetchLatestQuestionDatabaseVersion();
  const localVersion = await get('questionsVersion');

  if (remoteVersion !== localVersion) {
    const questionsData = await fetchQuestionData();
    const allKeys = await keys();
    const questionKeys = allKeys.filter(key => String(key).startsWith('question-'));

    const localQuestions = {};
    for (const key of questionKeys) {
      localQuestions[key] = await get(key);
    }

    const remoteQuestionIds = new Set(questionsData.map(question => 'question-' + question.id));

    for (const question of questionsData) {
      const questionKey = 'question-' + question.id;
      const localQuestion = localQuestions[questionKey];

      if (!localQuestion) {
        question.status = 'new';
        await set(questionKey, question);
      } else {
        const isTitleDifferent = localQuestion.title !== question.title;
        const isExplanationDifferent = localQuestion.explanation !== question.explanation;

        if (isTitleDifferent || isExplanationDifferent) {
          question.status = 'updated';
          await set(questionKey, question);
        } else {
          localQuestion.status = 'seen';
          await set(questionKey, localQuestion);
        }
      }
    }

    for (const key of questionKeys) {
      if (!remoteQuestionIds.has(key)) {
        await del(key);
      }
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

async function markAsSeen(questionId) {
  const questionKey = 'question-' + questionId;
  const question = await get(questionKey);
  if (question && question.status !== 'seen') {
    question.status = 'seen';
    await set(questionKey, question);

    // Update local state
    const localQuestionIndex = questionsDataObject.value.findIndex(q => q.id === questionId);
    if (localQuestionIndex !== -1) {
      questionsDataObject.value[localQuestionIndex].status = 'seen';
    }
  }
}

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

<style scoped>
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

.thin-hr-line {
  border: none;
  height: 2px; /* Adjust the height to make it thinner */
  background-color: #000000; /* Change the color as desired */
}
</style>
