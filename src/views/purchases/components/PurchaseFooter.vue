<!--src/views/purchases/components/PurchaseFooter.vue-->
<template>
  <div
    class="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- 1. الإجماليات النهائية -->
    <div
      class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2 text-xs font-semibold text-text-secondary">
        <h3 class="text-[11px] font-black text-text-primary border-b border-surface-border pb-1.5">
          الإجماليات النهائية
        </h3>

        <div class="flex justify-between border-b border-surface-border/60 pb-1.5">
          <span>الإجمالي قبل المشتريات:</span>
          <span class="font-mono font-bold text-text-primary">{{ formatCurrency(subtotal) }}</span>
        </div>

        <div class="flex justify-between border-b border-surface-border/60 pb-1.5 text-danger">
          <span>إجمالي الخصم المكتسب (-):</span>
          <span class="font-mono font-bold">{{ formatCurrency(discountModel || 0) }}</span>
        </div>

        <div class="flex justify-between border-b border-surface-border/60 pb-1.5 text-info">
          <span>إجمالي الضريبة المضافة (+):</span>
          <span class="font-mono font-bold">{{ formatCurrency(taxModel || 0) }}</span>
        </div>
      </div>

      <div class="pt-2">
        <div
          class="flex justify-between items-center bg-primary/10 border border-primary/30 p-2.5 rounded-lg text-primary shadow-sm"
        >
          <span class="font-black text-[11px]">الصافي النهائي الفعلي:</span>
          <span class="text-xl font-mono font-black tracking-wide">
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

    <!-- 2. إضافات مالية (الخصم والضريبة) -->
    <div class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm space-y-4">
      <h3 class="text-[11px] font-black text-text-primary border-b border-surface-border pb-1.5">
        إضافات مالية
      </h3>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col space-y-1.5">
          <label class="text-[10px] font-bold text-text-secondary truncate"
            >الخصم العام (مبلغ)</label
          >
          <div
            class="relative w-full h-10 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
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

        <div class="flex flex-col space-y-1.5">
          <label class="text-[10px] font-bold text-text-secondary truncate"
            >إجمالي الضريبة المضافة</label
          >
          <div
            class="relative w-full h-10 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="taxModel"
              class="block w-full h-full px-2 bg-transparent text-info font-mono text-left font-bold text-xs focus:outline-none"
            />
          </div>
          <p v-if="getFieldError('tax_amount')" class="text-danger text-[10px] font-bold mt-0.5">
            {{ getFieldError('tax_amount') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 3. ملاحظات وشروط التوريد -->
    <div
      class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm flex flex-col space-y-1.5"
    >
      <label
        class="text-[11px] font-black text-text-primary border-b border-surface-border pb-1.5 mb-1"
      >
        ملاحظات وشروط التوريد
      </label>
      <textarea
        v-model="notesModel"
        rows="3"
        placeholder="سجل أي اعتبارات، أو شروط تسليم خاصة بحركة المشتريات الحالية..."
        class="block w-full h-full min-h-[96px] p-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary placeholder:text-text-muted text-xs font-semibold focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'

const notesModel = defineModel('notes', { type: String, default: '' })
const discountModel = defineModel('discountAmount', { type: Number, default: 0 })
const taxModel = defineModel('taxAmount', { type: Number, default: 0 })

const props = defineProps({
  subtotal: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  validationErrors: { type: Object, default: () => null },
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
