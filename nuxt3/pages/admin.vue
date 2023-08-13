<template>
  <div>
    <h1 class="pb-5">Admin Portal</h1>

    <question-form />
    <div v-if="store.questionSubmittedAlert.show" class="alert alert-success mt-3" role="alert">
      {{ store.questionSubmittedAlert.message }}
    </div>

    <div v-if="store.questionDeletedAlert.show" class="alert alert-danger mt-3" role="alert">
      {{ store.questionDeletedAlert.message }}
    </div>

    <div v-if="store.offlineMessage.show" class="alert alert-info mt-3" role="alert">
      {{ store.offlineMessage.message }}
    </div>

    <hr/>
    <question-database-accordion :questionData="questionData" />
    <div class="mt-5 mb-5">
      <change-password/>

      <button class="btn btn-danger" style="margin-left: 1rem" @click="logOut">Logout</button>
    </div>


  </div>
</template>

<script setup>
import {fetchQuestionData} from '~/services/api.js';
import { useMainStore } from '~/store/mainStore';

definePageMeta({
  middleware: ['auth'],
})

const questionData = ref([]);
const router = useRouter();
const store = useMainStore(); // Use the store

const logOut = function () {
  console.log('Logout')
  localStorage.clear();
  router.push('/login')
};

const fetchData = async () => {
  try {
    questionData.value = await fetchQuestionData();
  } catch (error) {
    console.error(error.message);
  }
};

watch(() => store.shouldRefresh, fetchData);

onMounted(fetchData);
onMounted(() => {
  store.setPageTitle('Admin')
});
</script>


<component name="QuestionForm" :is="QuestionForm" @questionSubmitted="fetchData" @questionDeleted="fetchData"/>
<component name="QuestionAccordion" :is="QuestionAccordion" :questionData="questionData" @questionDeleted="fetchData"/>

<style>
hr {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
