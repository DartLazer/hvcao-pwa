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
            <p>{{ item.explanation }}</p>
            <p class="small">Bron: {{ item.source }}</p>
            <p class="small">Created by: <strong>{{ item.created_by }}</strong> at
              <strong>{{ item.date_created }}</strong></p>
            <p class="small">
              <strong>Tags: </strong>
              <span v-for="tag in item.tags">
                {{ tag }},
              </span>

            </p>
            <button class="btn btn-danger align btn-sm" @click="deleteQuestion(item.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!questionData" class="alert alert-danger mt-3" role="alert">
      Failed to fetch remote data
    </div>

  </div>
</template>

<script>
import {fetchQuestionData, deleteQuestion} from '~/services/api.js';

export default {
  props: {
    questionData: {
      type: Array,
      required: true,
    },
    successMessage: {
      type: String,
      default: '',
    },
  },
  methods: {
    async deleteQuestion(id) {
      try {
        const message = await deleteQuestion(id);
        this.$emit('questionDeleted');
        this.$emit(message[0], message[1])
      } catch (error) {
        console.error(error.message);
        this.$emit('errorAlert', error.message)
      }
    },
  },
};
</script>

<style>
.form-group {
  margin-bottom: 1rem;
}
</style>
