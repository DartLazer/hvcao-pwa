<template>
  <div>
    <div v-if="loading" class="alert alert-info" role="alert">
      Loading...
    </div>
    <div v-if="error" class="alert alert-danger" role="alert">
      Error: {{ error }}
    </div>
    <div v-if="message" class="alert alert-success" role="alert">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(true)
const error = ref(null)
const message = ref(null)

const fetchApi = async () => {
  try {
    const response = await fetch('http://localhost:8002/test/', {
      headers: {
        'Authorization': `Token e58bb837ee6683ab0be7912e00ba239b5645a2f1`,
      },
    })
    if (!response.ok) {
      throw new Error('API response was not ok.')
    }
    const data = await response.json()
    message.value = data.message
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

fetchApi()
</script>
