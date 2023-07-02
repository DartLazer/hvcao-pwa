<template>
  <div>
    <h1 class="pb-5">Admin Portal</h1>

    <QuestionForm @questionSubmitted="fetchData" @successAlert="handleQuestionSubmitted"
                  @errorAlert="handleQuestionDeleted"/>
    <div v-if="questionSubmittedAlert.show" class="alert alert-success mt-3" role="alert">
      {{ questionSubmittedAlert.message }}
    </div>

    <div v-if="questionDeletedAlert.show" class="alert alert-danger mt-3" role="alert">
      {{ questionDeletedAlert.message }}
    </div>

    <hr/>
    <QuestionAccordion :questionData="questionData" @questionDeleted="fetchData" @questionEdited="fetchData"
                       @successAlert="handleQuestionSubmitted" @errorAlert="handleQuestionDeleted"/>
    <div class="mt-5 mb-5">
      <change-password/>

      <button class="btn btn-danger" style="margin-left: 1rem" @click="logOut">Logout</button>
    </div>


  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import QuestionForm from '~/components/QuestionForm.vue';
import QuestionAccordion from '~/components/questionDatabaseAccordion.vue';
import {fetchQuestionData} from '~/services/api.js';
import {useRouter} from 'vue-router';
import ChangePassword from "../components/changePassword";

definePageMeta({
  middleware: ['auth']
})

const questionData = ref([]);
const questionSubmittedAlert = ref({show: false, message: ''});
const questionDeletedAlert = ref({show: false, message: ''});
const router = useRouter();

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

const handleQuestionSubmitted = (message) => {
  questionSubmittedAlert.value = {show: true, message};
  setTimeout(() => {
    questionSubmittedAlert.value = {show: false, message: ''};
  }, 3000);
  fetchData();
};

const handleQuestionDeleted = (message) => {
  questionDeletedAlert.value = {show: true, message};
  setTimeout(() => {
    questionDeletedAlert.value = {show: false, message: ''};
  }, 3000);
  fetchData();
};



onMounted(fetchData);

</script>

<component name="QuestionForm" :is="QuestionForm" @questionSubmitted="fetchData" @questionDeleted="fetchData"/>
<component name="QuestionAccordion" :is="QuestionAccordion" :questionData="questionData" @questionDeleted="fetchData"/>

<style>
hr {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>