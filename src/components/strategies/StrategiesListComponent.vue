<template>
  <q-table
    :title="t('strategies')"
    :rows="strategiesData"
    :columns="columns"
    row-key="id"
    v-model:pagination="mainPagination"
    :loading="loading"
    :loading-label="t('loading')"
    :no-results-label="t('no_results')"
    :no-data-label="t('no_results')"
    binary-state-sort
    @request="getStrategiesFunction"
  >
    <template v-slot:top>
      <div class="table-top-row full-width">
        <div class="row">
          <div class="col">
            <h6 class="q-mt-none q-mb-none text-weight-regular">
              {{ t('strategies') }}
            </h6>
          </div>
          <div class="col">
            <q-btn
              v-if="canRegister"
              icon="add"
              class="float-right"
              :label="t('register')"
              color="primary"
              outline
              :to="{ name: 'strategy_create' }"
            />
          </div>
        </div>
      </div>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td key="actions" :props="props">
        <q-btn-group outline>
          <q-btn
            outline
            color="primary"
            icon="visibility"
            :to="{ name: 'strategy_update', params: { 'id': props.row.id } }"
          >
            <q-tooltip>
              {{ t("show") }}
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="props.row.user_id === loggedUser.id"
            outline
            color="negative"
            icon="delete"
            :loading="removingId === props.row.id"
            :disable="removingId === props.row.id"
            @click="destroyStrategyFunction(props.row.id)"
          >
            <q-tooltip>
              {{ t('remove') }}
            </q-tooltip>
          </q-btn>
        </q-btn-group>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getStrategies, destroyStrategy } from 'src/services/strategies/strategies-api'
import { t } from 'src/services/utils/i18n'
import { Notify, Dialog } from 'quasar'
import { checkIfLoggedUserHasAbility, loggedUser } from "boot/user"
import { ABILITIES } from "src/constants/abilities";

let strategiesData = ref([])
let loading = ref(false)
let removingId = ref(null)

const mainPagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const columns = [
  {
    name: 'name',
    label: t('name'),
    align: 'left',
    field: 'name',
  },
  {
    name: 'personalities',
    label: t('compatible_personalities'),
    align: 'left',
    field: 'personalities',
    format: val => t('personalities', {quantity: (val?.length || 0)}),
  },
  {
    name: 'actions',
    align: 'center',
    label: t('actions'),
    field: 'id',
    sortable: false
  },
]

const canRegister = ref(false)

onMounted(async () => {
  canRegister.value = checkIfLoggedUserHasAbility(ABILITIES.REGISTER_STRATEGIES)
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

function destroyStrategyFunction(id) {
  Dialog.create({
    title: t('warning'),
    message: t('confirm_remove'),
    cancel: true,
  }).onOk(async () => {
    removingId.value = id
    try {
      await destroyStrategy(id)
      getStrategiesFunction()

      Notify.create({
        message: t('removed_successfully'),
        type: 'positive'
      })
    } catch (e) {
      Notify.create({
        message: t('failed_to_remove'),
        type: 'negative'
      })
    }
    removingId.value = null
  })
}
</script>
