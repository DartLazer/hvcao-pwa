<template>
  <div class="container my-2">
    <div class="col-12 col-md-auto mx-auto rounded-1">
      <h1>Pensioenbijdrage Calculator</h1>
      <div class="rounded-2 p-3 text-black" style="background: RGBA(248, 249, 250, 0.9)">
        <p class="col-lg-8">
          Deze tool is ontwikkeld om inzichtelijk te maken welk deel van het netto bedrag dat je van je werkgever
          ontvangt reeds bestemd is voor je pensioen, conform de richtlijnen in de CAO.
        </p>
        <p class="col-lg-8 text-small">
          Dit is geen advies over hoeveel
          je zou moeten sparen/beleggen, maar een weergave van het deel van je nettoloon dat volgens de CAO voor je
          pensioen is
          bedoeld.
        </p>
        <div>

          <div v-if="showAlert" class="alert alert-info col-lg-8 rounded-3 mt-3 alert-dismissible fade show"
               role="alert">
            <h4 class="alert-heading">Tool bijgewerkt volgens de nieuwe salaristabel.</h4>
            <p class="mb-0">De gegevens die door de tool worden gebruikt, zijn bijgewerkt volgens de nieuwe cao.</p>
            <p>Momenteel wordt de salaristabel van 1 oktober 2024 gehanteerd.</p>
            <p>Je kunt nu zelf kiezen tot welk percentage je de bruto toeslag wilt aanvullen.</p>
            <button type="button" class="btn-close" @click="dismissAlert" aria-label="Close"></button>
          </div>

        </div>
        <form @submit.prevent="calculateContribution">
          <div class="mb-3">
            <div class="mb-3">
              <label for="function" class="form-label">Functie</label>
              <select id="function" class="form-select" v-model="formData.function">
                <option value="CPT">CPT</option>
                <option value="FO">FO</option>
              </select>
            </div>
            <label for="salaryScale" class="form-label">Salarisschaal</label>
            <select id="salaryScale" class="form-select" v-model="formData.salaryScale">
              <option v-for="scale in 32" :key="scale" :value="scale">Schaal {{ scale }} (€
                {{ formatNumber(getSalaryByFunctionAndScale(formData.function, scale)) }})
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label for="age" class="form-label">Leeftijd (die je bereikt in dit kalenderjaar)</label>
            <select id="age" class="form-select" v-model="formData.age">
              <option v-for="age in 38" :key="age" :value="age + 20">{{ age + 20 }}</option>
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
          <p>Disclaimer: De informatie en data die door deze tool en deze pagina worden worden verstrekt, zijn
            uitsluitend bedoeld voor
            informatieve doeleinden. Let op: De verstrekte informatie mag niet worden gezien als financieel advies,
            investeringsadvies of enige vorm van aanbeveling. Wij kunnen niet verantwoordelijk worden gehouden door
            eventuele onjuistheden in deze informatie of voor de gevolgen van beslissingen die genomen worden op basis
            van deze informatie. </p>
        </div>

        <div v-if="showResults" ref="resultsRef" class="mt-3">

          <buy-me-coffee/>


          <h5>Berekende Pensioenbijdrage</h5>
          <p>Op basis van de ingevoerde informatie zou je maandelijks <strong>€{{
              formatNumber(calculatedContribution)
            }}
            netto</strong>
            apart moeten zetten voor je pensioen.</p>

          <h6>Details:</h6>

          <div class="col-lg-7">
            <table class="table table-striped col-3">
              <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Waarde</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <th scope="row" class="fw-normal">Bruto Toeslag (10%)</th>
                <td>€{{ formatNumber(brutoToeslag) }}</td>
              </tr>
              <tr>
                <th scope="row" class="fw-normal">
                  Aanvullen bruto toeslag tot
                  <select class="form-select d-inline w-auto" v-model="selectedPercentage" @change="calculateContribution">
                    <option v-for="percent in [11, 12, 13, 14, 15]" :key="percent" :value="percent">{{ percent }}%</option>
                  </select>
                  <span class="badge bg-info ms-2">Nieuw</span>
                </th>
                <td>€{{ formatNumber((netoBrutoToeslag - brutoToeslag)) }}</td>
              </tr>
              <tr>
                <th scope="row" class="fw-normal">Staffel 1</th>
                <td>€{{ formatNumber(staffel_1) }}</td>
              </tr>
              <tr>
                <th scope="row" class="fw-normal">Staffel 2</th>
                <td>€{{ formatNumber(staffel_2) }}</td>
              </tr>
              <!-- Empty row for spacing -->
              <tr>
                <td colspan="2" style="height: 20px;"></td>
              </tr>
              <tr>
                <th scope="row" class="fw-normal">Totaal Bruto</th>
                <td>€{{ formatNumber(totalBruto) }}</td>
              </tr>
              <tr>
                <th scope="row" class="">Totaal Netto</th>
                <td>€{{ formatNumber(calculatedContribution) }}</td>
              </tr>
              </tbody>
            </table>
            <p class="fw-light">
              Op je loonstrookje staan deze bedragen als volgt vermeld:
            </p>
            <ul>
              <li><span class="fw-semibold">Bruto Toeslag:</span> Bruto Toeslag</li>
              <li><span class="fw-semibold">Zelf aanvullen Bruto Toeslag:</span> Niet vermeld aangezien je dit zelf moet
                doen.
              </li>
              <li><span class="fw-semibold">Vrijvalstaffel 1</span> Pensioentoeslag bas.</li>
              <li><span class="fw-semibold">Vrijvalstaffel 2</span> Pensioentoeslag bov.</li>
            </ul>
          </div>


        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BigNumber from 'bignumber.js';
import salarisTabel from '@/assets/salaris_tabel.json';
import vrijvalStaffels from '@/assets/vrijvalstaffels.json';
import {ref} from "vue";
import {getCookie, setCookie} from "~/services/CookieHandler";
import {daysBetween} from "~/services/dateTimeUtils";

const maxEmployerContribution = new BigNumber(137800);
const taxOneMaxYearlySalary = new BigNumber(75518)
const tarrifOnePercentage = new BigNumber(0.63)
const tarrifTwoPercentage = new BigNumber(0.495)


const formData = ref({
  salaryScale: 1,
  function: 'FO',
  employmentPercentage: 100,
  age: 21,
});

const calculatedContribution = ref(new BigNumber(0));
const brutoToeslag = ref(new BigNumber(0));
const netoBrutoToeslag = ref(new BigNumber(0));
const staffel_1 = ref(new BigNumber(0));
const staffel_2 = ref(new BigNumber(0));
const totalBruto = ref(new BigNumber(0));
const resultsRef = ref(null);
const showResults = ref(false);
const showAlert = ref(false);
const selectedPercentage = ref(15); // Default to 15%

const alertLastShown = getCookie('newRetirementData25Oct2024');


// Check if the new data alert has already been shown & dismissed. If not show it.
if (!alertLastShown || daysBetween(new Date(alertLastShown), new Date()) > 90) {
  showAlert.value = true;
}

function dismissAlert() {
  showAlert.value = false;
  setCookie('newRetirementDataAug2024', new Date().toISOString(), 90);
}


function getSalaryByFunctionAndScale(func, scale) {
  const scaleEntry = salarisTabel[scale.toString()];
  if (!scaleEntry) {
    console.error('Scale entry not found');
    return new BigNumber(0);
  }
  const salaryString = func === 'FO' ? scaleEntry.fo : scaleEntry.cpt;
  return new BigNumber(salaryString.replace(',', '.')).multipliedBy(formData.value.employmentPercentage).dividedBy(100);
}

function getVrijvalStaffelsByAge(age) {
  const ageKey = age.toString();
  const staffelsForAge = vrijvalStaffels[ageKey];
  if (!staffelsForAge) {
    console.error('No entry found for this age');
    return {};
  }
  return staffelsForAge;
}

function calculateVrijval(monthly_salary, staffels, retirement_giving_salary) {
  let vrijval_1;
  let vrijval_2;
  if (retirement_giving_salary.isGreaterThan(maxEmployerContribution)) {
    vrijval_1 = maxEmployerContribution.dividedBy(12).multipliedBy(staffels[1]);
    vrijval_2 = retirement_giving_salary.minus(maxEmployerContribution).dividedBy(12).multipliedBy(staffels[2]);
  } else {
    vrijval_1 = retirement_giving_salary.dividedBy(12).multipliedBy(staffels[1]);
    vrijval_2 = new BigNumber(0);
  }
  staffel_1.value = vrijval_1;
  staffel_2.value = vrijval_2;
  return vrijval_1.plus(vrijval_2);
}


function calculateContribution() {
  const monthlySalary = getSalaryByFunctionAndScale(formData.value.function, formData.value.salaryScale);
  const retirementGivingSalary = monthlySalary.multipliedBy(12.84);
  const staffels = getVrijvalStaffelsByAge(formData.value.age);
  const vrijval = calculateVrijval(monthlySalary, staffels, retirementGivingSalary);

  const brutoContribution = retirementGivingSalary.dividedBy(12).multipliedBy(0.1);
  const completedBrutoContribution = brutoContribution.multipliedBy(selectedPercentage.value).dividedBy(10);
  brutoToeslag.value = brutoContribution;
  netoBrutoToeslag.value = completedBrutoContribution;
  totalBruto.value = completedBrutoContribution.plus(vrijval);

  if (monthlySalary.multipliedBy(12).isGreaterThan(taxOneMaxYearlySalary)) {
    calculatedContribution.value = completedBrutoContribution.plus(vrijval).dividedBy(2);
    console.log('Alles schaal 2')
  } else if (monthlySalary.multipliedBy(12).plus(totalBruto.value.multipliedBy(12)).isGreaterThan(taxOneMaxYearlySalary)) {
    let tarrifOneLeftOver = taxOneMaxYearlySalary.minus(monthlySalary.multipliedBy(12));
    console.log('Tarrif one leftover:' + tarrifOneLeftOver);
    let tarrifTwoAmount = totalBruto.value.multipliedBy(12).minus(tarrifOneLeftOver);
    console.log('Tarrif two amount:' + tarrifTwoAmount);
    let netYearly = tarrifOneLeftOver.multipliedBy(tarrifOnePercentage).plus(tarrifTwoAmount.multipliedBy(tarrifTwoPercentage));
    calculatedContribution.value = netYearly.dividedBy(12);
    console.log('Semi schaal 1/2');
  } else {
    calculatedContribution.value = totalBruto.value.multipliedBy(tarrifOnePercentage);
    console.log('Alles schaal 1');
  }

  showResults.value = true;

  nextTick(() => {
    if (resultsRef.value) {
      resultsRef.value.scrollIntoView({behavior: 'smooth'});
    }
  });
}

const formatNumber = (value) => {
  // Ensure the value is a BigNumber instance
  const bigNumberValue = BigNumber.isBigNumber(value) ? value : new BigNumber(value);

  // Convert to a string with two decimal places
  return bigNumberValue.toFixed(2);
};
</script>

<style scoped>
</style>
