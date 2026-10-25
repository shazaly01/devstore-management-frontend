<!-- src/views/pricing/components/RollbackModal.vue -->
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
          class="bg-surface-section rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-surface-border transform text-right font-sans"
          role="dialog"
          aria-modal="true"
          dir="rtl"
        >
          <!-- رأس النافذة المنبثقة -->
          <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-4">
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-lg bg-danger/10 text-danger border border-danger/20 flex items-center justify-center shrink-0"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-text-primary">التراجع عن مجموعة التسعير</h3>
                <p class="text-xs text-text-muted mt-0.5">
                  إلغاء واعتماد الأسعار والتكاليف السابقة لكافة أصناف هذه المجموعة
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

          <!-- بطاقة ملخص بيانات المجموعة المراد إلغاؤها -->
          <div
            v-if="batchData"
            class="p-3.5 bg-surface-ground border border-surface-border rounded-xl space-y-2 mb-4 text-xs"
          >
            <div class="flex justify-between items-center">
              <span class="text-text-muted">كود المجموعة:</span>
              <span class="font-mono font-bold text-primary">{{
                batchData.batch_code || '-'
              }}</span>
            </div>
            <div class="flex justify-between items-center" v-if="batchData.currency_code">
              <span class="text-text-muted">سعر الصرف المعتمد:</span>
              <span class="font-mono font-bold text-success">
                {{ formatNumber(batchData.exchange_rate) }} ({{ batchData.currency_code }})
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-text-muted">حجم الأصناف والوحدات:</span>
              <span class="font-mono font-semibold text-text-primary"
                >{{ batchData.items_count }} وحدة</span
              >
            </div>
            <div class="flex justify-between items-center">
              <span class="text-text-muted">تاريخ التنفيذ:</span>
              <span class="font-mono text-text-muted">{{ batchData.created_at || '-' }}</span>
            </div>
          </div>

          <!-- نموذج التراجع -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- تنبيه تحذيري -->
            <div
              class="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs leading-relaxed"
            >
              <span class="font-bold">تنبيه أمان:</span> سيقوم هذا الإجراء باسترجاع الأسعار
              والتكاليف السابقة تلقائياً لجميع الأصناف التابعة لهذه المجموعة وإغلاقها كدفعة تم
              التراجع عنها.
            </div>

            <div>
              <label
                for="rollback-notes"
                class="block text-xs font-semibold text-text-secondary mb-1"
              >
                سبب التراجع / الملاحظات
              </label>
              <textarea
                id="rollback-notes"
                rows="3"
                v-model="form.notes"
                placeholder="اكتب سبب إلغاء هذه المجموعة (مثال: تصحيح خطأ بسعر صرف العملة)..."
                class="block w-full rounded-xl py-2 px-3 transition-all duration-200 text-xs focus:outline-none bg-surface-ground border border-surface-border text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-danger/20 focus:border-danger resize-none"
              ></textarea>
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

            <!-- أزرار التحكم -->
            <div
              class="mt-6 flex justify-end items-center gap-3 pt-4 border-t border-surface-border"
            >
              <AppButton type="button" variant="secondary" @click="close" :disabled="isSaving">
                إلغاء
              </AppButton>
              <AppButton
                type="submit"
                variant="danger"
                :disabled="isSaving || (!form.main_id && !form.batch_code)"
              >
                <span v-if="isSaving">جاري استرجاع الأسعار...</span>
                <span v-else>تأكيد التراجع الآن</span>
              </AppButton>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  batchData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  validationErrors: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'rollback'])

const form = ref({
  main_id: null,
  batch_code: '',
  notes: '',
})

watch(
  () => props.batchData,
  (newVal) => {
    if (newVal && typeof newVal === 'object') {
      form.value.main_id = newVal.id || null
      form.value.batch_code = newVal.batch_code || ''
    } else if (typeof newVal === 'string') {
      form.value.batch_code = newVal
      form.value.main_id = null
    } else {
      form.value.main_id = null
      form.value.batch_code = ''
    }
    form.value.notes = ''
  },
  { immediate: true },
)

const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00'
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  if (!form.value.main_id && !form.value.batch_code) return
  emit('rollback', {
    main_id: form.value.main_id,
    batch_code: form.value.batch_code,
    notes: form.value.notes ? form.value.notes.trim() : null,
  })
}
</script>
