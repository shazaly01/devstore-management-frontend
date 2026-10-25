<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-right font-sans transition-colors duration-200"
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
          <span>الإجمالي قبل الخصم والضريبة:</span>
          <span class="font-mono font-bold text-text-primary">{{ formatCurrency(subtotal) }}</span>
        </div>

        <div class="flex justify-between border-b border-surface-border/60 pb-1.5 text-danger">
          <span>إجمالي الخصم الممنوح (-):</span>
          <span class="font-mono font-bold">{{ formatCurrency(discountModel || 0) }}</span>
        </div>

        <div class="flex justify-between border-b border-surface-border/60 pb-1.5 text-info">
          <span>إجمالي الضريبة المستحقة (+):</span>
          <span class="font-mono font-bold">{{ formatCurrency(taxModel || 0) }}</span>
        </div>
      </div>

      <div class="pt-2 space-y-2">
        <div
          class="flex justify-between items-center bg-primary/10 border border-primary/30 p-2.5 rounded-lg text-primary shadow-sm"
        >
          <span class="font-black text-[11px]">الإجمالي النهائي الفعلي:</span>
          <span class="text-xl font-mono font-black tracking-wide">
            {{ formatCurrency(grandTotal) }}
          </span>
        </div>

        <div v-if="invoiceType !== 'return'" class="flex justify-between items-center px-1 text-xs">
          <span class="text-text-secondary font-bold">المدفوع:</span>
          <span class="font-mono font-black text-text-primary">{{
            formatCurrency(paidAmount)
          }}</span>
        </div>
        <div v-if="invoiceType !== 'return'" class="flex justify-between items-center px-1 text-xs">
          <span class="text-text-secondary font-bold">المتبقي على حساب العميل:</span>
          <span class="font-mono font-black text-warning">{{
            formatCurrency(remainingAmount)
          }}</span>
        </div>

        <p
          v-if="getFieldError('grand_total')"
          class="text-danger text-[10px] text-center font-bold mt-1"
        >
          {{ getFieldError('grand_total') }}
        </p>
      </div>
    </div>

    <!-- 2. توزيع السداد -->
    <div
      v-if="invoiceType !== 'return'"
      class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm space-y-3"
    >
      <h3 class="text-[11px] font-black text-text-primary border-b border-surface-border pb-1.5">
        توزيع السداد
      </h3>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          :aria-pressed="paymentModeModel === 'bank'"
          :class="modeButtonClass('bank')"
          @click="selectPaymentMode('bank')"
        >
          كامل بنك
        </button>
        <button
          type="button"
          :aria-pressed="paymentModeModel === 'cash'"
          :class="modeButtonClass('cash')"
          @click="selectPaymentMode('cash')"
        >
          كامل نقداً
        </button>
        <button
          type="button"
          :aria-pressed="paymentModeModel === 'credit'"
          :class="modeButtonClass('credit')"
          @click="selectPaymentMode('credit')"
        >
          كامل آجل
        </button>
        <button
          type="button"
          :aria-pressed="paymentModeModel === 'split'"
          :class="modeButtonClass('split')"
          @click="selectPaymentMode('split')"
        >
          تقسيم
        </button>
      </div>

      <div v-if="paymentModeModel === 'split'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div class="flex flex-col space-y-1.5">
          <label for="sale-cash-amount" class="text-[10px] font-bold text-text-secondary">
            المبلغ النقدي
          </label>
          <div
            class="relative w-full h-10 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <AppCurrencyInput
              id="sale-cash-amount"
              v-model="cashAmountModel"
              :precision="2"
              variant="sales"
              input-class="h-10 !px-2 !text-left !font-mono !font-bold !text-xs"
              @focus="selectPaymentAmount"
              @click="selectPaymentAmount"
            />
          </div>
          <p v-if="getFieldError('cash_amount')" class="text-danger text-[10px] font-bold">
            {{ getFieldError('cash_amount') }}
          </p>
        </div>

        <div class="flex flex-col space-y-1.5">
          <label for="sale-bank-amount" class="text-[10px] font-bold text-text-secondary">
            المبلغ البنكي
          </label>
          <div
            class="relative w-full h-10 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <AppCurrencyInput
              id="sale-bank-amount"
              v-model="bankAmountModel"
              :precision="2"
              variant="sales"
              input-class="h-10 !px-2 !text-left !font-mono !font-bold !text-xs"
              @focus="selectPaymentAmount"
              @click="selectPaymentAmount"
            />
          </div>
          <p v-if="getFieldError('bank_amount')" class="text-danger text-[10px] font-bold">
            {{ getFieldError('bank_amount') }}
          </p>
        </div>
      </div>

      <p v-if="amountsExceedTotal" class="text-danger text-[10px] font-bold leading-relaxed">
        مجموع النقد والبنك أكبر من إجمالي الفاتورة.
      </p>
      <p v-else class="text-[10px] text-text-muted leading-relaxed">
        المتبقي يُسجَّل تلقائياً على حساب العميل.
      </p>
    </div>

    <!-- 3. التسويات المالية (الخصم والضريبة) -->
    <div class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm space-y-4">
      <h3 class="text-[11px] font-black text-text-primary border-b border-surface-border pb-1.5">
        إضافات وتسويات مالية
      </h3>

      <div class="flex flex-col space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col space-y-1.5">
            <label class="text-[10px] font-bold text-text-secondary truncate">الخصم الممنوح</label>
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
              >الضريبة المضافة</label
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
    </div>

    <!-- 4. ملاحظات وشروط الفاتورة -->
    <div
      class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm flex flex-col space-y-1.5"
    >
      <label
        class="text-[11px] font-black text-text-primary border-b border-surface-border pb-1.5 mb-1"
      >
        ملاحظات وشروط الفاتورة
      </label>
      <textarea
        v-model="notesModel"
        rows="3"
        placeholder="سجل أي ملاحظات خاصة بحركة البيع الحالية..."
        class="block w-full h-full min-h-[96px] p-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary placeholder:text-text-muted text-xs font-semibold focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const notesModel = defineModel('notes', { type: String, default: '' })
const discountModel = defineModel('discountAmount', { type: Number, default: 0 })
const taxModel = defineModel('taxAmount', { type: Number, default: 0 })
const cashAmountModel = defineModel('cashAmount', { type: Number, default: 0 })
const bankAmountModel = defineModel('bankAmount', { type: Number, default: 0 })
const paymentTypeModel = defineModel('paymentType', { type: String, default: 'card' })
const paymentModeModel = defineModel('paymentMode', { type: String, default: 'bank' })

const props = defineProps({
  subtotal: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  invoiceType: { type: String, default: 'sale' },
  validationErrors: { type: Object, default: () => null },
})

const toAmount = (value) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

const selectPaymentAmount = (event) => {
  const input = event?.target
  if (input && typeof input.select === 'function') {
    input.select()
  }
}

const paidAmount = computed(() => {
  return Math.round((toAmount(cashAmountModel.value) + toAmount(bankAmountModel.value)) * 100) / 100
})

const remainingAmount = computed(() => {
  return Math.round(Math.max(0, toAmount(props.grandTotal) - paidAmount.value) * 100) / 100
})

const amountsExceedTotal = computed(() => {
  return Math.round((paidAmount.value - toAmount(props.grandTotal)) * 100) > 0
})

const modeButtonClass = (mode) => [
  'min-h-10 px-2 py-2 rounded-lg border text-[10px] sm:text-xs font-black transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30',
  paymentModeModel.value === mode
    ? 'border-primary bg-primary/10 text-primary shadow-sm'
    : 'border-surface-border bg-surface-ground text-text-secondary hover:border-primary/50 hover:text-primary',
]

const selectPaymentMode = (mode) => {
  const previousMode = paymentModeModel.value
  const total = Math.round(toAmount(props.grandTotal) * 100) / 100
  paymentModeModel.value = mode

  if (mode === 'bank') {
    cashAmountModel.value = 0
    bankAmountModel.value = total
    paymentTypeModel.value = 'card'
    return
  }

  if (mode === 'cash') {
    cashAmountModel.value = total
    bankAmountModel.value = 0
    paymentTypeModel.value = 'cash'
    return
  }

  if (mode === 'credit') {
    cashAmountModel.value = 0
    bankAmountModel.value = 0
    paymentTypeModel.value = 'credit'
    return
  }

  if (mode === 'split' && previousMode !== 'split') {
    cashAmountModel.value = 0
    bankAmountModel.value = 0
    paymentTypeModel.value = 'credit'
  }
}

watch(
  () => props.grandTotal,
  (newTotal) => {
    const total = Math.round(toAmount(newTotal) * 100) / 100

    if (paymentModeModel.value === 'bank') {
      cashAmountModel.value = 0
      bankAmountModel.value = total
    } else if (paymentModeModel.value === 'cash') {
      cashAmountModel.value = total
      bankAmountModel.value = 0
    } else if (paymentModeModel.value === 'credit') {
      cashAmountModel.value = 0
      bankAmountModel.value = 0
    }
  },
)

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
