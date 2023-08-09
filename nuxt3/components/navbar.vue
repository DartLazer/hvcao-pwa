<template>
  <div>
    <nav class="navbar navbar-expand-lg" aria-label="Eighth navbar example"
         style="background: RGBA(248, 249, 250, 0.5)">
      <div class="container">
        <NuxtLink class="navbar-brand text-white" @click="store.cleanFiltersAndSearchBarNow()" to="/">HV Cao Vragen</NuxtLink>
        <button class="navbar-toggler collapsed" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarsExample07" aria-controls="navbarsExample07" aria-expanded="false"
                aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div ref="navbar" class="navbar-collapse collapse" id="navbarsExample07" style="">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <NuxtLink @click.native="collapseNavbar" @click="store.cleanFiltersAndSearchBarNow()" class="nav-link" active-class="active" to="/">Home</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink @click.native="collapseNavbar" class="nav-link" exact-active-class="active"
                        to="/blokbescherming">Blokbescherming
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

const store = useMainStore(); // Use the store

const navbarRef = ref(null);

const collapseNavbar = () => {
  if (navbarRef.value) {
    navbarRef.value.className = 'navbar-collapse collapse';
  }
}
</script>
