<!-- src/views/pricing/components/BulkRepriceFilter.vue -->
<template>
  <AppCard class="mb-6">
    <form @submit.prevent="handlePreviewSubmit" class="space-y-4 text-right" dir="rtl">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        <!-- 1. اختيار التصنيف المجموعي -->
        <div>
          <AppDropdown
            id="reprice-category"
            label="التصنيف المجموعي"
            v-model="form.category_id"
            :options="categoryOptions"
            placeholder="جميع التصنيفات (عام)"
            :show-clear="true"
            @change="clearBackendError('category_id')"
          />
          <div v-if="validationErrors?.category_id">
            <p
              v-for="(error, index) in validationErrors.category_id"
              :key="index"
              class="text-danger text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- 2. معيار إعادة التسعير -->
        <div>
          <AppDropdown
            id="reprice-criterion"
            label="معيار إعادة التسعير *"
            v-model="form.criterion_type"
            :options="criterionOptions"
            placeholder="اختر معيار التسعير..."
            :show-clear="false"
            required
            @change="handleCriterionChange"
          />
          <div v-if="validationErrors?.criterion_type">
            <p
              v-for="(error, index) in validationErrors.criterion_type"
              :key="index"
              class="text-danger text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- 3. الحقول الشرطية بناءً على معيار التسعير -->
        <!-- أ. في حال اختيار سعر الصرف: قائمة العملات -->
        <div v-if="form.criterion_type === 'exchange_rate'">
          <AppDropdown
            id="reprice-currency"
            label="عملة التسعير المرجعية *"
            v-model="form.currency_id"
            :options="currencyOptions"
            placeholder="اختر العملة..."
            :show-clear="false"
            required
            @change="onCurrencySelected"
          />
          <div v-if="validationErrors?.currency_id">
            <p
              v-for="(error, index) in validationErrors.currency_id"
              :key="index"
              class="text-danger text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- ب. في حال اختيار سعر الصرف: حقل إدخال سعر الصرف -->
        <div v-if="form.criterion_type === 'exchange_rate'">
          <AppCurrencyInput
            id="reprice-exchange-rate"
            label="سعر الصرف المعتمد *"
            v-model="form.exchange_rate"
            placeholder="0.00"
            :precision="4"
            required
            @update:model-value="clearBackendError('exchange_rate')"
          />
          <div v-if="validationErrors?.exchange_rate">
            <p
              v-for="(error, index) in validationErrors.exchange_rate"
              :key="index"
              class="text-danger text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- ج. في حال اختيار النسبة المئوية: نسبة تضخم التكلفة -->
        <div v-if="form.criterion_type === 'percentage'">
          <AppInput
            id="reprice-percentage"
            type="number"
            step="0.01"
            label="نسبة تضخم / تعديل التكلفة (%) *"
            v-model="form.percentage"
            placeholder="مثال: 15 لزيادة التكلفة أو -5 للخصم"
            required
            @input="clearBackendError('percentage')"
          />
          <div v-if="validationErrors?.percentage">
            <p
              v-for="(error, index) in validationErrors.percentage"
              :key="index"
              class="text-danger text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- د. هامش الربح المخصص (اختياري لسعر الصرف وتضخم التكلفة) -->
        <div v-if="form.criterion_type === 'exchange_rate' || form.criterion_type === 'percentage'">
          <AppInput
            id="reprice-profit-margin"
            type="number"
            step="0.1"
            min="0"
            label="هامش ربح مخصص (%) (اختياري)"
            v-model="form.profit_margin"
            placeholder="افتراضي: هامش كل صنف"
            @input="clearBackendError('profit_margin')"
          />
          <div v-if="validationErrors?.profit_margin">
            <p
              v-for="(error, index) in validationErrors.profit_margin"
              :key="index"
              class="text-danger text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- هـ. في حال اختيار هامش الربح المستهدف المباشر -->
        <div v-if="form.criterion_type === 'target_margin'">
          <AppInput
            id="reprice-target-margin"
            type="number"
            step="0.1"
            min="0"
            max="100"
            label="هامش الربح المستهدف (%) *"
            v-model="form.target_margin"
            placeholder="مثال: 25 %"
            required
            @input="clearBackendError('target_margin')"
          />
          <div v-if="validationErrors?.target_margin">
            <p
              v-for="(error, index) in validationErrors.target_margin"
              :key="index"
              class="text-danger text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- 4. قاعدة التقريب الذكي -->
        <div>
          <AppDropdown
            id="reprice-rounding"
            label="قاعدة التقريب *"
            v-model="form.rounding_rule"
            :options="roundingOptions"
            placeholder="اختر قاعدة التقريب..."
            :show-clear="false"
            required
            @change="clearBackendError('rounding_rule')"
          />
          <div v-if="validationErrors?.rounding_rule">
            <p
              v-for="(error, index) in validationErrors.rounding_rule"
              :key="index"
              class="text-danger text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- أزرار الإجراءات -->
      <div class="flex justify-end items-center pt-3 border-t border-surface-border gap-3">
        <AppButton type="button" variant="secondary" @click="resetFilters" :disabled="isLoading">
          إعادة ضبط
        </AppButton>

        <AppButton type="submit" :disabled="isLoading" class="flex items-center gap-2">
          <svg
            v-if="isLoading"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{{ isLoading ? 'جاري احتساب الأسعار...' : 'معاينة الأسعار المقترحة' }}</span>
        </AppButton>
      </div>
    </form>
  </AppCard>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  currencies: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  validationErrors: { type: Object, default: null },
})

const emit = defineEmits(['preview', 'reset'])

const criterionOptions = [
  { id: 'exchange_rate', name: 'تحديث بناءً على سعر الصرف' },
  { id: 'percentage', name: 'تعديل تكلفة بنسبة تضخم (+/-)' },
  { id: 'target_margin', name: 'تطبيق هامش ربح مستهدف (%)' },
]

const roundingOptions = [
  { id: 'none', name: 'بدون تقريب (القيمة الفعلية)' },
  { id: 'nearest_50', name: 'لأقرب 50 وحدة نقدية' },
  { id: 'nearest_100', name: 'لأقرب 100 وحدة نقدية' },
  { id: 'nearest_500', name: 'لأقرب 500 وحدة نقدية' },
  { id: 'psychological_90', name: 'تسعير نفسي (ينتهي بـ .90)' },
  { id: 'psychological_900', name: 'تسعير نفسي (ينتهي بـ .900)' },
]

const defaultForm = () => ({
  category_id: null,
  criterion_type: 'exchange_rate',
  currency_id: null,
  exchange_rate: '',
  percentage: '',
  profit_margin: '',
  target_margin: '',
  rounding_rule: 'none',
})

const form = ref(defaultForm())

const categoryOptions = computed(() => {
  return props.categories.map((c) => ({
    id: c.id,
    name: c.full_path || c.name,
  }))
})

const currencyOptions = computed(() => {
  return props.currencies.map((curr) => ({
    id: curr.id,
    name: `${curr.name} (${curr.code})`,
  }))
})

const onCurrencySelected = (currencyId) => {
  clearBackendError('currency_id')
  const selected = props.currencies.find((c) => c.id === currencyId)
  if (selected && selected.latest_exchange_rate) {
    form.value.exchange_rate = selected.latest_exchange_rate.rate
  }
}

const handleCriterionChange = (newType) => {
  clearBackendError('criterion_type')
  if (newType === 'exchange_rate' && !form.value.currency_id && props.currencies.length > 0) {
    const nonDefault = props.currencies.find((c) => !c.is_default) || props.currencies[0]
    if (nonDefault) {
      form.value.currency_id = nonDefault.id
      onCurrencySelected(nonDefault.id)
    }
  }
}

const clearBackendError = (field) => {
  if (props.validationErrors && props.validationErrors[field]) {
    delete props.validationErrors[field]
  }
}

const handlePreviewSubmit = () => {
  const payload = {
    category_id: form.value.category_id ? Number(form.value.category_id) : null,
    criterion_type: form.value.criterion_type,
    rounding_rule: form.value.rounding_rule,
  }

  if (form.value.criterion_type === 'exchange_rate') {
    payload.currency_id = form.value.currency_id ? Number(form.value.currency_id) : null
    payload.exchange_rate = form.value.exchange_rate ? Number(form.value.exchange_rate) : null
    if (form.value.profit_margin !== '') {
      payload.profit_margin = Number(form.value.profit_margin)
    }
  } else if (form.value.criterion_type === 'percentage') {
    payload.percentage = form.value.percentage !== '' ? Number(form.value.percentage) : null
    if (form.value.profit_margin !== '') {
      payload.profit_margin = Number(form.value.profit_margin)
    }
  } else if (form.value.criterion_type === 'target_margin') {
    payload.target_margin =
      form.value.target_margin !== '' ? Number(form.value.target_margin) : null
  }

  emit('preview', payload)
}

const resetFilters = () => {
  form.value = defaultForm()
  emit('reset')
}

watch(
  () => props.currencies,
  (newCurrencies) => {
    if (
      newCurrencies.length > 0 &&
      !form.value.currency_id &&
      form.value.criterion_type === 'exchange_rate'
    ) {
      const foreign = newCurrencies.find((c) => !c.is_default) || newCurrencies[0]
      if (foreign) {
        form.value.currency_id = foreign.id
        onCurrencySelected(foreign.id)
      }
    }
  },
  { immediate: true },
)
</script>
