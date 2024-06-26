<template>
  <q-btn
    color="primary"
    icon="arrow_back"
    dense
    outline
    rounded
    :to="{ name: 'strategies' }"
  >
    <q-tooltip :offset="[5, 5]">
      {{ t('to_go_back') }}
    </q-tooltip>
  </q-btn>

  <div>
    <h4 class="q-mt-lg">{{ t('strategy') }}</h4>

    <q-form
      ref="strategyForm"
      @submit="saveStrategy()"
    >
      <div>
        <div class="row q-col-gutter-md">
          <q-input
            :label="t('name')"
            v-model="strategy.name"
            hide-bottom-space
            class="col-xs-12"
            dense
            outlined
            :readonly="!!strategy.id"
            :placeholder="t('strategy_name_placeholder')"
            :rules="[val => !!val || t('mandatory_completion')]"
          />
          <q-input
            :label="t('focus')"
            v-model="strategy.focus"
            hide-bottom-space
            class="col-xs-12"
            dense
            outlined
            :readonly="!!strategy.id"
            type="textarea"
            autogrow
            :placeholder="t('focus_placeholder')"
            :rules="[val => !!val || t('mandatory_completion')]"
          />
          <q-input
            :label="t('characteristics')"
            v-model="strategy.characteristics"
            hide-bottom-space
            dense
            class="col-xs-12"
            outlined
            :readonly="!!strategy.id"
            autogrow
            :placeholder="t('characteristics_placeholder')"
            :rules="[val => !!val || t('mandatory_completion')]"
          />
          <q-input
            :label="t('activities')"
            v-model="strategy.activities"
            hide-bottom-space
            dense
            class="col-xs-12"
            outlined
            :readonly="!!strategy.id"
            autogrow
            :placeholder="t('activities_placeholder')"
            :rules="[val => !!val || t('mandatory_completion')]"
          />
          <q-input
            :label="t('applied_resources')"
            v-model="strategy.applied_resources"
            hide-bottom-space
            dense
            class="col-xs-12"
            outlined
            :readonly="!!strategy.id"
            autogrow
            :placeholder="t('applied_resources_placeholder')"
            :rules="[val => !!val || t('mandatory_completion')]"
          />
          <q-input
            :label="t('reference')"
            v-model="strategy.reference"
            hide-bottom-space
            class="col-xs-12"
            dense
            outlined
            :readonly="!!strategy.id"
            :rules="[val => !!val || t('mandatory_completion')]"
          />
        </div>
      </div>

      <div v-if="!strategy.id" class="q-mt-md text-right">
        <q-btn
          outline
          :label="t('continue')"
          icon="arrow_forward"
          type="submit"
          color="primary"
          :disable="savingStrategy"
          :loading="savingStrategy"
        />
      </div>
    </q-form>
  </div>

  <div ref="answers"></div>

  <div v-if="strategy.id">
    <q-separator class="q-mt-xl" />

    <q-form
      ref="dichotomyAnswersForm"
      @submit="saveDichotomyAnswers()"
    >
      <div
        class="q-mt-lg"
        v-for="(dichotomy, dichotomyIndex) in dichotomyAnswersMapping"
        :key="`dichotomy-${dichotomyIndex}`"
      >
        <div class="text-h5 q-mb-md">{{ t(`${dichotomy.dichotomy}.dichotomy`) }}</div>

        <div
          v-for="(category, categoryIndex) in dichotomy.categories"
          :key="`category-${dichotomyIndex}-${categoryIndex}`"
          class="row q-mt-md"
        >
          <div class="col-12 q-mb-sm">
            <span class="text-bold q-mt-md">{{ t(`${dichotomy.dichotomy}.category_${categoryIndex + 1}`) }}: </span>
            <span class="text-italic">{{ t(`${dichotomy.dichotomy}.category_${categoryIndex + 1}_info`) }}</span>
          </div>
          <q-radio
            v-for="(value, answerIndex) in category"
            :key="`answer-${dichotomyIndex}-${categoryIndex}-${answerIndex}`"
            class="col-12"
            v-model="dichotomyAnswers[dichotomy.answerKey][categoryIndex]"
            :val="value"
            :label="t(`${dichotomy.dichotomy}.` + getAnswerLabelToTranslate(categoryIndex + 1, value))"
            :disable="!canRegister || !!dichotomyAnswers.id || categoryIndex >= 2 && (!dichotomyAnswers[dichotomy.answerKey][0] || !dichotomyAnswers[dichotomy.answerKey][1])"
          />
        </div>
      </div>

      <div v-if="!dichotomyAnswers.id" class="q-mt-md text-right">
        <q-btn
          outline
          :label="t('infer')"
          icon="bolt"
          type="submit"
          color="primary"
          :disable="savingDichotomyAnswers"
          :loading="savingDichotomyAnswers"
        />
      </div>
    </q-form>
  </div>

  <div ref="results">
    <div v-if="strategy.id && dichotomyAnswers.id">
      <q-separator class="q-mt-lg q-mb-lg" />
      <div class="text-h5 q-mb-md">{{ t("results") }}</div>
      <div v-if="strategy.personalities?.length" class="text-bold q-mt-md">{{ t("strategy_personalities") }}</div>
      <div v-else class="text-bold q-mt-md">{{ t("no_strategy_personalities") }}</div>
      <div v-if="strategy.personalities?.length" class="q-mt-md q-gutter-md">
        <q-chip
          v-for="(personality, i) in strategy.personalities"
          :key="`personality-${i}`"
          color="primary"
          text-color="white"
        >
          {{ personality }}: {{ t('all_personalities.'+personality) }}
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { useRouter, useRoute } from "vue-router"
import { createStrategy, getStrategy, updateStrategy } from "src/services/strategies/strategies-api"
import { Notify, Loading } from "quasar"
import { formatResponseError } from "src/services/utils/error-formatter"
import { t } from "src/services/utils/i18n"
import { createDichotomyAnswer } from "src/services/dichotomy_answers/dichotomy-answers-api";
import { checkIfLoggedUserHasAbility } from "boot/user";
import { ABILITIES } from "src/constants/abilities";

const router = useRouter()
const route = useRoute()

let savingStrategy = ref(false)
let savingDichotomyAnswers = ref(false)

const strategyForm = ref(null)
const dichotomyAnswersForm = ref(null)
const answers = ref(null)
const results = ref(null)

const canRegister = ref(false)

const strategy = ref({
  name: null,
  focus: null,
  characteristics: null,
  activities: null,
  applied_resources: null,
  reference: null,
})

const dichotomyAnswers = ref({
  strategy_id: null,
  dichotomy_ei: [null, null, null, null],
  dichotomy_sn: [null, null, null, null],
  dichotomy_tf: [null, null, null, null],
  dichotomy_jp: [null, null, null, null],
})

const dichotomyAnswersMapping = [
  {
    dichotomy: 'ei',
    answerKey: 'dichotomy_ei',
    categories: [ ['E', 'I', 'EI', ''], ['E', 'I', 'EI', ''], ['E', 'I', ''], ['EI', ''] ]
  },
  {
    dichotomy: 'sn',
    answerKey: 'dichotomy_sn',
    categories: [ ['S', 'N', 'SN', ''], ['S', 'N', 'SN', ''], ['S', 'N', ''], ['S', 'N', ''] ]
  },
  {
    dichotomy: 'tf',
    answerKey: 'dichotomy_tf',
    categories: [ ['T', 'F', 'TF', ''], ['T', 'F', 'TF', ''], ['T', 'F', ''], ['T', 'F', ''] ]
  },
  {
    dichotomy: 'jp',
    answerKey: 'dichotomy_jp',
    categories: [ ['J', 'P', 'JP', ''], ['J', 'P', 'JP', ''], ['J', 'P', ''], ['J', 'P', ''] ]
  },
];

onMounted(async () => {
  if (route.params.id) {
    await getStrategyFunction()
  }

  canRegister.value = checkIfLoggedUserHasAbility(ABILITIES.REGISTER_STRATEGIES)
})

async function saveStrategy() {
  if (route.params.id || !canRegister.value) {
    return
  }

  savingStrategy.value = true
  try {
    const validated = await strategyForm.value.validate()
    if (validated) {
      const strategyToSave = { ...strategy.value }
      strategy.value = await createStrategy(strategyToSave)

      setTimeout(() => {
        answers.value?.scrollIntoView({ behavior: 'smooth' })
      }, 200)

      router.push({ name: 'strategy_update', params: {id: strategy.value.id} })
    }
  } catch (error) {
    Notify.create({
      message: formatResponseError(error) || t('failed_to_save'),
      type: 'negative'
    })
  }
  savingStrategy.value = false
}

async function getStrategyFunction() {
  Loading.show()
  try {
    strategy.value = await getStrategy(route.params.id, {
      with: ['dichotomyAnswer']
    })
    if (strategy.value.dichotomy_answer) {
      dichotomyAnswers.value = strategy.value.dichotomy_answer
    }
  } catch (e) {
    Notify.create({
      message: t('failed_to_load'),
      type: 'negative'
    })
  }
  Loading.hide()
}

async function saveDichotomyAnswers() {
  if (dichotomyAnswers.value.id || !canRegister.value) {
    return
  }

  savingDichotomyAnswers.value = true
  try {
    const validated = await dichotomyAnswersForm.value.validate()
    if (validated) {
      const dichotomyAnswersToSave = { ...dichotomyAnswers.value }
      dichotomyAnswersToSave.strategy_id = strategy.value.id
      dichotomyAnswers.value = await createDichotomyAnswer(dichotomyAnswersToSave)

      Notify.create({
        message: t('inferred_strategy'),
        type: 'positive'
      })

      await getStrategyFunction()

      setTimeout(() => {
        results.value?.scrollIntoView({ behavior: 'smooth' })
      }, 200)
    }
  } catch (error) {
    Notify.create({
      message: formatResponseError(error) || t('failed_to_save'),
      type: 'negative'
    })
  }
  savingDichotomyAnswers.value = false
}

function getAnswerLabelToTranslate(category, value) {
  let valueLabel = value

  if (0 === value.length) {
    valueLabel = "none"
  }

  if (2 === value.length) {
    valueLabel = "both"
  }

  return `category_${category}_answer_${valueLabel}`
}
</script>
