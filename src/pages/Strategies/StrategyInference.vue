<template>
  <div class="full-width q-pa-lg items-start">
    <q-card>
      <q-card-section>
        <strategy-inference />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import StrategyInference from 'components/strategies/StrategyInferenceComponent.vue'
</script>

<style scoped>
  .full-width {
    width: 100%;
  }
</style>
