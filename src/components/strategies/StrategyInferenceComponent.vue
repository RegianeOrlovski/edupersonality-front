<template>

  <div>
    <div ref="refTop"></div>
    <h4 class="q-mt-lg">{{ t('test_your_strategy') }}</h4>

    <div class="col-xs-12 q-mb-xs text-bold">
      {{ t('main_info_to_inference') }}
    </div>

    <q-separator/>

    <div class="row q-col-gutter-sm q-mt-xs">
      <div class="text-bold">{{ t('focus') }}:</div>
      <div class="col-xs-12 text-grey-9">
        {{ t('focus_placeholder') }}
      </div>

      <div class="text-bold">{{ t('characteristics') }}:</div>
      <div class="col-xs-12 text-grey-9">
        {{ t('characteristics_placeholder') }}
      </div>

      <div class="text-bold">{{ t('activities') }}:</div>
      <div class="col-xs-12 text-grey-9">
        {{ t('activities_placeholder') }}
      </div>

      <div class="text-bold">{{ t('applied_resources') }}:</div>
      <div class="col-xs-12 text-grey-9">
        {{ t('applied_resources_placeholder') }}
      </div>
    </div>
  </div>

  <q-separator class="q-mt-xl"/>

  <q-form
    ref="refDichotomyAnswersForm"
    @submit="infer()"
  >
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
          :disable="categoryIndex >= 2 && (!dichotomyAnswers[dichotomy.answerKey][0] || !dichotomyAnswers[dichotomy.answerKey][1])"
        />
      </div>
    </div>

    <div class="q-mt-md text-right">
      <q-btn-group>
        <q-btn
          outline
          :label="t('clear_all')"
          icon="refresh"
          type="button"
          color="secondary"
          @click="reset()"
        />
        <q-btn
          outline
          :label="t('infer')"
          icon="bolt"
          type="submit"
          color="primary"
          :disable="inferring"
          :loading="inferring"
        />
      </q-btn-group>
    </div>
  </q-form>

  <div ref="refResults">
    <div v-if="null !== dichotomyAnswersPersonalitiesResult">
      <q-separator class="q-mt-lg q-mb-lg"/>
      <div class="text-h5 q-mb-md">{{ t('results') }}</div>
      <div v-if="dichotomyAnswersPersonalitiesResult?.length" class="text-bold q-mt-md">{{
          t('strategy_personalities')
        }}
      </div>
      <div v-else class="text-bold q-mt-md">{{ t('no_strategy_personalities') }}</div>
      <div v-if="dichotomyAnswersPersonalitiesResult?.length" class="q-mt-md q-gutter-md">
        <q-chip
          v-for="(personality, i) in dichotomyAnswersPersonalitiesResult"
          :key="`personality-${i}`"
          color="primary"
          text-color="white"
        >
          {{ personality }}: {{ t('all_personalities.' + personality) }}
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Notify } from 'quasar';
import { formatResponseError } from 'src/services/utils/error-formatter';
import { t } from 'src/services/utils/i18n';
import { inferDichotomyAnswer } from 'src/services/dichotomy_answers/dichotomy-answers-api';

const refTop = ref(null);
const refDichotomyAnswersForm = ref(null);
const refResults = ref(null);

const inferring = ref(false);
const dichotomyAnswersPersonalitiesResult = ref(null);

const dichotomyAnswers = ref({
  dichotomy_ei: [ null, null, null, null ],
  dichotomy_sn: [ null, null, null, null ],
  dichotomy_tf: [ null, null, null, null ],
  dichotomy_jp: [ null, null, null, null ],
});

const dichotomyAnswersMapping = [
  {
    dichotomy: 'ei',
    answerKey: 'dichotomy_ei',
    categories: [ [ 'E', 'I', 'EI', '' ], [ 'E', 'I', 'EI', '' ], [ 'E', 'I', '' ], [ 'EI', '' ] ],
  },
  {
    dichotomy: 'sn',
    answerKey: 'dichotomy_sn',
    categories: [ [ 'S', 'N', 'SN', '' ], [ 'S', 'N', 'SN', '' ], [ 'S', 'N', '' ], [ 'S', 'N', '' ] ],
  },
  {
    dichotomy: 'tf',
    answerKey: 'dichotomy_tf',
    categories: [ [ 'T', 'F', 'TF', '' ], [ 'T', 'F', 'TF', '' ], [ 'T', 'F', '' ], [ 'T', 'F', '' ] ],
  },
  {
    dichotomy: 'jp',
    answerKey: 'dichotomy_jp',
    categories: [ [ 'J', 'P', 'JP', '' ], [ 'J', 'P', 'JP', '' ], [ 'J', 'P', '' ], [ 'J', 'P', '' ] ],
  },
];

async function infer() {
  inferring.value = true;
  try {
    const validated = await refDichotomyAnswersForm.value.validate();
    if (validated) {
      const dichotomyAnswersToSave = { ...dichotomyAnswers.value };

      const response = await inferDichotomyAnswer(dichotomyAnswersToSave);
      dichotomyAnswers.value = response.dichotomy_answer;
      dichotomyAnswersPersonalitiesResult.value = response.personalities || [];

      Notify.create({
        message: t('inferred_strategy'),
        type: 'positive',
      });

      setTimeout(() => {
        refResults.value?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  } catch (error) {
    Notify.create({
      message: formatResponseError(error) || t('failed_to_infer'),
      type: 'negative',
    });
  }
  inferring.value = false;
}

function reset() {
  dichotomyAnswers.value = {
    dichotomy_ei: [ null, null, null, null ],
    dichotomy_sn: [ null, null, null, null ],
    dichotomy_tf: [ null, null, null, null ],
    dichotomy_jp: [ null, null, null, null ],
  };

  dichotomyAnswersPersonalitiesResult.value = null;

  setTimeout(() => {
    refTop.value?.scrollIntoView({ behavior: 'smooth' });
  }, 200);
}

function getAnswerLabelToTranslate(category, value) {
  let valueLabel = value;

  if (0 === value.length) {
    valueLabel = 'none';
  }

  if (2 === value.length) {
    valueLabel = 'both';
  }

  return `category_${category}_answer_${valueLabel}`;
}
</script>
