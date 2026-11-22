<!--src/views/purchases/components/PurchaseFooter.vue-->
<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 text-right font-sans transition-colors duration-200 items-stretch"
    dir="rtl"
  >
    <!-- 1. العمود الأيمن: إضافات مالية (الخصم والضريبة) - قابلة للطي -->
    <div
      class="lg:col-span-3 p-3.5 bg-surface-section rounded-xl border border-surface-border shadow-xs flex flex-col justify-between transition-all duration-200"
    >
      <div>
        <div
          class="flex items-center justify-between border-b border-surface-border/80 pb-1.5 cursor-pointer select-none"
          @click="isAdjustmentsOpen = !isAdjustmentsOpen"
        >
          <div class="flex items-center gap-1.5">
            <h3 class="text-[11px] font-black text-text-primary">إضافات مالية</h3>
            <span
              v-if="hasAdjustments"
              class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-primary/10 text-primary border border-primary/25"
            >
              مطبقة
            </span>
          </div>

          <div class="flex items-center gap-1 text-text-muted hover:text-primary transition-colors">
            <span class="text-[10px] font-bold">{{ isAdjustmentsOpen ? 'طي' : 'توسيع' }}</span>
            <svg
              class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ 'rotate-180': isAdjustmentsOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <!-- ملخص سريع يظهر أثناء الطي -->
        <div
          v-if="!isAdjustmentsOpen"
          class="pt-2 text-xs flex justify-between items-center text-text-muted cursor-pointer"
          @click="isAdjustmentsOpen = true"
        >
          <div v-if="hasAdjustments" class="flex flex-wrap gap-2 font-mono font-bold text-[11px]">
            <span v-if="discountModel > 0" class="text-danger">
              خصم: {{ formatCurrency(discountModel) }}
            </span>
            <span v-if="taxModel > 0" class="text-info">
              ضريبة: {{ formatCurrency(taxModel) }}
            </span>
          </div>
          <span v-else class="text-[10px]">لا توجد إضافات مالية (انقر للتعديل)</span>
        </div>

        <!-- حقول الإدخال تظهر عند التوسيع -->
        <div v-show="isAdjustmentsOpen" class="space-y-2.5 pt-2.5 transition-all">
          <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-col space-y-1">
              <label class="text-[10px] font-bold text-text-secondary truncate"
                >الخصم العام (مبلغ)</label
              >
              <div
                class="relative w-full h-8 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              >
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  v-model.number="discountModel"
                  class="block w-full h-full px-2 bg-transparent text-danger font-mono text-left font-bold text-xs focus:outline-none"
                />
              </div>
              <p
                v-if="getFieldError('discount_amount')"
                class="text-danger text-[10px] font-bold mt-0.5"
              >
                {{ getFieldError('discount_amount') }}
              </p>
            </div>

            <div class="flex flex-col space-y-1">
              <label class="text-[10px] font-bold text-text-secondary truncate"
                >إجمالي الضريبة</label
              >
              <div
                class="relative w-full h-8 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              >
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  v-model.number="taxModel"
                  class="block w-full h-full px-2 bg-transparent text-info font-mono text-left font-bold text-xs focus:outline-none"
                />
              </div>
              <p
                v-if="getFieldError('tax_amount')"
                class="text-danger text-[10px] font-bold mt-0.5"
              >
                {{ getFieldError('tax_amount') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p class="text-[10px] text-text-muted leading-relaxed pt-2">
        الخصومات والضرائب تنعكس مباشرة على صافي الفاتورة.
      </p>
    </div>

    <!-- 2. العمود الأوسط: ملاحظات وشروط التوريد - قابلة للطي -->
    <div
      class="lg:col-span-4 p-3.5 bg-surface-section rounded-xl border border-surface-border shadow-xs flex flex-col justify-between transition-all duration-200"
    >
      <div>
        <div
          class="flex items-center justify-between border-b border-surface-border/80 pb-1.5 cursor-pointer select-none"
          @click="isNotesOpen = !isNotesOpen"
        >
          <div class="flex items-center gap-1.5">
            <label class="text-[11px] font-black text-text-primary cursor-pointer">
              ملاحظات وشروط التوريد
            </label>
            <span
              v-if="hasNotes"
              class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-info/10 text-info border border-info/25"
            >
              مسجلة
            </span>
          </div>

          <div class="flex items-center gap-1 text-text-muted hover:text-primary transition-colors">
            <span class="text-[10px] font-bold">{{ isNotesOpen ? 'طي' : 'توسيع' }}</span>
            <svg
              class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ 'rotate-180': isNotesOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <!-- معاينة سريعة أثناء الطي -->
        <div
          v-if="!isNotesOpen"
          class="pt-2 text-[10px] text-text-muted cursor-pointer truncate"
          @click="isNotesOpen = true"
        >
          <span v-if="hasNotes" class="text-text-secondary font-semibold">{{ notesModel }}</span>
          <span v-else>لا توجد ملاحظات (انقر للكتابة)...</span>
        </div>

        <!-- حقل النص عند التوسيع -->
        <div v-show="isNotesOpen" class="pt-2 flex flex-col space-y-1.5 transition-all">
          <textarea
            v-model="notesModel"
            rows="2"
            placeholder="سجل أي اعتبارات، أو شروط تسليم خاصة بحركة المشتريات الحالية..."
            class="block w-full min-h-[72px] p-2.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary placeholder:text-text-muted text-xs font-semibold focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
          ></textarea>
        </div>
      </div>

      <p class="text-[10px] text-text-muted leading-relaxed pt-2">
        تُحفظ الملاحظات ضمن أرشيف مستند التوريد للرجوع إليها لاحقاً.
      </p>
    </div>

    <!-- 3. العمود الأيسر: الإجماليات النهائية (نهاية مسار العين وفوق زر الحفظ مباشرة) -->
    <div
      class="lg:col-span-5 p-4 bg-surface-section rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs flex flex-col justify-between space-y-3 transition-colors duration-200"
    >
      <div class="space-y-2 text-xs font-semibold text-text-secondary">
        <div class="flex items-center justify-between border-b border-surface-border/80 pb-2">
          <h3 class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>الإجماليات النهائية</span>
          </h3>
          <span class="text-[10px] font-bold text-text-muted">ملخص الفاتورة</span>
        </div>

        <div class="flex justify-between items-center border-b border-surface-border/50 pb-1.5">
          <span>الإجمالي قبل الخصم والضريبة:</span>
          <span class="font-mono font-bold text-text-primary">{{ formatCurrency(subtotal) }}</span>
        </div>

        <div
          class="flex justify-between items-center border-b border-surface-border/50 pb-1.5"
          :class="Number(discountModel) > 0 ? 'text-danger' : 'text-text-muted'"
        >
          <span>إجمالي الخصم المكتسب (-):</span>
          <span class="font-mono font-bold">{{ formatCurrency(discountModel || 0) }}</span>
        </div>

        <div
          v-if="Number(taxModel) > 0"
          class="flex justify-between items-center border-b border-surface-border/50 pb-1.5 text-info"
        >
          <span>إجمالي الضريبة المضافة (+):</span>
          <span class="font-mono font-bold">{{ formatCurrency(taxModel || 0) }}</span>
        </div>
      </div>

      <div class="space-y-2 pt-0.5">
        <!-- صندوق الصافي النهائي الفعلي بسطر واحد واضح وعريض -->
        <div
          class="flex justify-between items-center gap-3 bg-primary/10 border border-primary/35 px-3.5 py-2.5 rounded-xl text-primary shadow-2xs"
        >
          <span class="font-black text-xs whitespace-nowrap">الصافي النهائي الفعلي:</span>
          <span class="text-xl sm:text-2xl font-mono font-black tracking-tight whitespace-nowrap">
            {{ formatCurrency(grandTotal) }}
          </span>
        </div>

        <p
          v-if="getFieldError('grand_total')"
          class="text-danger text-[10px] text-center font-bold mt-1"
        >
          {{ getFieldError('grand_total') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const notesModel = defineModel('notes', { type: String, default: '' })
const discountModel = defineModel('discountAmount', { type: Number, default: 0 })
const taxModel = defineModel('taxAmount', { type: Number, default: 0 })

const props = defineProps({
  subtotal: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  validationErrors: { type: Object, default: () => null },
})

// حالات الطي للبطاقتين (افتراضياً مغلقتان في مكانهما)
const isAdjustmentsOpen = ref(false)
const isNotesOpen = ref(false)

const hasAdjustments = computed(() => {
  return Number(discountModel.value) > 0 || Number(taxModel.value) > 0
})

const hasNotes = computed(() => {
  return typeof notesModel.value === 'string' && notesModel.value.trim().length > 0
})

// فتح قسم الإضافات المالية أو الملاحظات تلقائياً عند حدوث أخطاء تحقق
watch(
  () => [
    props.validationErrors?.discount_amount,
    props.validationErrors?.tax_amount,
    props.validationErrors?.notes,
  ],
  ([discountErr, taxErr, notesErr]) => {
    if (discountErr || taxErr) {
      isAdjustmentsOpen.value = true
    }
    if (notesErr) {
      isNotesOpen.value = true
    }
  },
)

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
