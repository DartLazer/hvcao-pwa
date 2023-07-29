<template>
  <div class="accordion pb-3" id="scheduleChangeAccordion">
    <div class="accordion-item">
      <h2 class="accordion-header" id="scheduleChangeHeader">
        <button class="accordion-button collapsed button-accordion" type="button" data-bs-toggle="collapse" data-bs-target="#scheduleChangeCollapse" aria-expanded="true" aria-controls="scheduleChangeCollapse">
          Blokbescherming Calculator
        </button>
      </h2>
      <div id="scheduleChangeCollapse" class="accordion-collapse collapse " aria-labelledby="scheduleChangeHeader" data-bs-parent="#scheduleChangeAccordion">
        <div class="accordion-body">
          <!-- Tool Section -->
          <div class="container col-12 col-md-auto mx-auto mt-3 rounded-1">
            <!-- Time Notification Section -->
            <div>
              <div>
                <label for="notification-time" style="color: black;">Tijd van Notificatie:</label>
              </div>
              <div>
                <input type="datetime-local" v-model="notificationTimestamp" id="notification-time">
              </div>
            </div>

            <!-- Original Sign On/Off Section -->
            <div>
              <h5 class="mt-3" style="color: black;">Oorspronkelijke Dienst</h5>
              <div>
                <label for="original-reporting-time" style="color: black;">Aanmeldtijd:</label>
              </div>
              <div>
                <input type="datetime-local" v-model="originalReportingTimestamp" id="original-reporting-time">
              </div>
              <div>
                <label for="original-sign-out-time" style="color: black;">Afmeldtijd:</label>
              </div>
              <div>
                <input type="datetime-local" v-model="originalSignOutTimestamp" id="original-sign-out-time">
              </div>
            </div>

            <!-- New Sign On/Off Section -->
            <div>
              <h5 class="mt-3" style="color: black;">Nieuwe Dienst</h5>
              <div>
                <label for="new-reporting-time" style="color: black;">Nieuwe aanmeldtijd:</label>
              </div>
              <div>
                <input type="datetime-local" v-model="newReportingTimestamp" id="new-reporting-time">
              </div>
              <div>
                <label for="new-sign-out-time" style="color: black;">Nieuwe afmeldtijd:</label>
              </div>
              <div>
                <input type="datetime-local" v-model="newSignOutTimestamp" id="new-sign-out-time">
              </div>
            </div>

            <!-- Calculate Schedule Change Section -->
            <div class="mt-3">
              <button class="btn btn-primary" @click="calculateScheduleChange" >Bereken</button>
              <p style="color: black;" v-if="calculationResult">
                <strong>Bracket:</strong> {{ calculationResult.bracket }}<br />
                <strong>Bewilliging Vereist:</strong> {{ calculationResult.permissionRequired }}<br />
                <strong>Compensatie:</strong> {{ calculationResult.compensation }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import {ref} from 'vue';

const notificationTimestamp = ref('');
const originalReportingTimestamp = ref('');
const originalSignOutTimestamp = ref('');
const newReportingTimestamp = ref('');
const newSignOutTimestamp = ref('');
const calculationResult = ref(null);

const calculateScheduleChange = () => {
  let notificationTime = new Date(notificationTimestamp.value).getTime();
  let originalReportingTime = new Date(originalReportingTimestamp.value).getTime();
  let originalSignOutTime = new Date(originalSignOutTimestamp.value).getTime();
  let newReportingTime = new Date(newReportingTimestamp.value).getTime();
  let newSignOutTime = new Date(newSignOutTimestamp.value).getTime();

  let timeDiff = Math.abs(notificationTime - originalReportingTime);
  let hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));

  let bracket;
  let permissionRequired = "Nee";
  let compensation;

  let reportTimeChange = (newReportingTime - originalReportingTime) / (1000 * 60 * 60);
  let signOutTimeChange = (newSignOutTime - originalSignOutTime) / (1000 * 60 * 60);

  if (hoursDiff > 336) {
    bracket = 1;
    compensation = 0;
  } else if (hoursDiff <= 336 && hoursDiff > 168) {
    bracket = 2;
    if (Math.abs(reportTimeChange) > 3 || Math.abs(signOutTimeChange) > 3) {
      permissionRequired = "Ja";
      compensation = '1 PD';
    }
  } else if (hoursDiff <= 168 && hoursDiff >= 24) {
    bracket = 3;
    if ((reportTimeChange < -3 || reportTimeChange > -2) || (signOutTimeChange > 3 || signOutTimeChange < 2)) {
      permissionRequired = "Ja";
      compensation = '1 PD';
    }
  } else {
    bracket = 4;
    if (reportTimeChange < 0 || signOutTimeChange > 2) {
      permissionRequired = "Ja";
    }
    compensation = '1 PD';
  }

  calculationResult.value = {
    bracket,
    permissionRequired,
    compensation
  };
};

</script>
