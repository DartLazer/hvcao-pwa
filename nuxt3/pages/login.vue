<template>
  <div class="container">
    <form @submit.prevent="login" class="form-signin">
      <h2 class="form-signin-heading">Please sign in</h2>
      <div class="form-group">
        <input type="text" class="form-control" placeholder="Username" required autofocus v-model="username">
      </div>
      <div class="form-group">
        <input type="password" class="form-control" placeholder="Password" required v-model="password">
      </div>
      <div v-if="message">
        <p class="alert alert-info mt-2">{{ message }}</p>
      </div>
      <button class="btn btn-lg btn-primary btn-block mt-3" type="submit">Sign in</button>
    </form>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {apiRemoteHost} from '~/services/api';
import {useRouter} from 'vue-router';

const username = ref('');
const password = ref('');
const message = ref('');
const router = useRouter();

definePageMeta({
  middleware: ['auth']
})

if (!navigator.onLine) {
  message.value = 'No internet connection.'
}

const login = async () => {

  message.value = 'Attempting login...'
  try {
    const response = await fetch(apiRemoteHost + '/api-token-auth/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value.toLowerCase(),
        password: password.value,
      }),
    });
    const data = await response.json();
    if (data.token) {
      // Save the token in sessionStorage
      sessionStorage.setItem('token', data.token);
      // Redirect to the admin page
      router.push('/admin');
    } else {
      message.value = 'Invalid credentials';
    }
  } catch (e) {
    message.value = 'Unable to connect to login server...'
  }


};
</script>

<style scoped>
.container {
  max-width: 330px;
  padding: 15px;
  margin: 0 auto;
}

.form-group {
  padding-top: 1rem;
}
</style>
