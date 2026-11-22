<!--src/views/stock-adjustments/components/StockAdjustmentFooter.vue-->
<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 text-right font-sans transition-colors duration-200 items-stretch"
    dir="rtl"
  >
    <!-- 1. العمود الأيمن: ملاحظات وبيان التسوية الجردية - قابلة للطي -->
    <div
      class="lg:col-span-3 p-3.5 bg-surface-section rounded-xl border border-surface-border shadow-xs flex flex-col justify-between transition-all duration-200"
    >
      <div>
        <div
          class="flex items-center justify-between border-b border-surface-border/80 pb-1.5 cursor-pointer select-none"
          @click="isNotesOpen = !isNotesOpen"
        >
          <div class="flex items-center gap-1.5">
            <label class="text-[11px] font-black text-text-primary cursor-pointer">
              ملاحظات وبيان التسوية
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
            placeholder="سجل أسباب الفروقات الجردية أو تفاصيل تسوية المستودع الحالية..."
            class="block w-full min-h-[72px] p-2.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary placeholder:text-text-muted text-xs font-semibold focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
          ></textarea>
        </div>
      </div>

      <p class="text-[10px] text-text-muted leading-relaxed pt-2">
        تُوثّق الملاحظات في سجل الدورة الجردية للرجوع إليها عند التدقيق.
      </p>
    </div>

    <!-- 2. العمود الأوسط: تفاصيل الفحص وفروقات الكميات -->
    <div
      class="lg:col-span-4 p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs flex flex-col justify-between space-y-3"
    >
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-surface-border/80 pb-2">
          <h3 class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>تفاصيل الفحص الجردي</span>
          </h3>
          <span
            class="font-mono font-bold text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/25"
          >
            {{ totalItems }} أصناف
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div class="flex flex-col space-y-1">
            <label class="text-[10px] font-black text-danger">إجمالي قيمة العجز (-)</label>
            <div
              class="h-9 px-2.5 border border-danger/35 rounded-xl bg-danger/10 font-mono font-black text-xs text-danger flex items-center justify-end shadow-2xs"
            >
              {{ formatCurrency(totalShortage) }}
            </div>
          </div>

          <div class="flex flex-col space-y-1">
            <label class="text-[10px] font-black text-success">إجمالي قيمة الفائض (+)</label>
            <div
              class="h-9 px-2.5 border border-success/35 rounded-xl bg-success/10 font-mono font-black text-xs text-success flex items-center justify-end shadow-2xs"
            >
              {{ formatCurrency(totalSurplus) }}
            </div>
          </div>
        </div>
      </div>

      <p class="text-[10px] text-text-muted leading-relaxed">
        تُحتسب قيم العجز والفائض آلياً وفق تكلفة الوحدة المسجلة لكل صنف.
      </p>
    </div>

    <!-- 3. العمود الأيسر: الأثر المالي الإجمالي (نهاية مسار العين وفوق زر الترحيل مباشرة) -->
    <div
      class="lg:col-span-5 p-4 bg-surface-section rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs flex flex-col justify-between space-y-3 transition-colors duration-200"
    >
      <div class="space-y-2 text-xs font-semibold text-text-secondary">
        <div class="flex items-center justify-between border-b border-surface-border/80 pb-2">
          <h3 class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>الأثر المالي الإجمالي</span>
          </h3>
          <span class="text-[10px] font-bold text-text-muted">ملخص التسوية</span>
        </div>

        <div
          class="flex justify-between items-center border-b border-surface-border/50 pb-1.5 text-danger"
        >
          <span>خسائر عجز المخزون الحالية (-):</span>
          <span class="font-mono font-bold">{{ formatCurrency(totalShortage) }}</span>
        </div>

        <div
          class="flex justify-between items-center border-b border-surface-border/50 pb-1.5 text-success"
        >
          <span>أرباح فائض المخزون الحالية (+):</span>
          <span class="font-mono font-bold">{{ formatCurrency(totalSurplus) }}</span>
        </div>
      </div>

      <div class="space-y-2 pt-0.5">
        <!-- صندوق صافي تأثير التسوية المالي بسطر واحد واضح وعريض -->
        <div
          class="flex justify-between items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-200 shadow-2xs"
          :class="netImpactClass"
        >
          <span class="font-black text-xs whitespace-nowrap">صافي تأثير التسوية المالي:</span>
          <span class="text-xl sm:text-2xl font-mono font-black tracking-tight whitespace-nowrap">
            {{ formatCurrency(netImpact) }}
          </span>
        </div>

        <p v-if="getFieldError('items')" class="text-danger text-[10px] text-center font-bold mt-1">
          {{ getFieldError('items') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const notesModel = defineModel('notes', { type: String, default: '' })

const props = defineProps({
  totalItems: { type: Number, default: 0 },
  totalShortage: { type: Number, default: 0 },
  totalSurplus: { type: Number, default: 0 },
  validationErrors: { type: Object, default: () => null },
})

const isNotesOpen = ref(false)

const hasNotes = computed(() => {
  return typeof notesModel.value === 'string' && notesModel.value.trim().length > 0
})

watch(
  () => props.validationErrors?.notes,
  (notesErr) => {
    if (notesErr) {
      isNotesOpen.value = true
    }
  },
)

const netImpact = computed(() => {
  return props.totalSurplus - props.totalShortage
})

const netImpactClass = computed(() => {
  if (netImpact.value > 0) {
    return 'bg-success/10 border-success/35 text-success'
  } else if (netImpact.value < 0) {
    return 'bg-danger/10 border-danger/35 text-danger'
  }
  return 'bg-primary/10 border-primary/35 text-primary'
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
