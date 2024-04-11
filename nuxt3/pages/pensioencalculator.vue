<template>
  <div class="container my-5">
    <div class="col-12 col-md-auto mx-auto rounded-1">
      <h1>Pensioenbijdrage Calculator</h1>
      <div class="rounded-2 p-3 text-black" style="background: RGBA(248, 249, 250, 0.9)">
        <p class="col-8">
          Deze tool is ontworpen om je inzicht te geven in hoeveel van je salaris je <strong>netto</strong> apart zou
          moeten zetten voor je pensioen, gebaseerd op je huidige salarisschaal, om te voldoen aan de bedachte
          pensioensopbouw.
        </p>
        <form @submit.prevent="calculateContribution">
          <div class="mb-3">
            <label for="salaryScale" class="form-label">Salarisschaal</label>
            <select id="salaryScale" class="form-select" v-model="formData.salaryScale">
              <option v-for="scale in 32" :key="scale" :value="scale">Schaal {{ scale }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="age" class="form-label">Leeftijd</label>
            <select id="age" class="form-select" v-model="formData.age">
              <option v-for="age in 37" :key="age" :value="age + 20">{{ age + 20 }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="function" class="form-label">Functie</label>
            <select id="function" class="form-select" v-model="formData.function">
              <option value="CPT">CPT</option>
              <option value="FO">FO</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="employmentPercentage" class="form-label">Tewerkstellingspercentage</label>
            <select id="employmentPercentage" class="form-select" v-model="formData.employmentPercentage">
              <option value="50">50%</option>
              <option value="75">75%</option>
              <option value="100">100%</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Bereken</button>
        </form>

        <div class="fw-light small text-muted mt-2">
          <p>Disclaimer: De data gebruikt voor deze zijn gebaseerd op de vrijvalstaffels van 2024 en de salaristabel per
            1 januari 2024. Hoewel er grote zorg is besteed aan de nauwkeurigheid van deze informatie, vraag ik je
            om altijd zelf de gegevens te controleren. Deze informatie wordt uitsluitend ter advies aangeboden en is
            niet bindend. Ik aanvaard geen aansprakelijkheid voor eventuele onjuistheden of de gevolgen van het
            gebruik van deze informatie.</p>
        </div>

        <div v-if="showResults" class="mt-3">

          <buy-me-coffee/>


          <h5>Berekende Pensioenbijdrage</h5>
          <p>Op basis van de ingevoerde informatie zou je maandelijks <strong>€{{ calculatedContribution.toFixed(2) }}
            netto</strong>
            apart moeten zetten voor je pensioen.</p>

          <h6>Details:</h6>

          <div class="col-lg-5">
            <table class="table table-striped col-3">
              <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Waarde</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <th scope="row" class="fw-normal">Bruto Toeslag</th>
                <td>€{{ brutoToeslag.toFixed(2) }}</td>
              </tr>
              <tr>
                <th scope="row" class="fw-normal">Aanvulling Bruto Toeslag</th>
                <td>€{{ (netoBrutoToeslag.toFixed(2) - brutoToeslag.toFixed(2)).toFixed(2) }}</td>
              </tr>
              <tr>
                <th scope="row" class="fw-normal">Staffel 1</th>
                <td>€{{ staffel_1.toFixed(2) }}</td>
              </tr>
              <tr>
                <th scope="row" class="fw-normal">Staffel 2</th>
                <td>€{{ staffel_2.toFixed(2) }}</td>
              </tr>
              <!-- Empty row for spacing -->
              <tr>
                <td colspan="2" style="height: 20px;"></td>
              </tr>
              <tr>
                <th scope="row" class="fw-normal">Totaal Bruto</th>
                <td>€{{ (netoBrutoToeslag + staffel_1 + staffel_2).toFixed(2) }}</td>
              </tr>
              <tr>
                <th scope="row" class="">Totaal Netto</th>
                <td>€{{ calculatedContribution.toFixed(2) }}</td>
              </tr>
              </tbody>
            </table>
            <p class="fw-light">
              Op je loonstrookje staan deze bedragen als volgt vermeld:
              <ul>
                <li><span class="fw-semibold">Bruto Toeslag:</span> Bruto Toeslag</li>
                <li><span class="fw-semibold">Vrijvalstaffels</span> Pensioentoeslag bas</li>
              </ul>
            </p>

          </div>


        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import salarisTabel from '@/assets/salaris_tabel.json';
import vrijvalStaffels from '@/assets/vrijvalstaffels.json';

const max_employer_contribution = 137800;

const formData = ref({
  salaryScale: 1,
  function: 'FO',
  employmentPercentage: 100,
  age: 21,
});

const calculatedContribution = ref(0);
const brutoToeslag = ref(0);
const netoBrutoToeslag = ref(0);
const staffel_1 = ref(0);
const staffel_2 = ref(0);
const showResults = ref(false);


function getSalaryByFunctionAndScale(func, scale) {
  const scaleEntry = salarisTabel[scale.toString()];
  if (!scaleEntry) {
    console.error('Scale entry not found');
    return 0; // Handle this case as you see fit
  }

  const salaryString = func === 'FO' ? scaleEntry.fo : scaleEntry.cpt;
  return parseFloat(salaryString.replace(',', '.')) * formData.value.employmentPercentage / 100;
}

function getVrijvalStaffelsByAge(age) {
  // Convert age to string to use as key, since your JSON keys are strings
  const ageKey = age.toString();
  const staffelsForAge = vrijvalStaffels[ageKey];

  if (!staffelsForAge) {
    console.error('No entry found for this age');
    return {}; // Return an empty object or handle as you see fit
  }

  return staffelsForAge;
}

function calculateVrijval(monthly_salary, staffels) {
  // Calculate vrijval based on salary and staffels
  const retirement_giving_salary = monthly_salary * 12.83;
  let vrijval_1;
  // log vrijval1 to console and indicate what it is
  console.log('vrijval_1:', vrijval_1);

  let vrijval_2;
  // if retirement giving salary more than max_employer_contribution
  if (retirement_giving_salary > max_employer_contribution) {
    vrijval_1 = max_employer_contribution /12 * staffels[1];
    vrijval_2 = (retirement_giving_salary - max_employer_contribution) / 12 * staffels[2];
  } else {
    vrijval_1 = retirement_giving_salary / 12 * staffels[1];
    vrijval_2 = 0;
  }
  // log vrijval2 to console and indicate what it is
  console.log('vrijval_2:', vrijval_2);
  staffel_1.value = vrijval_1;
  staffel_2.value = vrijval_2;
  return vrijval_1 + vrijval_2;
}

function calculateContribution() {
  // Determine salary based on function and salaryScale
  const monthly_salary = getSalaryByFunctionAndScale(formData.value.function, formData.value.salaryScale);
  // log salary to console and indicate what it is
  console.log('salary:', monthly_salary);
  const staffels = getVrijvalStaffelsByAge(formData.value.age);
  const vrijval = calculateVrijval(monthly_salary, staffels);
  const bruto_contribution = ((monthly_salary * 12.83) / 12) * 0.073;
  const completed_bruto_contribution = bruto_contribution * 11 / 7.3;
  brutoToeslag.value = bruto_contribution;
  netoBrutoToeslag.value = completed_bruto_contribution;
  // log bruto_contribution to console and indicate what it is
  console.log('bruto_contribution:', bruto_contribution);
  calculatedContribution.value = (completed_bruto_contribution + vrijval) / 2;
  showResults.value = true;
}
</script>

<style scoped>
</style>
