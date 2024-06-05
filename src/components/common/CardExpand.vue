<template>
  <q-card :class="`bg-${bgColor}`">
    <q-card-section class="row" @click="show = !show">
      <div v-if="icon" class="col-3 border-r border-white">
        <q-icon :name="icon" size="50px" :class="`text-${iconColor}`"/>
      </div>
      <div :class="`row justify-between items-center col text-${textColor}`">
        <div class="text-h5">{{ label }}</div>
        <q-btn
          round
          flat
          dense
          :icon="show ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>
    </q-card-section>
    <q-card-section>
      <q-slide-transition >
        <div v-show="show">
          <q-separator />
          <q-card-section>
            <slot name="content"/>
          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card-section>
  </q-card>
</template>


<script setup>
import { computed, ref, watch } from "vue"

const props = defineProps({
  label: {
    default: ''
  },
  icon: {
    default: null
  },
  bgColor: {
    default: 'white'
  },
  textColor: {
    default: 'grey-9'
  },
  iconColor: {
    default: 'grey-9'
  },
  expanded: {
    type: Boolean,
    default: false
  },
})

const show = ref(props.expanded)
</script>
