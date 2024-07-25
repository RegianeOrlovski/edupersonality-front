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
            :readonly="!!strategy.id && !editDescriptions"
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
            :readonly="!!strategy.id && !editDescriptions"
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
            :readonly="!!strategy.id && !editDescriptions"
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
            :readonly="!!strategy.id && !editDescriptions"
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
            :readonly="!!strategy.id && !editDescriptions"
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
            :readonly="!!strategy.id && !editDescriptions"
            :rules="[val => !!val || t('mandatory_completion')]"
          />
          <div class="col-xs-12">
            <q-card
              v-if="!!strategy.id && !editDescriptions"
              flat
              bordered
            >
              <q-card-section v-html="strategy.description || t('no_content')" />
            </q-card>
            <q-editor
              v-else
              v-model="strategy.description"
              min-height="5rem"
              :toolbar="toolbar"
            />
          </div>
        </div>
      </div>

      <div class="q-mt-md text-right">
        <q-btn
          v-if="!strategy.id || editDescriptions"
          outline
          :label="t(!strategy.id ? 'continue': 'save')"
          :icon="!strategy.id ? 'arrow_forward': 'save'"
          type="submit"
          color="primary"
          :disable="savingStrategy"
          :loading="savingStrategy"
        />
        <q-btn
          v-if="!!strategy.id && !editDescriptions && canRegister && strategy.user_id === loggedUser.id"
          outline
          :label="t('edit')"
          icon="edit"
          type="button"
          color="primary"
          @click="editDescriptions = true"
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
      <div class="q-mt-lg text-right">
        <q-btn
          v-if="!!dichotomyAnswers.id && !editAnswers && canRegister && strategy.user_id === loggedUser.id"
          outline
          :label="t('edit')"
          icon="edit"
          type="button"
          color="primary"
          @click="editAnswers = true"
        />
      </div>

      <div
        class="q-mt-md"
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
            :disable="!canRegister || (!!dichotomyAnswers.id && !editAnswers) || categoryIndex >= 2 && (!dichotomyAnswers[dichotomy.answerKey][0] || !dichotomyAnswers[dichotomy.answerKey][1])"
          />
        </div>
      </div>

      <div class="q-mt-md text-right">
        <q-btn
          v-if="(!dichotomyAnswers.id || editAnswers) && strategy.user_id === loggedUser.id"
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
    <div v-if="strategy.id && dichotomyAnswers.id && !editAnswers">
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
import { createDichotomyAnswer, updateDichotomyAnswer } from "src/services/dichotomy_answers/dichotomy-answers-api";
import { checkIfLoggedUserHasAbility, loggedUser } from "boot/user";
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
const editDescriptions = ref(false)
const editAnswers = ref(false)

const strategy = ref({
  name: null,
  focus: null,
  characteristics: null,
  activities: null,
  applied_resources: null,
  reference: null,
  description: null,
})

const dichotomyAnswers = ref({
  strategy_id: null,
  dichotomy_ei: [null, null, null, null],
  dichotomy_sn: [null, null, null, null],
  dichotomy_tf: [null, null, null, null],
  dichotomy_jp: [null, null, null, null],
})

const toolbar = [
  [ 'bold', 'italic', 'strike', 'underline', 'subscript', 'superscript', 'removeFormat' ],
  [
    {
      label: 'Alinhamento',
      icon: 'format_align_left',
      fixedLabel: true,
      options: ['left', 'center', 'right', 'justify']
    },
    {
      label: 'Formatação',
      icon: 'title',
      list: 'no-icons',
      options: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ]
    },
    {
      label: 'Tamanho',
      icon: 'text_fields',
      list: 'no-icons',
      options: [ 'size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7' ]
    },
  ],
  ['unordered', 'ordered', 'quote', 'hr', 'link'],
  ['undo', 'redo', 'fullscreen']
]

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
  if (!canRegister.value) {
    return
  }

  savingStrategy.value = true
  try {
    const validated = await strategyForm.value.validate()
    if (validated) {
      const strategyToSave = { ...strategy.value }
      if (route.params.id) {
        strategy.value = await updateStrategy(route.params.id, strategyToSave)
      } else {
        strategy.value = await createStrategy(strategyToSave)
      }

      editDescriptions.value = false;

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
  if (!canRegister.value) {
    return
  }

  savingDichotomyAnswers.value = true
  try {
    const validated = await dichotomyAnswersForm.value.validate()
    if (validated) {
      const dichotomyAnswersToSave = { ...dichotomyAnswers.value }
      dichotomyAnswersToSave.strategy_id = strategy.value.id

      if (dichotomyAnswers.value.id) {
        dichotomyAnswers.value = await updateDichotomyAnswer(dichotomyAnswers.value.id, dichotomyAnswersToSave)
      } else {
        dichotomyAnswers.value = await createDichotomyAnswer(dichotomyAnswersToSave)
      }

      editAnswers.value = false

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
