<template>
  <div>
    <div class="accordion pb-3" id="accordionExample">
      <div class="accordion-item">
        <h2 class="accordion-header" id="headingTwo">
          <button class="accordion-button button-accordion collapsed btn" type="button" data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
            Uitgebreide tabel openen
          </button>
        </h2>
        <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo"
             data-bs-parent="#accordionExample">
          <div class="accordion-body">
            <img src="/static/blokbescherming.jpg" alt="Blokbescherming tabel" class="img-fluid">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>