<template>
  <div>
    <nav class="navbar navbar-expand-lg" aria-label="Eighth navbar example"
         style="background: RGBA(248, 249, 250, 0.5)">
      <div class="container">
        <NuxtLink class="navbar-brand text-white mt-auto pb-2" @click="store.cleanFiltersAndSearchBarNow()" to="/">
          HV CAO
        </NuxtLink>
        <button class="navbar-toggler collapsed" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarsExample07" aria-controls="navbarsExample07" aria-expanded="false"
                aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div ref="navbarRef" class="navbar-collapse collapse" id="navbarsExample07" style="">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <NuxtLink @click.native="collapseNavbar" @click="store.cleanFiltersAndSearchBarNow()" class="nav-link"
                        active-class="active" to="/">Home
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink @click.native="handleBlokbeschermingClick" class="nav-link" exact-active-class="active"
                        to="/blokbescherming">
                Blokbescherming
                <span v-if="showBlokbeschermingBadge" class="badge bg-info ms-2">Nieuw</span>
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink @click.native="collapseNavbar" class="nav-link" exact-active-class="active"
                        to="/pensioencalculator">Pensioenbijdrage Calculator
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink @click.native="collapseNavbar" class="nav-link" exact-active-class="active" to="/about">Over
                deze app
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink @click.native="collapseNavbar" class="nav-link" exact-active-class="active" to="login">Admin
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import {useMainStore} from "~/store/mainStore";
import {ref, onMounted} from 'vue';
import {getCookie, setCookie} from '~/services/CookieHandler';


const store = useMainStore(); // Use the store

const navbarRef = ref(null);

const collapseNavbar = () => {
  if (navbarRef.value) {
    navbarRef.value.className = 'navbar-collapse collapse';
  }
}

const showBlokbeschermingBadge = ref(true);

onMounted(() => {
  const badgeSeen = getCookie('blokbeschermingBadgeSeen');
  if (badgeSeen) {
    showBlokbeschermingBadge.value = false;
  }
});

const handleBlokbeschermingClick = () => {
  setCookie('blokbeschermingBadgeSeen', 'yes', 365);
  showBlokbeschermingBadge.value = false;
  collapseNavbar();
};


</script>

<style scoped>

.container {
  color: white;
}

.navbar .nav-link {
  //color: white !important;
}

.navbar .nav-link:hover {
  transform: scale(1.1); /* This scales the text up by 10% */
  font-weight: bold;
}

.navbar .nav-link:active,
.navbar .nav-link:focus {
  //color: white !important;
  font-weight: bold;
}

.navbar-brand,
.navbar-brand:hover {
  //color: white !important;
  font-weight: bold;
}
</style>
