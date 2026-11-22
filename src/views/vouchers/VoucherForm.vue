<!--src/views/vouchers/VoucherForm.vue-->
<template>
  <form @submit.prevent="handleSubmit" class="space-y-3 text-right font-sans" dir="rtl">
    <!-- الصف الأول: طريقة الدفع + تاريخ السند -->
    <div
      class="p-3 bg-surface-header/60 rounded-xl border border-surface-border shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-2.5"
    >
      <!-- طريقة الدفع والنقدية -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-text-secondary mb-1 pr-1">
          طريقة الدفع والنقدية <span class="text-danger">*</span>
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </span>

          <select
            v-model="form.payment_method"
            @change="handlePaymentMethodChange"
            class="block w-full h-full pr-8 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
            required
          >
            <option value="cash" class="bg-surface-section text-text-primary">نقدي (خزينة)</option>
            <option value="bank" class="bg-surface-section text-text-primary">
              بنكي (حساب مصرفي)
            </option>
          </select>

          <span
            class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
          >
            ▼
          </span>
        </div>
        <p
          v-if="validationErrors?.payment_method"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ validationErrors.payment_method[0] }}
        </p>
      </div>

      <!-- تاريخ السند ووقت الاستحقاق -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-text-secondary mb-1 pr-1">
          تاريخ السند ووقت الاستحقاق <span class="text-danger">*</span>
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <input
            type="date"
            v-model="form.voucher_date"
            class="block w-full h-full pr-3 pl-24 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
            required
          />

          <span
            class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none gap-1 text-xs z-10"
          >
            <span class="font-medium text-[10px]">تاريخ القيد</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>
        <p
          v-if="validationErrors?.voucher_date"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ validationErrors.voucher_date[0] }}
        </p>
      </div>
    </div>

    <!-- أطراف القيد المحاسبي -->
    <div
      class="p-3 bg-surface-section rounded-xl border border-surface-border shadow-2xs space-y-2.5"
    >
      <!-- الطرف الأول لقناة النقدية: (صرف من / إيراد لـ) -->
      <div class="relative w-full">
        <label class="block text-[11px] font-bold text-text-secondary mb-1 pr-1">
          {{ fundAccountLabel }}
        </label>
        <div
          class="relative w-full h-9 bg-surface-card border border-primary/50 focus-within:border-primary rounded-lg flex items-center shadow-2xs transition-all focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-8 pl-1 flex items-center">
            <TreasuriesDropdown
              v-if="form.payment_method === 'cash'"
              id="fund-treasury-id"
              v-model="form.fund_account_id"
              label=""
              variant="sales"
              class="w-full bg-transparent header-embedded-dropdown"
            />
            <BanksDropdown
              v-else-if="form.payment_method === 'bank'"
              id="fund-bank-id"
              v-model="form.fund_account_id"
              label=""
              variant="sales"
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>
        <p
          v-if="validationErrors?.fund_account_id"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ validationErrors.fund_account_id[0] }}
        </p>
      </div>

      <!-- الطرف الثاني للشجرة والحسابات المساعدة -->
      <VoucherSubLedgerDropdown
        v-model:subLedgerType="form.sub_ledger_type"
        v-model:subLedgerId="form.sub_ledger_id"
        v-model:accountId="form.account_id"
        :label="targetAccountLabel"
        :accounts="accounts"
        :validationErrors="validationErrors"
      />
    </div>

    <!-- القيمة المالية والبيان التفصيلي -->
    <div
      class="p-3 bg-surface-section rounded-xl border border-surface-border shadow-2xs space-y-2.5"
    >
      <!-- القيمة المالية البارزة -->
      <div class="w-full max-w-xs">
        <label
          for="voucher-amount"
          class="block text-[11px] font-black text-text-primary mb-1 pr-1"
        >
          المبلغ المالي المعتمد <span class="text-danger">*</span>
        </label>
        <div
          class="relative w-full h-10 bg-primary/10 border border-primary/40 rounded-xl flex items-center shadow-2xs transition-all duration-200 hover:border-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 px-2.5"
        >
          <span class="text-primary font-mono font-black text-xs ml-2 select-none">#</span>
          <AppCurrencyInput
            id="voucher-amount"
            v-model="form.amount"
            variant="sales"
            placeholder="0.00"
            input-class="h-9 !px-1 !text-left !font-mono !font-black !text-base !text-primary"
            required
          />
        </div>
        <p v-if="validationErrors?.amount" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
          {{ validationErrors.amount[0] }}
        </p>
      </div>

      <!-- البيان والشرح التفصيلي -->
      <div class="relative w-full">
        <label
          for="voucher-notes"
          class="block text-[11px] font-bold text-text-secondary mb-1 pr-1"
        >
          البيان والشرح التفصيلي للمستند
        </label>
        <div
          class="relative w-full bg-surface-card border border-surface-border rounded-lg p-2 transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
        >
          <textarea
            id="voucher-notes"
            v-model="form.notes"
            placeholder="اكتب هنا تفاصيل سبب الصرف أو القبض بشكل دقيق لدعم التقرير المالي المحاسبي..."
            rows="2"
            class="block w-full min-h-[58px] bg-transparent text-text-primary focus:outline-none text-xs font-medium placeholder:text-text-muted resize-none text-right"
          ></textarea>
        </div>
        <p v-if="validationErrors?.notes" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
          {{ validationErrors.notes[0] }}
        </p>
      </div>
    </div>

    <!-- أزرار التحكم -->
    <div class="flex justify-end items-center gap-2.5 border-t border-surface-border pt-3 mt-1">
      <AppButton
        type="button"
        variant="secondary"
        size="sm"
        @click="handleCancel"
        :disabled="isSaving"
      >
        إلغاء المعاملة
      </AppButton>
      <AppButton type="submit" size="sm" :disabled="isSaving">
        <span v-if="isSaving">جاري ترحيل السند...</span>
        <span v-else>حفظ واعتماد المستند المالي</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useTreasuryStore } from '@/stores/treasuryStore'
import { useBankStore } from '@/stores/bankStore'

import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'
import BanksDropdown from '@/components/forms/BanksDropdown.vue'
import VoucherSubLedgerDropdown from '@/components/forms/VoucherSubLedgerDropdown.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  accounts: {
    type: Array,
    required: true,
  },
  validationErrors: {
    type: Object,
    default: null,
  },
  isTypeDisabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const treasuryStore = useTreasuryStore()
const bankStore = useBankStore()

const { banks } = storeToRefs(bankStore)
const { treasuries } = storeToRefs(treasuryStore)

const fundAccountLabel = computed(() => {
  const isCash = form.value.payment_method === 'cash'
  if (form.value.voucher_type === 'payment') {
    return isCash ? 'صرف من الخزنة *' : 'صرف من البنك *'
  } else {
    return isCash ? 'إيراد للخزنة *' : 'إيراد للبنك *'
  }
})

const targetAccountLabel = computed(() => {
  return form.value.voucher_type === 'payment' ? 'إلى حساب *' : 'من حساب *'
})

const createFreshForm = () => {
  const today = new Date().toISOString().split('T')[0]
  return {
    id: null,
    voucher_type: 'payment',
    account_id: '',
    sub_ledger_type: '',
    sub_ledger_id: null,
    payment_method: 'cash',
    fund_account_id: '',
    treasury_id: null,
    bank_id: null,
    amount: '',
    voucher_date: today,
    notes: '',
  }
}

const form = ref(createFreshForm())

onMounted(async () => {
  try {
    const promises = []
    if (treasuries.value.length === 0)
      promises.push(treasuryStore.fetchTreasuries(1, { per_page: 1000 }))
    if (banks.value.length === 0) promises.push(bankStore.fetchBanks(1, { per_page: 1000 }))

    if (promises.length > 0) {
      await Promise.all(promises)
    }
  } catch (err) {
    console.error('Failed to load fund account data for voucher form:', err)
  }
})

watch(
  () => form.value.fund_account_id,
  (newVal) => {
    if (!newVal) {
      form.value.treasury_id = null
      form.value.bank_id = null
      return
    }

    if (form.value.payment_method === 'cash') {
      const target = treasuries.value.find((t) => t.account_id == newVal || t.id == newVal)
      if (target) {
        form.value.treasury_id = target.id
        if (form.value.fund_account_id == target.account_id && target.id !== target.account_id) {
          form.value.fund_account_id = target.id
        }
      }
    } else if (form.value.payment_method === 'bank') {
      const target = banks.value.find((b) => b.account_id == newVal || b.id == newVal)
      if (target) {
        form.value.bank_id = target.id
        if (form.value.fund_account_id == target.account_id && target.id !== target.account_id) {
          form.value.fund_account_id = target.id
        }
      }
    }
  },
)

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      let formattedDate = ''
      if (newData.voucher_date) {
        formattedDate = newData.voucher_date.split(' ')[0]
      }

      let fundAccountId = newData.fund_account_id || ''
      if (newData.payment_method === 'cash' && newData.treasury_id) {
        fundAccountId = newData.treasury_id
      } else if (newData.payment_method === 'bank' && newData.bank_id) {
        fundAccountId = newData.bank_id
      }

      form.value = {
        id: newData.id,
        voucher_type: newData.voucher_type || 'payment',
        account_id: newData.account_id || '',
        sub_ledger_type: newData.sub_ledger_type || '',
        sub_ledger_id: newData.sub_ledger_id || null,
        payment_method: newData.payment_method || 'cash',
        fund_account_id: fundAccountId,
        treasury_id: newData.treasury_id || null,
        bank_id: newData.bank_id || null,
        amount: newData.amount !== undefined ? newData.amount : '',
        voucher_date: formattedDate || createFreshForm().voucher_date,
        notes: newData.notes || '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handlePaymentMethodChange = () => {
  form.value.fund_account_id = ''
  form.value.treasury_id = null
  form.value.bank_id = null
}

const handleSubmit = () => {
  const submissionData = { ...form.value }

  if (form.value.payment_method === 'cash') {
    const target = treasuries.value.find(
      (t) => t.id == form.value.fund_account_id || t.account_id == form.value.fund_account_id,
    )
    if (target) submissionData.fund_account_id = target.account_id
  } else if (form.value.payment_method === 'bank') {
    const target = banks.value.find(
      (b) => b.id == form.value.fund_account_id || b.account_id == form.value.fund_account_id,
    )
    if (target) submissionData.fund_account_id = target.account_id
  }

  emit('submit', submissionData)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}

:deep(.header-embedded-dropdown .p-dropdown),
:deep(.header-embedded-dropdown [data-pc-name='dropdown']),
:deep(.header-embedded-dropdown [data-pc-section='root']),
:deep(.header-embedded-dropdown div.inline-flex) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  height: 36px !important;
  min-height: 36px !important;
}

:deep(.header-embedded-dropdown .p-dropdown-label),
:deep(.header-embedded-dropdown [data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 0 0.25rem !important;
  display: flex !important;
  align-items: center !important;
}
</style>

جرّب الشكل الآن وأخبرني إذا كان أهدأ وأوضح بصرياً أم تحتاج تعديلاً إضافياً.
