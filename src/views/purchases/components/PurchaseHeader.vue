<!--src/views/purchases/components/PurchaseHeader.vue-->
<template>
  <div
    class="p-3 bg-surface-header/60 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs space-y-2.5 text-right font-sans transition-all duration-200"
    dir="rtl"
  >
    <!-- الصف الأول: نوع الفاتورة، المستودع، وحساب الدفع (خزنة/بنك) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
      <!-- 1. نوع الفاتورة -->
      <div class="relative w-full" key="purchase-invoice-type-container">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </span>

          <select
            v-model="formData.invoice_type"
            class="block w-full h-full pr-8 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="purchase" class="bg-surface-section text-text-primary">
              فاتورة مشتريات نشطة
            </option>
            <option value="return" class="bg-surface-section text-text-primary">
              مرتجع مشتريات
            </option>
          </select>

          <span
            class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
          >
            ▼
          </span>
        </div>
        <p
          v-if="getFieldError('invoice_type')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('invoice_type') }}
        </p>
      </div>

      <!-- 2. المستودع المستهدف -->
      <div class="relative w-full" key="purchase-store-container">
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-8 pl-1 flex items-center">
            <StoresDropdown
              id="purchase-store-id"
              v-model="formData.store_id"
              variant="sales"
              label=""
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>
        <p v-if="getFieldError('store_id')" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
          {{ getFieldError('store_id') }}
        </p>
      </div>

      <!-- 3. حساب الدفع التلقائي (الخزينة / البنك / آجل) -->
      <div class="relative w-full" key="purchase-dynamic-account-container">
        <div
          v-if="formData.payment_type === 'cash'"
          key="cash-treasury-active"
          class="relative w-full h-9 bg-surface-card border border-primary/50 focus-within:border-primary rounded-lg flex items-center animate-fade-in shadow-2xs transition-all focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
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
              id="purchase-treasury-id"
              v-model="formData.treasury_id"
              variant="sales"
              label=""
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>

        <div
          v-else-if="formData.payment_type === 'card'"
          key="card-bank-active"
          class="relative w-full h-9 bg-surface-card border border-primary/50 focus-within:border-primary rounded-lg flex items-center animate-fade-in shadow-2xs transition-all focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-8 pl-1 flex items-center">
            <BanksDropdown
              id="purchase-bank-id"
              v-model="formData.bank_id"
              variant="sales"
              label=""
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>

        <div
          v-else
          key="credit-placeholder"
          class="relative w-full h-9 bg-surface-card/60 border border-dashed border-surface-border rounded-lg flex items-center justify-center text-text-muted text-[11px] font-medium select-none px-2 text-center"
        >
          <span>دين آجل - لا يوجد خزنة أو بنك</span>
        </div>

        <p
          v-if="getFieldError('treasury_id') || getFieldError('bank_id')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('treasury_id') || getFieldError('bank_id') }}
        </p>
      </div>
    </div>

    <!-- الصف الثاني: طريقة الدفع، المورد، وتاريخ الفاتورة -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
      <!-- 1. طريقة الدفع -->
      <div class="relative w-full" key="purchase-payment-type-container">
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
            v-model="formData.payment_type"
            class="block w-full h-full pr-8 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="cash" class="bg-surface-section text-text-primary">نقدي (Cash)</option>
            <option value="card" class="bg-surface-section text-text-primary">
              شبكة / دفع إلكتروني (Card)
            </option>
            <option value="credit" class="bg-surface-section text-text-primary">
              آجل / ذمم (Credit)
            </option>
          </select>

          <span
            class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
          >
            ▼
          </span>
        </div>
        <p
          v-if="getFieldError('payment_type')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('payment_type') }}
        </p>
      </div>

      <!-- 2. قائمة اختيار المورد -->
      <div class="relative w-full" key="purchase-supplier-container">
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </span>

          <div class="w-full h-full pr-8 pl-1 flex items-center">
            <SuppliersDropdown
              id="purchase-supplier-id"
              v-model="formData.supplier_id"
              variant="sales"
              label=""
              class="w-full bg-transparent header-embedded-dropdown"
            />
          </div>
        </div>
        <p
          v-if="getFieldError('supplier_id')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('supplier_id') }}
        </p>
      </div>

      <!-- 3. تاريخ الفاتورة -->
      <div class="relative w-full" key="purchase-invoice-date-container">
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <input
            type="date"
            v-model="formData.invoice_date"
            class="block w-full h-full pr-3 pl-16 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />

          <span
            class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none gap-1 text-xs z-10"
          >
            <span class="font-medium text-[10px]">تاريخ</span>
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
          v-if="getFieldError('invoice_date')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('invoice_date') }}
        </p>
      </div>
    </div>

    <!-- الصف الثالث: العملة وسعر الصرف المعتمد للفاتورة -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1.5 border-t border-primary/15">
      <!-- 1. العملة -->
      <div class="relative w-full" key="purchase-currency-container">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>

          <select
            v-model="formData.currency_id"
            @change="handleCurrencyChange"
            class="block w-full h-full pr-8 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option :value="null" class="bg-surface-section text-text-muted">
              العملة المحلية الافتراضية
            </option>
            <option
              v-for="curr in currencyStore.currencies"
              :key="curr.id"
              :value="curr.id"
              class="bg-surface-section text-text-primary"
            >
              {{ curr.name }} ({{ curr.code }})
            </option>
          </select>

          <span
            class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
          >
            ▼
          </span>
        </div>
        <p
          v-if="getFieldError('currency_id')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('currency_id') }}
        </p>
      </div>

      <!-- 2. سعر الصرف -->
      <div class="relative w-full" key="purchase-exchange-rate-container">
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
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </span>

          <input
            type="number"
            step="0.0001"
            min="0.0001"
            :disabled="!formData.currency_id"
            v-model.number="formData.exchange_rate"
            placeholder="سعر الصرف..."
            class="block w-full h-full pr-8 pl-20 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right disabled:opacity-40 disabled:cursor-not-allowed"
          />

          <span
            class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none text-[10px] font-bold z-10"
          >
            سعر الصرف
          </span>
        </div>
        <p
          v-if="getFieldError('exchange_rate')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('exchange_rate') }}
        </p>
      </div>
    </div>

    <!-- الصف الرابع الشرطي: اختيار الفاتورة الأصلية في حال المرتجع -->
    <div
      v-if="formData.invoice_type === 'return'"
      key="purchase-parent-invoice-container"
      class="relative w-full animate-fade-in"
    >
      <div
        class="relative w-full h-9 bg-primary/10 border border-dashed border-primary/40 rounded-lg flex items-center"
      >
        <span
          class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </span>

        <select
          v-model="formData.parent_id"
          :disabled="!formData.supplier_id"
          class="block w-full h-full pr-8 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option :value="null" class="bg-surface-section text-text-muted">
            {{ formData.supplier_id ? 'اختر مستند الشراء الأم...' : 'حدد المورد أولاً...' }}
          </option>
          <option
            v-for="invoice in originalInvoices"
            :key="invoice.id"
            :value="invoice.id"
            class="bg-surface-section text-text-primary"
          >
            #{{ invoice.id }} - {{ invoice.invoice_date }}
          </option>
        </select>

        <span
          class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
        >
          ▼
        </span>
      </div>
      <p v-if="getFieldError('parent_id')" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
        {{ getFieldError('parent_id') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useStoreStore } from '@/stores/storeStore'
import { useSupplierStore } from '@/stores/supplierStore'
import { usePurchaseStore } from '@/stores/purchaseStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import StoresDropdown from '@/components/forms/StoresDropdown.vue'
import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'
import BanksDropdown from '@/components/forms/BanksDropdown.vue'
import SuppliersDropdown from '@/components/forms/SuppliersDropdown.vue'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
})

const storeStore = useStoreStore()
const supplierStore = useSupplierStore()
const purchaseStore = usePurchaseStore()
const currencyStore = useCurrencyStore()

const originalInvoices = ref([])

const handleCurrencyChange = () => {
  if (!formData.value.currency_id) {
    formData.value.exchange_rate = 1
    return
  }

  const selectedCurrency = currencyStore.currencies.find(
    (c) => Number(c.id) === Number(formData.value.currency_id),
  )

  if (selectedCurrency && selectedCurrency.latest_exchange_rate?.rate) {
    formData.value.exchange_rate = Number(selectedCurrency.latest_exchange_rate.rate)
  }
}

const loadOriginalInvoices = async () => {
  if (formData.value.invoice_type === 'return' && formData.value.supplier_id) {
    try {
      await purchaseStore.fetchPurchases(1, {
        supplier_id: formData.value.supplier_id,
        invoice_type: 'purchase',
      })
      originalInvoices.value = purchaseStore.purchases
    } catch (error) {
      console.error('فشل جلب الفواتير المتاحة للإرجاع:', error)
      originalInvoices.value = []
    }
  } else {
    originalInvoices.value = []
    formData.value.parent_id = null
  }
}

watch(
  () => [formData.value.invoice_type, formData.value.supplier_id],
  async () => {
    await loadOriginalInvoices()
  },
)

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}

onMounted(async () => {
  await Promise.all([
    storeStore.fetchStores(1, { is_active: 1 }),
    supplierStore.fetchSuppliers(1, { is_active: 1 }),
    currencyStore.fetchCurrencies(),
  ])

  if (formData.value.invoice_type === 'return' && formData.value.supplier_id) {
    await loadOriginalInvoices()
  }
})
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

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
