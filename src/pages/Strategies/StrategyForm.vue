<template>
  <div class="full-width q-pa-lg items-start">
    <q-card>
      <q-card-section>
        <strategy-form />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import StrategyForm from 'components/strategies/StrategyFormComponent.vue'
</script>

<style scoped>
  .full-width {
    width: 100%;
  }
</style>
