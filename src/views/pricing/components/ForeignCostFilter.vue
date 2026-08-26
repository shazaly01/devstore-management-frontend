<!-- src/views/pricing/components/ForeignCostFilter.vue -->
<template>
  <AppCard class="mb-6">
    <form @submit.prevent="handlePreviewSubmit" class="p-5 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        <!-- 1. اختيار التصنيف المجموعي -->
        <div>
          <AppDropdown
            id="fc-category"
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
              class="text-rose-500 text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- 2. طريقة تأصيل واحتساب التكلفة الأجنبية -->
        <div>
          <AppDropdown
            id="fc-method"
            label="طريقة الاحتساب *"
            v-model="form.method"
            :options="methodOptions"
            placeholder="اختر طريقة الاحتساب..."
            :show-clear="false"
            required
            @change="handleMethodChange"
          />
          <div v-if="validationErrors?.method">
            <p
              v-for="(error, index) in validationErrors.method"
              :key="index"
              class="text-rose-500 text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- 3. العملة الأجنبية المستهدفة -->
        <div>
          <AppDropdown
            id="fc-currency"
            label="العملة الأجنبية المرجعية *"
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
              class="text-rose-500 text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- 4. سعر الصرف المرجعي للاحتساب -->
        <div>
          <AppInput
            id="fc-exchange-rate"
            type="number"
            step="0.0001"
            label="سعر الصرف المرجعي *"
            v-model="form.exchange_rate"
            placeholder="0.00"
            required
            @input="clearBackendError('exchange_rate')"
          />
          <div v-if="validationErrors?.exchange_rate">
            <p
              v-for="(error, index) in validationErrors.exchange_rate"
              :key="index"
              class="text-rose-500 text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- 5. الحقول الشرطية لطريقة الاحتساب -->
        <!-- أ. في حال الهندسة العكسية: هامش الربح المستهدف -->
        <div v-if="form.method === 'reverse_from_price_margin'">
          <AppInput
            id="fc-profit-margin"
            type="number"
            step="0.1"
            min="0"
            max="100"
            label="هامش الربح المعتمد (%)"
            v-model="form.profit_margin"
            placeholder="اتركه فارغاً لاستخدام هامش كل صنف"
            @input="clearBackendError('profit_margin')"
          />
          <div v-if="validationErrors?.profit_margin">
            <p
              v-for="(error, index) in validationErrors.profit_margin"
              :key="index"
              class="text-rose-500 text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>

        <!-- ب. في حال نسبة ثابتة من سعر البيع -->
        <div v-if="form.method === 'ratio_from_price'">
          <AppInput
            id="fc-margin-ratio"
            type="number"
            step="0.1"
            min="0"
            max="100"
            label="نسبة الخصم من سعر البيع (%) *"
            v-model="form.margin_ratio"
            placeholder="مثال: 20 (التكلفة = 80% من البيع)"
            required
            @input="clearBackendError('margin_ratio')"
          />
          <div v-if="validationErrors?.margin_ratio">
            <p
              v-for="(error, index) in validationErrors.margin_ratio"
              :key="index"
              class="text-rose-500 text-xs mt-1 font-bold"
            >
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- خيار حصر الأصناف التي ليس لها تكلفة أجنبية وأزرار الإجراءات -->
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-surface-border gap-4"
      >
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="form.only_missing"
            class="rounded border-surface-border text-primary focus:ring-primary w-4 h-4"
          />
          <span class="text-xs font-semibold text-text-primary">
            حصر الأصناف التي تفتقر لتكلفة أجنبية فقط (تخطي الأصناف المؤصلة مسبقاً)
          </span>
        </label>

        <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
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
            <span>{{ isLoading ? 'جاري التوليد والاحتساب...' : 'توليد ومطابقة التكاليف' }}</span>
          </AppButton>
        </div>
      </div>
    </form>
  </AppCard>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  currencies: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  validationErrors: { type: Object, default: null },
})

const emit = defineEmits(['preview', 'reset'])

const methodOptions = [
  { id: 'from_cost_rate', name: 'تحويل مباشر من التكلفة الحالية وسعر الصرف' },
  { id: 'reverse_from_price_margin', name: 'هندسة عكسية من سعر البيع وهامش الربح' },
  { id: 'ratio_from_price', name: 'تحديد كنسبة مئوية من سعر البيع' },
]

const defaultForm = () => ({
  category_id: null,
  method: 'from_cost_rate',
  currency_id: null,
  exchange_rate: '',
  profit_margin: '',
  margin_ratio: '20',
  only_missing: true,
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

const handleMethodChange = () => {
  clearBackendError('method')
}

const clearBackendError = (field) => {
  if (props.validationErrors && props.validationErrors[field]) {
    delete props.validationErrors[field]
  }
}

const handlePreviewSubmit = () => {
  const payload = {
    category_id: form.value.category_id ? Number(form.value.category_id) : null,
    method: form.value.method,
    currency_id: form.value.currency_id ? Number(form.value.currency_id) : null,
    exchange_rate: form.value.exchange_rate ? Number(form.value.exchange_rate) : null,
    only_missing: form.value.only_missing ? 1 : 0,
  }

  if (form.value.method === 'reverse_from_price_margin') {
    payload.profit_margin =
      form.value.profit_margin !== '' ? Number(form.value.profit_margin) : null
  } else if (form.value.method === 'ratio_from_price') {
    payload.margin_ratio = form.value.margin_ratio !== '' ? Number(form.value.margin_ratio) : null
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
    if (newCurrencies.length > 0 && !form.value.currency_id) {
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
