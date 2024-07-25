<template>
  <div class="row">
    <div class="col-xs-12 col-md-6 col-xl-3 q-pa-sm" v-for="(item, index) in data" :key="index">
      <card-expand
        :bg-color="item.bgColor"
        :icon-color="item.textColor"
        :text-color="item.textColor"
        :label="item.label"
        :icon="item.icon"
      >
        <template v-slot:content>
          <q-list dense>
            <q-item @click="showStrategy(strategy)" clickable v-ripple v-for="(strategy, p) in item.list" :key="`p-${p}`">
              <q-item-section>
                {{ strategy.name }}
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </card-expand>
    </div>
  </div>
  <q-dialog v-model="show">
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6">{{ strategyToShow.name }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-bold">{{ t("focus") }}</div>
        {{ strategyToShow.focus }}
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-bold">{{ t("characteristics") }}</div>
        {{ strategyToShow.characteristics }}
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-bold">{{ t("activities") }}</div>
        {{ strategyToShow.activities }}
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-bold">{{ t("applied_resources") }}</div>
        {{ strategyToShow.applied_resources }}
      </q-card-section>

      <q-card-actions class="row justify-between">
        <q-btn
          v-if="canViewStrategies"
          flat
          color="primary"
          :to="{ name: 'strategy_update', params: { 'id': strategyToShow.id } }"
          :label="t('more_details')"
        />
        <q-btn flat label="OK" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import CardExpand from "components/common/CardExpand.vue";
import { t } from 'src/services/utils/i18n'
import { onMounted, ref } from "vue";
import { getStrategies } from "src/services/strategies/strategies-api";
import { Notify } from "quasar";
import { checkIfLoggedUserHasAbility } from "boot/user";
import { ABILITIES } from "src/constants/abilities";

const data = ref([
  { personality: 'ESFJ', list: [], label: 'ESFJ - ' + t('all_personalities.ESFJ'), bgColor: 'blue-1', textColor: 'blue-8', icon: 'menu_book' },
  { personality: 'ISFJ', list: [], label: 'ISFJ - ' + t('all_personalities.ISFJ'), bgColor: 'blue-1', textColor: 'blue-8', icon: 'health_and_safety' },
  { personality: 'ESTJ', list: [], label: 'ESTJ - ' + t('all_personalities.ESTJ'), bgColor: 'blue-1', textColor: 'blue-8', icon: 'business_center' },
  { personality: 'ISTJ', list: [], label: 'ISTJ - ' + t('all_personalities.ISTJ'), bgColor: 'blue-1', textColor: 'blue-8', icon: 'edit' },

  { personality: 'ESFP', list: [], label: 'ESFP - ' + t('all_personalities.ESFP'), bgColor: 'orange-1', textColor: 'orange-8', icon: 'celebration' },
  { personality: 'ISFP', list: [], label: 'ISFP - ' + t('all_personalities.ISFP'), bgColor: 'orange-1', textColor: 'orange-8', icon: 'palette' },
  { personality: 'ESTP', list: [], label: 'ESTP - ' + t('all_personalities.ESTP'), bgColor: 'orange-1', textColor: 'orange-8', icon: 'build' },
  { personality: 'ISTP', list: [], label: 'ISTP - ' + t('all_personalities.ISTP'), bgColor: 'orange-1', textColor: 'orange-8', icon: 'category' },

  { personality: 'ENFP', list: [], label: 'ENFP - ' + t('all_personalities.ENFP'), bgColor: 'teal-1', textColor: 'teal-8', icon: 'emoji_flags'},
  { personality: 'INFP', list: [], label: 'INFP - ' + t('all_personalities.INFP'), bgColor: 'teal-1', textColor: 'teal-8', icon: 'handshake'},
  { personality: 'ENFJ', list: [], label: 'ENFJ - ' + t('all_personalities.ENFJ'), bgColor: 'teal-1', textColor: 'teal-8', icon: 'emoji_people'},
  { personality: 'INFJ', list: [], label: 'INFJ - ' + t('all_personalities.INFJ'), bgColor: 'teal-1', textColor: 'teal-8', icon: 'thumb_up'},

  { personality: 'ENTP', list: [], label: 'ENTP - ' + t('all_personalities.ENTP'), bgColor: 'purple-1', textColor: 'purple-8', icon: 'emoji_objects'},
  { personality: 'INTP', list: [], label: 'INTP - ' + t('all_personalities.INTP'), bgColor: 'purple-1', textColor: 'purple-8', icon: 'rebase_edit'},
  { personality: 'ENTJ', list: [], label: 'ENTJ - ' + t('all_personalities.ENTJ'), bgColor: 'purple-1', textColor: 'purple-8', icon: 'military_tech'},
  { personality: 'INTJ', list: [], label: 'INTJ - ' + t('all_personalities.INTJ'), bgColor: 'purple-1', textColor: 'purple-8', icon: 'map'},
])

const show = ref(false)
const strategyToShow = ref({})
const loading = ref(false)
const mainPagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const canViewStrategies = ref(false)

onMounted(async () => {
  canViewStrategies.value = checkIfLoggedUserHasAbility(ABILITIES.VIEW_STRATEGIES)
  await getStrategiesFunction()
})

function showStrategy(strategy) {
  strategyToShow.value = strategy
  show.value = true
}

async function getStrategiesFunction() {
  loading.value = true
  try {
    const result = await getStrategies(mainPagination.value)
    data.value = data.value.map((item) => {
      item.list = result.filter((strategy) => strategy.personalities?.includes(item.personality))

      return item
    })
  } catch (e) {
    Notify.create({
      message: t('failed_to_load_data'),
      type: 'negative'
    })
  }
  loading.value = false
}
</script>
