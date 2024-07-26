<template>
  <q-table
    :title="t('strategies_x_personalities_calc')"
    :rows="strategiesData"
    :columns="columns"
    row-key="id"
    :loading="loading"
    :loading-label="t('loading')"
    :no-results-label="t('no_results')"
    :no-data-label="t('no_results')"
    :rows-per-page-options="[0]"
  >
    <template v-slot:top>
      <div class="table-top-row full-width">
        <div class="row">
          <div class="col">
            <h6 class="q-mt-none q-mb-none text-weight-regular">
              {{ t('strategies_x_personalities_calc') }}
            </h6>
          </div>
        </div>
        <div class="row q-mt-md q-col-gutter-md">
          <q-select
            v-model="selectedPersonalities"
            multiple
            :options="personalities"
            emit-value
            map-options
            option-label="label"
            option-value="personality"
            outlined
            dense
            use-chips
            stack-label
            class="col-xs-12"
            :label="t('personalities')"
          />
        </div>
      </div>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td key="actions" :props="props">
        <q-btn-group outline>
          <q-btn
            outline
            color="primary"
            icon="subject"
            @click="showStrategy(props.row)"
          >
            <q-tooltip>
              {{ t("show") }}
            </q-tooltip>
          </q-btn>
        </q-btn-group>
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="show">
    <q-card style="width: 1200px; max-width: 95vw;">
      <q-card-section>
        <div class="text-h6">{{ strategyToShow.name }}</div>
      </q-card-section>

      <q-card-section v-if="!!strategyToShow.image">
        <q-img
          class="full-width"
          :src="strategyToShow.image"
          loading="lazy"
          spinner-color="white"
          alt="image"
        />
      </q-card-section>

      <q-card-section v-html="strategyToShow.description || t('no_content')" />

      <q-card-actions>
        <div class="full-width text-right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getStrategies, destroyStrategy } from 'src/services/strategies/strategies-api'
import { t } from 'src/services/utils/i18n'
import { Notify, Dialog } from 'quasar'
import { checkIfLoggedUserHasAbility, loggedUser } from "boot/user"
import { ABILITIES } from "src/constants/abilities";

const canViewStrategies = ref(false)

const show = ref(false)
const strategyToShow = ref({})

const strategiesData = ref([])
const loading = ref(false)
const selectedPersonalities = ref([])

const personalities = ref([
  { personality: 'ESFJ', label: 'ESFJ - ' + t('all_personalities.ESFJ')},
  { personality: 'ISFJ', label: 'ISFJ - ' + t('all_personalities.ISFJ')},
  { personality: 'ESTJ', label: 'ESTJ - ' + t('all_personalities.ESTJ')},
  { personality: 'ISTJ', label: 'ISTJ - ' + t('all_personalities.ISTJ')},

  { personality: 'ESFP', label: 'ESFP - ' + t('all_personalities.ESFP')},
  { personality: 'ISFP', label: 'ISFP - ' + t('all_personalities.ISFP')},
  { personality: 'ESTP', label: 'ESTP - ' + t('all_personalities.ESTP')},
  { personality: 'ISTP', label: 'ISTP - ' + t('all_personalities.ISTP')},

  { personality: 'ENFP', label: 'ENFP - ' + t('all_personalities.ENFP')},
  { personality: 'INFP', label: 'INFP - ' + t('all_personalities.INFP')},
  { personality: 'ENFJ', label: 'ENFJ - ' + t('all_personalities.ENFJ')},
  { personality: 'INFJ', label: 'INFJ - ' + t('all_personalities.INFJ')},

  { personality: 'ENTP', label: 'ENTP - ' + t('all_personalities.ENTP')},
  { personality: 'INTP', label: 'INTP - ' + t('all_personalities.INTP')},
  { personality: 'ENTJ', label: 'ENTJ - ' + t('all_personalities.ENTJ')},
  { personality: 'INTJ', label: 'INTJ - ' + t('all_personalities.INTJ')},
])

const mainPagination = ref({
  page: 1,
  rowsPerPage: 100,
  rowsNumber: 0,
})

const columns = [
  {
    name: 'name',
    label: t('strategy_name'),
    align: 'left',
    field: 'name',
    sortable: true,
    sortOrder: 'da',
  },
  {
    name: 'personalities',
    label: t('selected_compatible_personalities'),
    align: 'left',
    field: 'personalities',
    sortable: true,
    sortOrder: 'da',
    sort: (a, b) => {
      const aQt = selectedPersonalities.value.filter(item => (a || []).includes(item)).length
      const bQt = selectedPersonalities.value.filter(item => (b || []).includes(item)).length

      return aQt - bQt
    },
    format: val => {
      const compatibleItems = selectedPersonalities.value.filter(item => (val || []).includes(item)).length
      const total = val?.length || 0

      return t('personalities_quantity', {quantity: `${compatibleItems}/${total}`})
    },
  },
  {
    name: 'actions',
    align: 'center',
    label: t('actions'),
    field: 'id',
    sortable: false
  },
]

onMounted(async () => {
  canViewStrategies.value = checkIfLoggedUserHasAbility(ABILITIES.VIEW_STRATEGIES)
  await getStrategiesFunction()
})

async function getStrategiesFunction(props) {
  loading.value = true
  try {
    mainPagination.value = props?.pagination || mainPagination.value
    strategiesData.value = await getStrategies(mainPagination.value)
  } catch (e) {
    Notify.create({
      message: t('failed_to_load_data'),
      type: 'negative'
    })
  }
  loading.value = false
}

function showStrategy(strategy) {
  strategyToShow.value = strategy
  show.value = true
}
</script>
