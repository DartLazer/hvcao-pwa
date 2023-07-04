<template>
  <div>
    <button @click="uploadOfflineQuestions()" v-if="offlineQuestions.length > 0" class="btn btn-success btn-block mt-3">
      {{ offlineQuestions.length }} Offline vragen uploaden
    </button>
  </div>
</template>

<script setup>
import {useMainStore} from '~/store/mainStore';
import {submitQuestion} from "~/services/api";


// Use the question store
const store = useMainStore();

// Access offlineQuestions from the store
const offlineQuestions = computed(() => store.offlineQuestions);

const uploadOfflineQuestions = async function () {
  if (!offlineQuestions.value.length) {
    console.warn('Error! No offline questions found')
    return
  }

  for (const question of offlineQuestions.value) {
    try {
      const successful_post = await submitQuestion(question);
      if (!successful_post) {
        console.warn('Error posting. Preserving offline questions')
        store.showErrorAlert('Fout bij het uploaden van de vraag. Het kan zijn dat de database nog offline is of de internet verbinding niet goed. Probeer het later opnieuw')
        return
      }
    } catch (error) {
      // Error handling
      console.error(error);
      store.showErrorAlert('Fout bij het uploaden van de vraag. Het kan zijn dat de database nog offline is of de internet verbinding niet goed. Probeer het later opnieuw')
      return
    }
  }
  // Clear the offline questions after they've been uploaded
  store.removeAllOfflineQuestions();
  store.showSuccessAlert('De offline vragen zijn succesvol geupload!')
  store.requestRefresh()
}
</script>
