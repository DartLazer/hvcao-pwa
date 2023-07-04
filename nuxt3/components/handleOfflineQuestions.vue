<template>
  <div>
    <button @click="uploadOfflineQuestions()" v-if="offlineQuestions.length > 0" class="btn btn-success btn-block mt-3">{{offlineQuestions.length}} Offline vragen uploaden</button>


  </div>
  </template>

<script setup>
import {ref} from 'vue';
import {submitQuestion} from "~/services/api";




const props = defineProps({
  offlineQuestions: Array
});

console.log(props.offlineQuestions)


// Define emitters
const emit = defineEmits(['questionDeleted', 'errorAlert', 'questionSubmitted', 'successAlert']);



const uploadOfflineQuestions = async function (){
  const storedItems = localStorage.getItem('offlineSubmitted')
  if (!storedItems){
    console.warn('Error! No offline questions found')
    return
  }
  const offlineQuestionsArray = JSON.parse(storedItems)
  let i = 0
  while(i < offlineQuestionsArray.length){
    const question = offlineQuestionsArray[i]
    try {
      const successful_post = await submitQuestion(question);
      if (!successful_post){
        console.warn('Error posting. Preserving offline questions')
        return
      }
    } catch (error) {
      // Error handling
      console.error(error);
      emit('errorAlert', error.message)
      $nuxt.emit('submissionError', error);
      return
    }
    i ++
  }
  localStorage.removeItem('offlineSubmitted')
  emit('questionSubmitted')
  emit('successAlert', 'Offline vragen zijn succesvol geupload!!')

}

</script>