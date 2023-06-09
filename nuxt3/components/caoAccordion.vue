<template>
  <div>
    <div class="pb-5">
      <input v-model="search" class="form-control" placeholder="Zoeken..."/>
    </div>

    <div class="form-group">
      <select class="form-select" aria-label="category" required v-model="category">
        <option value="">Alle Categorieën</option>
        <option value="WRR">WRR</option>
        <option value="Salaris">Salaris</option>
        <option value="Vakantie">Vakantie</option>
        <option value="Compensatie">Compensatie</option>
        <option value="Handige Info">Handige Info</option>
      </select>
    </div>

    <div class="accordion" id="caoFAQAccordion">
      <div class="accordion-item" v-for="(item) in filteredItems" :key="item.id">
        <h2 class="accordion-header" :id="'heading' + item.id">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                  :data-bs-target="'#collapse' + item.id" aria-expanded="false" :aria-controls="'collapse' + item.id">
            {{ item.title }}
          </button>
        </h2>
        <div :id="'collapse' + item.id" class="accordion-collapse collapse" :aria-labelledby="'heading' + item.id"
             data-bs-parent="#accordionExample">
          <div class="accordion-body">
            <p>{{ item.explanation }}</p>
            <p class="small">Bron: <strong>{{ item.source }}</strong></p>
            <p class="small">Toegevoegd op: <strong>{{ item.date_created }}</strong></p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="search && filteredItems.length === 0">
      <p>Geen resultaten gevonden...</p>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watchEffect} from 'vue';
import {get, set, del, keys} from 'idb-keyval';
import {fetchLatestQuestionId, fetchQuestionData} from "~/services/api";

const search = ref('');
const items = ref([]);
const category = ref('');


async function loadQuestionData() {
  const allKeys = await keys();
  const questionKeys = allKeys.filter(key => String(key).startsWith('question-'));
  if (questionKeys.length === 0) {
    console.log("No question data available.")
    return
  }

  items.value = [];

  for (const key of questionKeys) {
    const question = await get(key);
    items.value.push(question);
  }
}

async function performVersionCheck() {
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

    loadQuestionData();
  }
}

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


const filteredItems = computed(() => {
      let searchLower = search.value.toLowerCase();
      if (searchLower) {
        return items.value.filter(item =>
            item.title.toLowerCase().includes(searchLower) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      if (category.value !== ''){
        return items.value.filter(item =>
            item.category.toLowerCase().includes(category.value.toLowerCase())
        );
      } else {
        return items.value;
      }
    }
);
</script>

<style>
.form-group {
  margin-bottom: 1rem;
}
</style>
