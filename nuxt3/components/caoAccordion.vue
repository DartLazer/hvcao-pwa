<template>
  <div>
    <div class="pb-5">
      <input v-model="search" class="form-control" placeholder="Zoeken..."/>
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
            <p class="small">Toegevoegd op:  <strong>{{ item.date_created }}</strong></p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="search && filteredItems.length === 0">
      <p>Geen resultaten gevonden...</p>
    </div>
  </div>
</template>

<script>
import {get, set, del, keys} from 'idb-keyval';
import {fetchLatestQuestionId, fetchQuestionData} from "~/services/api";

export default {
  data() {
    return {
      search: '',
      items: [],
    };
  },
  async created() {
    await this.fetchQuestionData();
    await this.performVersionCheck();
  },
  methods: {
    async fetchQuestionData() {
      const allKeys = await keys();
      const questionKeys = allKeys.filter(key => String(key).startsWith('question-'));
      if (questionKeys.length === 0) {
        console.log("No question data available.")
        return
      }

      this.items = [];

      for (const key of questionKeys) {
        const question = await get(key);
        this.items.push(question);
      }
    },
    async performVersionCheck() {
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

        this.fetchQuestionData();
      }
    },
  },
  computed: {
    filteredItems() {
      const searchLower = this.search.toLowerCase();
      if (searchLower) {
        return this.items.filter(item =>
            item.title.toLowerCase().includes(searchLower) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      } else {
        return this.items;
      }
    },
  },
};
</script>
