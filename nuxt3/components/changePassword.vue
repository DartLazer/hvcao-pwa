<template>
  <!-- Button trigger modal -->
  <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#changePasswordModal">
    Wachtwoord veranderen
  </button>

  <!-- Modal -->
  <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-labelledby="changePasswordModalLabel"
       aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-black" id="changePasswordModalLabel">Wachtwoord veranderen</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-black">
          <form @submit.prevent="changePasswordForm" class="form-signin ">
            <div class="form-group">
              <input type="password" class="form-control" placeholder="Nieuwe Wachtwoord" required autofocus
                     v-model="password">
            </div>
            <div class="form-group">
              <input type="password" class="form-control" placeholder="Nieuwe Wachtwoord" required
                     v-model="passwordCheck">
            </div>
            <p class="small text-muted mt-2">
              Gebruik minimaal 8 tekens. Veelvoorkomende of volledig numerieke wachtwoorden worden geweigerd.
            </p>
            <div v-if="passwordChangeError.show" class="alert mt-3"
                 :class="{'alert-danger': !passwordChangeError.success, 'alert-success': passwordChangeError.success}"
                 role="alert">
              {{ passwordChangeError.message }}
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" @click="changePasswordForm" class="btn btn-primary">Wachtwoord veranderen</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Sluiten</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {changePassword} from '~/services/api.js'

const password = ref('');
const passwordCheck = ref('');
const passwordChangeError = ref({show: false, message: ''});
const changePasswordForm = async () => {
  if (password.value !== passwordCheck.value) {
    showErrorMessage("Wachtwoorden komen niet overeen.")
    return
  }

  if (password.value.length < 8) {
    showErrorMessage("Minimale wachtwoord lengte is 8.")
    return
  }

  const response = await changePassword(password.value)

  if (response.success) {
    showErrorMessage(response.message, true, false)
  } else {
    showErrorMessage(response.message)
  }
}

const showErrorMessage = function (errorMessage, success = false, timeout = true) {
  passwordChangeError.value = {show: true, message: errorMessage, success: success};
  // Remove message after 3 seconds.
  if (timeout) {
    setTimeout(() => {
      passwordChangeError.value = {show: false, message: '', success: false};
    }, 5000);
  }
}


</script>