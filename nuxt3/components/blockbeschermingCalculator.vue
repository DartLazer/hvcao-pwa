<template>
  <div class="accordion pb-3" id="scheduleChangeAccordion">
    <h2 class="accordion-header p-1" id="scheduleChangeHeader">
      Blokbescherming Calculator
    </h2>
    <div class="accordion-item">

      <div class="container col-12 col-md-auto mx-auto mt-3 rounded-1 p-3">
        <!-- Time Notification Section -->
        <h5 class="" style="color: black;">Notificatie Tijd</h5>
        <label class="form-label text-black" for="notification-time">Tijdstip waarom de schemawijziging is ontvangen.</label>
        <div class="col-12 col-lg-3">
          <div class="position-relative text-black">
            <input ref="notificationDatePicker" class="form-control date-picker pe-5" type="text"
                   placeholder="Selecteer Datum & Tijd">
            <i class="bi bi-calendar position-absolute top-50 end-0 translate-middle-y me-3"></i>
          </div>
        </div>

        <!-- Sign On Section -->
        <div class="col-12 col-lg-3">
          <h5 class="mt-3" style="color: black;">Aanmeldtijd</h5>

          <label class="form-label text-black" for="new-reporting-time">Oorspronkelijk aanmeldtijd:</label>
          <div class="position-relative text-black">
            <input ref="originalReportingDatePicker" class="form-control date-picker pe-5" type="text"
                   placeholder="Selecteer Datum & Tijd">
            <i class="bi bi-calendar position-absolute top-50 end-0 translate-middle-y me-3"></i>
          </div>
          <label class="form-label text-black" for="new-reporting-time">Nieuwe aanmeldtijd:</label>
          <div class="position-relative text-black">
            <input ref="newReportingDatePicker" class="form-control date-picker pe-5" type="text"
                   placeholder="Selecteer Datum & Tijd">
            <i class="bi bi-calendar position-absolute top-50 end-0 translate-middle-y me-3"></i>
          </div>
        </div>

        <!-- Sign Off Section -->
        <div class="col-12 col-lg-3">
          <h5 class="mt-3" style="color: black;">Afmeldtijd</h5>
          <label class="form-label text-black" for="new-reporting-time">Oorspronkelijk afmeldtijd:</label>
          <div class="position-relative text-black">
            <input ref="originalSignOutDatePicker" class="form-control date-picker pe-5" type="text"
                   placeholder="Selecteer Datum & Tijd">
            <i class="bi bi-calendar position-absolute top-50 end-0 translate-middle-y me-3"></i>
          </div>

          <label class="form-label text-black" for="new-reporting-time">Nieuwe afmeldtijd:</label>
          <div class="position-relative text-black">
            <input ref="newSignOutDatePicker" class="form-control date-picker pe-5" type="text"
                   placeholder="Selecteer Datum & Tijd">
            <i class="bi bi-calendar position-absolute top-50 end-0 translate-middle-y me-3"></i>
          </div>
        </div>

        <!-- Calculate Schedule Change Section -->
        <div class="mt-3 col-12 col-xl-5">
          <button class="btn btn-primary" @click="calculateScheduleChange">Bereken</button>
          <p class="mt-3 p-3 rounded-3  border border-3"  style="color: black;" v-if="calculationResult">
            <strong>Bracket:</strong> {{ calculationResult.bracket }}<br/>
            <strong>Bewilliging Vereist:</strong> {{ calculationResult.permissionRequired }}<br/>
            <strong>Compensatie:</strong> {{ calculationResult.compensation }}
          </p>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>

import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import {calculateBlockProtection} from "~/services/blockProtectionCalculator";

const notificationDatePicker = ref(null);
const originalReportingDatePicker = ref(null);
const originalSignOutDatePicker = ref(null);
const newReportingDatePicker = ref(null);
const newSignOutDatePicker = ref(null);
const calculationResult = ref(null);

const notificationTimestamp = ref('');
const originalReportingTimestamp = ref('');
const originalSignOutTimestamp = ref('');
const newReportingTimestamp = ref('');
const newSignOutTimestamp = ref('');

onMounted(() => {
  flatpickr(notificationDatePicker.value, {
    enableTime: true,
    altInput: true,
    altFormat: "F j, Y H:i", // 24-hour format for display
    dateFormat: "Y-m-d H:i", // 24-hour format for internal date
    time_24hr: true, // Enable 24-hour time format without AM/PM
    onChange: (selectedDates) => {
      notificationTimestamp.value = selectedDates[0];
    }
  });


  flatpickr(originalReportingDatePicker.value, {
    enableTime: true,
    altInput: true,
    altFormat: "F j, Y H:i",
    dateFormat: "Y-m-d H:i",
    onChange: (selectedDates) => {
      originalReportingTimestamp.value = selectedDates[0];
    }
  });

  flatpickr(originalSignOutDatePicker.value, {
    enableTime: true,
    altInput: true,
    altFormat: "F j, Y H:i",
    dateFormat: "Y-m-d H:i",
    onChange: (selectedDates) => {
      originalSignOutTimestamp.value = selectedDates[0];
    }
  });

  flatpickr(newReportingDatePicker.value, {
    enableTime: true,
    altInput: true,
    altFormat: "F j, Y H:i",
    dateFormat: "Y-m-d H:i",
    onChange: (selectedDates) => {
      newReportingTimestamp.value = selectedDates[0];
    }
  });

  flatpickr(newSignOutDatePicker.value, {
    enableTime: true,
    altInput: true,
    altFormat: "F j, Y H:i",
    dateFormat: "Y-m-d H:i",
    onChange: (selectedDates) => {
      newSignOutTimestamp.value = selectedDates[0];
    }
  });
});


const calculateScheduleChange = () => {
  calculationResult.value = calculateBlockProtection({
    notificationTimestamp: notificationTimestamp.value,
    originalReportingTimestamp: originalReportingTimestamp.value,
    originalSignOutTimestamp: originalSignOutTimestamp.value,
    newReportingTimestamp: newReportingTimestamp.value,
    newSignOutTimestamp: newSignOutTimestamp.value,
  });
};

</script>

<style>
input {
  margin-bottom: .2rem;
}
</style>
