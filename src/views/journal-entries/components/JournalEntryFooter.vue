<!--src/views/journal-entries/JournalEntryFooter.vue-->
<template>
  <div
    class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-start text-right transition-all duration-200"
    dir="rtl"
  >
    <!-- البيان والملاحظات -->
    <div class="flex flex-col space-y-1.5 md:col-span-1">
      <label class="text-[11px] font-black text-text-secondary">البيان / الملاحظات العامة</label>
      <textarea
        v-model="notesModel"
        rows="3"
        placeholder="اكتب بياناً شاملاً يوضح طبيعة وأسباب هذا القيد المالي..."
        class="block w-full p-2.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary placeholder:text-text-muted text-xs font-semibold focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
      ></textarea>
      <p v-if="getFieldError('notes')" class="text-danger text-[10px] font-bold mt-0.5">
        {{ getFieldError('notes') }}
      </p>
    </div>

    <!-- بطاقات إجمالي المدين والدائن -->
    <div
      class="p-3 bg-surface-ground rounded-xl border border-surface-border grid grid-cols-2 gap-3 md:col-span-1 font-semibold text-xs"
    >
      <div
        class="flex flex-col space-y-1 bg-surface-section p-2.5 rounded-lg border border-surface-border text-center shadow-sm"
      >
        <span class="text-[10px] font-black text-text-secondary">إجمالي المدين</span>
        <span class="font-mono text-sm font-black text-primary mt-1">
          {{ formatCurrency(totalDebit) }}
        </span>
      </div>

      <div
        class="flex flex-col space-y-1 bg-surface-section p-2.5 rounded-lg border border-surface-border text-center shadow-sm"
      >
        <span class="text-[10px] font-black text-text-secondary">إجمالي الدائن</span>
        <span class="font-mono text-sm font-black text-success mt-1">
          {{ formatCurrency(totalCredit) }}
        </span>
      </div>

      <p
        v-if="getFieldError('lines')"
        class="text-danger text-[10px] font-bold text-center col-span-2 mt-0.5"
      >
        {{ getFieldError('lines') }}
      </p>
    </div>

    <!-- موازنة السند والفارق -->
    <div
      class="p-3 bg-surface-ground rounded-xl border border-surface-border space-y-2 md:col-span-1 font-semibold text-xs h-full flex flex-col justify-between"
    >
      <div
        class="flex justify-between items-center text-text-secondary pb-1.5 border-b border-surface-border/60"
      >
        <span>فارق الاتزان الحسابي:</span>
        <span
          class="font-mono font-bold text-sm"
          :class="isBalanced ? 'text-success' : 'text-danger'"
        >
          {{ formatCurrency(Math.abs(totalDebit - totalCredit)) }}
        </span>
      </div>

      <!-- متزن -->
      <div
        v-if="isBalanced"
        class="flex justify-between items-center bg-success/10 border border-success/30 p-2 rounded-lg text-success shadow-sm"
      >
        <span class="font-black text-[11px]">حالة موازنة السند:</span>
        <span class="text-xs font-black tracking-wide flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          قيد متزن محاسبياً
        </span>
      </div>

      <!-- غير متزن -->
      <div
        v-else
        class="flex justify-between items-center bg-danger/10 border border-danger/30 p-2 rounded-lg text-danger shadow-sm"
      >
        <span class="font-black text-[11px]">حالة موازنة السند:</span>
        <span class="text-xs font-black tracking-wide flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-danger animate-bounce"></span>
          غير متزن (يوجد فارق)
        </span>
      </div>

      <p v-if="getFieldError('balance')" class="text-danger text-[10px] text-center font-bold mt-1">
        {{ getFieldError('balance') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const notesModel = defineModel('notes', { type: String, default: '' })

const props = defineProps({
  totalDebit: { type: Number, default: 0 },
  totalCredit: { type: Number, default: 0 },
  validationErrors: { type: Object, default: () => null },
})

const isBalanced = computed(() => {
  return Math.abs(props.totalDebit - props.totalCredit) < 0.01
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
