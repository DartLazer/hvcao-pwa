<template>
  <div class="container">
    <form @submit.prevent="login" class="form-signin">
      <h2 class="form-signin-heading">Inloggen</h2>
      <div class="form-group">
        <input type="text" class="form-control" placeholder="Gebruikersnaam" required autofocus v-model="username">
      </div>
      <div class="form-group">
        <input type="password" class="form-control" placeholder="Wachtwoord" required v-model="password">
      </div>
      <div v-if="message">
        <p class="alert alert-info mt-2">{{ message }}</p>
      </div>
      <button class="btn btn-lg btn-primary btn-block mt-3" type="submit">Inloggen</button>
    </form>

    <div class="accordion mt-5" id="accordionExample">
      <div class="accordion-item">
        <h2 class="accordion-header" id="headingTwo">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
            Mee Helpen?
          </button>
        </h2>
        <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo"
             data-bs-parent="#accordionExample">
          <div class="accordion-body">
            <p class="fw-semibold">We zijn op zoek naar database-auteurs!</p>
            <p>Dit project wordt vrijwillig onderhouden door
              collega's binnen Transavia vanuit de cockpit. Als je een goede kennis hebt van de CAO en andere randzaken
              en graag wilt bijdragen,
              <a href="https://wa.me/31652500397" class="link-secondary">
                stuur me dan een berichtje via WhatsApp!</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {apiRemoteHost} from '~/services/api';
import {useMainStore} from "~/store/mainStore";

let store = useMainStore();
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
      // Save the token in localStorage
      localStorage.setItem('token', data.token);
      // Redirect to the admin page
      router.push('/admin');
    } else {
      message.value = 'Invalid credentials';
    }
  } catch (e) {
    message.value = 'Unable to connect to login server...'
  }
};

onMounted(() => {
  store.setPageTitle('Login')
});

</script>

<style scoped>
.container {
  max-width: 430px;
  padding: 15px;
  margin: 0 auto;
}

.form-group {
  padding-top: 1rem;
}
</style>
