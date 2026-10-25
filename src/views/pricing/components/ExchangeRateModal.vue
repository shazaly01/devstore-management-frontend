<!-- src/views/pricing/components/ExchangeRateModal.vue -->
<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="close"
    >
      <Transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-surface-section rounded-xl shadow-2xl p-6 w-full max-w-lg border border-surface-border transform text-right font-sans"
          role="dialog"
          aria-modal="true"
          dir="rtl"
        >
          <!-- رأس النافذة -->
          <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0 border border-success/20"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-text-primary">تحديث سعر صرف العملة</h3>
                <p class="text-xs text-text-muted mt-0.5">
                  تسجيل سعر الصرف اليومي المرجعي لعمليات التسعير والتكاليف
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="close"
              class="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-ground transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- نموذج إدخال سعر الصرف -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <AppDropdown
                id="exchange-currency"
                label="العملة الأجنبية *"
                v-model="form.currency_id"
                :options="currencyOptions"
                placeholder="اختر العملة المراد تحديث صرفها..."
                :show-clear="false"
                required
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

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <AppCurrencyInput
                  id="exchange-rate-value"
                  label="سعر الصرف الجديد *"
                  v-model="form.rate"
                  placeholder="0.00"
                  :precision="4"
                  required
                />
                <div v-if="validationErrors?.rate">
                  <p
                    v-for="(error, index) in validationErrors.rate"
                    :key="index"
                    class="text-danger text-xs mt-1 font-bold"
                  >
                    {{ error }}
                  </p>
                </div>
              </div>

              <div>
                <AppInput
                  id="exchange-rate-date"
                  type="date"
                  label="تاريخ سريان الصرف *"
                  v-model="form.rate_date"
                  required
                />
                <div v-if="validationErrors?.rate_date">
                  <p
                    v-for="(error, index) in validationErrors.rate_date"
                    :key="index"
                    class="text-danger text-xs mt-1 font-bold"
                  >
                    {{ error }}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <AppInput
                id="exchange-notes"
                label="ملاحظات / المصدر"
                v-model="form.notes"
                placeholder="مثال: سعر إغلاق السوق الموازي أو البنك المركزي..."
              />
              <div v-if="validationErrors?.notes">
                <p
                  v-for="(error, index) in validationErrors.notes"
                  :key="index"
                  class="text-danger text-xs mt-1 font-bold"
                >
                  {{ error }}
                </p>
              </div>
            </div>

            <!-- أزرار الإجراءات -->
            <div
              class="mt-6 flex justify-end items-center gap-3 pt-4 border-t border-surface-border"
            >
              <AppButton type="button" variant="secondary" @click="close" :disabled="isSaving">
                إلغاء
              </AppButton>
              <AppButton type="submit" :disabled="isSaving" class="font-bold">
                <span v-if="isSaving">جاري الحفظ...</span>
                <span v-else>حفظ سعر الصرف</span>
              </AppButton>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  currencies: { type: Array, default: () => [] },
  isSaving: { type: Boolean, default: false },
  validationErrors: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'save'])

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

const form = ref({
  currency_id: null,
  rate: '',
  rate_date: getTodayDate(),
  notes: '',
})

const currencyOptions = computed(() => {
  return props.currencies
    .filter((c) => !c.is_default)
    .map((c) => ({
      id: c.id,
      name: `${c.name} (${c.code}) - الحالي: ${c.latest_exchange_rate?.rate || 'غير محدد'}`,
    }))
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      form.value = {
        currency_id: currencyOptions.value[0]?.id || null,
        rate: '',
        rate_date: getTodayDate(),
        notes: '',
      }
    }
  },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  if (!form.value.currency_id || !form.value.rate || !form.value.rate_date) return

  emit('save', {
    currency_id: Number(form.value.currency_id),
    rate: Number(form.value.rate),
    rate_date: form.value.rate_date,
    notes: form.value.notes ? form.value.notes.trim() : null,
  })
}
</script>
