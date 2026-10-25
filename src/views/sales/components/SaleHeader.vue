<!--src/views/sales/components/SaleHeader.vue-->
<template>
  <div
    class="p-5 bg-surface-section rounded-xl border border-surface-border shadow-sm space-y-4 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- الصف الأول: 4 أعمدة (نوع الفاتورة + المخزن + التاريخ + الخزنة/البنك) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- invoice_type -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center shadow-sm transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            :disabled="!!formData.parent_id"
            class="block w-full h-full pr-10 pl-10 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="sale" class="bg-surface-section text-text-primary">
              فاتورة مبيعات نشطة
            </option>
            <option value="return" class="bg-surface-section text-text-primary">
              مردودات مبيعات
            </option>
          </select>

          <span class="absolute left-4 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
        <p v-if="getFieldError('invoice_type')" class="text-danger text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('invoice_type') }}
        </p>
      </div>

      <!-- store_id -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span class="absolute right-3 text-text-muted pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>
          <div
            class="w-full h-full pr-10 pl-2 flex items-center"
            :class="{ 'opacity-60 pointer-events-none cursor-not-allowed': !!formData.parent_id }"
          >
            <StoresDropdown
              id="sale-store-id"
              v-model="formData.store_id"
              variant="sales"
              class="w-full bg-transparent"
            />
          </div>
        </div>
        <p v-if="getFieldError('store_id')" class="text-danger text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('store_id') }}
        </p>
      </div>

      <!-- invoice_date -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <input
            type="date"
            v-model="formData.invoice_date"
            class="block w-full h-full pr-4 pl-20 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />

          <span
            class="absolute left-3 text-text-muted pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <span class="font-medium text-[11px]">تاريخ</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>
        <p v-if="getFieldError('invoice_date')" class="text-danger text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('invoice_date') }}
        </p>
      </div>

      <!-- اختيار الخزينة والبنك حسب القنوات المستخدمة في الفاتورة -->
      <div class="relative w-full space-y-2">
        <div
          v-if="showTreasurySelector"
          class="relative w-full h-11 bg-surface-ground border border-primary/50 focus-within:border-primary rounded-lg flex items-center animate-fade-in shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-2 flex items-center">
            <TreasuriesDropdown
              id="sale-treasury-id"
              v-model="formData.treasury_id"
              variant="sales"
              class="w-full bg-transparent"
            />
          </div>
        </div>

        <div
          v-if="showBankSelector"
          class="relative w-full h-11 bg-surface-ground border border-primary/50 focus-within:border-primary rounded-lg flex items-center animate-fade-in shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              />
            </svg>
          </span>
          <div class="w-full h-full pr-10 pl-2 flex items-center">
            <BanksDropdown
              id="sale-bank-id"
              v-model="formData.bank_id"
              variant="sales"
              class="w-full bg-transparent"
            />
          </div>
        </div>

        <div
          v-if="!showTreasurySelector && !showBankSelector"
          class="relative w-full h-11 bg-surface-ground border border-dashed border-surface-border rounded-lg flex items-center justify-center text-text-muted text-[10px] font-medium select-none px-2 text-center"
        >
          <span v-if="formData.invoice_type === 'return'">دين آجل - لا يوجد خزنة أو بنك</span>
          <span v-else>يظهر اختيار الخزينة أو البنك عند تسجيل مبلغ في القناة</span>
        </div>

        <p
          v-if="getFieldError('treasury_id') || getFieldError('bank_id')"
          class="text-danger text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('treasury_id') || getFieldError('bank_id') }}
        </p>
      </div>
    </div>

    <!-- الصف الثاني: 4 أعمدة (طريقة الدفع + فحص هاتف العميل + قائمة اختيار العميل + اسم العميل النصي) -->
    <div
      class="grid grid-cols-1 gap-4"
      :class="formData.invoice_type === 'return' ? 'md:grid-cols-4' : 'md:grid-cols-3'"
    >
      <!-- payment_type للمرتجعات فقط؛ البيع يستخدم توزيع المبالغ -->
      <div v-if="formData.invoice_type === 'return'" class="relative w-full">
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span class="absolute right-3 text-text-muted pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            :disabled="!!formData.parent_id"
            class="block w-full h-full pr-10 pl-10 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="cash" class="bg-surface-section text-text-primary">نقدي (Cash)</option>
            <option value="card" class="bg-surface-section text-text-primary">
              دفع بنكي (Card)
            </option>
            <option value="credit" class="bg-surface-section text-text-primary">
              دفع آجل (Credit)
            </option>
          </select>

          <span class="absolute left-4 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
        <p v-if="getFieldError('payment_type')" class="text-danger text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('payment_type') }}
        </p>
      </div>

      <!-- customer_phone_search -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </span>

          <input
            type="text"
            v-model="customerPhone"
            @keydown.enter.prevent="checkCustomerPhone"
            :disabled="!!formData.parent_id"
            placeholder="رقم الهاتف (Enter للفحص)..."
            class="block w-full h-full pr-10 pl-16 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            @click="checkCustomerPhone"
            :disabled="isCheckingPhone || !customerPhone.trim() || !!formData.parent_id"
            class="absolute left-1.5 px-2.5 py-1 bg-primary hover:bg-primary-dark text-white text-[11px] font-bold rounded flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            title="فحص وجود العميل برقم الهاتف"
          >
            <svg
              v-if="isCheckingPhone"
              class="animate-spin w-3 h-3 text-white"
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
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span v-else>فحص</span>
          </button>
        </div>
        <span class="text-[10px] text-text-muted mt-1 pr-1 block">
          اضغط Enter أو زر فحص لاختيار العميل أو تسجيله
        </span>
      </div>

      <!-- customer_id -->
      <div class="relative w-full flex flex-col">
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </span>

          <div
            class="w-full h-full pr-10 pl-2 flex items-center"
            :class="{ 'opacity-60 pointer-events-none cursor-not-allowed': !!formData.parent_id }"
          >
            <CustomersDropdown
              id="sale-customer-id"
              v-model="formData.customer_id"
              variant="sales"
              class="w-full bg-transparent"
            />
          </div>
        </div>

        <div
          v-if="selectedCustomerPriceListName"
          class="mt-1 flex items-center gap-1 animate-fade-in pr-1"
        >
          <span class="inline-block w-1.5 h-1.5 bg-success rounded-full"></span>
          <span class="text-[10px] text-success font-bold">
            فئة السعر المعتمدة: {{ selectedCustomerPriceListName }}
          </span>
        </div>

        <p v-if="getFieldError('customer_id')" class="text-danger text-[10px] font-bold mt-1 pr-1">
          {{ getFieldError('customer_id') }}
        </p>
      </div>

      <!-- customer_name_text -->
      <div class="relative w-full">
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span class="absolute right-3 text-text-muted pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </span>

          <input
            type="text"
            v-model="formData.customer_name_text"
            :readonly="!!formData.parent_id"
            placeholder="اسم العميل (نص حر - اختياري)"
            class="block w-full h-full pr-10 pl-4 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-medium readonly:opacity-70"
          />
        </div>
        <p
          v-if="getFieldError('customer_name_text')"
          class="text-danger text-[10px] font-bold mt-1 pr-1"
        >
          {{ getFieldError('customer_name_text') }}
        </p>
      </div>
    </div>

    <!-- حالة المرتجع: اختيار الفاتورة الأم -->
    <div
      v-if="formData.invoice_type === 'return'"
      class="grid grid-cols-1 gap-4 mt-2 animate-fade-in"
    >
      <div
        class="w-full bg-primary/10 border border-dashed border-primary/40 rounded-lg p-3 flex items-center gap-3"
      >
        <span
          class="text-primary bg-primary/10 p-2 rounded-md flex items-center justify-center shrink-0"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </span>
        <div class="flex items-center gap-2 text-right">
          <span class="text-xs font-black text-primary">
            مستند مردود مبيعات للفاتورة الأصلية المربوطة:
          </span>
          <span
            class="font-mono font-black text-xs text-white bg-primary px-2 py-0.5 rounded shadow-sm"
          >
            #{{ formData.parent_id }}
          </span>
        </div>
      </div>
      <p v-if="getFieldError('parent_id')" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
        {{ getFieldError('parent_id') }}
      </p>
    </div>

    <!-- نافذة إضافة عميل جديد السريعة -->
    <CustomerModal
      v-if="isCustomerModalOpen"
      v-model="isCustomerModalOpen"
      :customer="newCustomerInitialData"
      :is-saving="isSavingCustomer"
      @save="handleSaveNewCustomer"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useCustomerStore } from '@/stores/customerStore'
import { useSaleStore } from '@/stores/saleStore'
import { useToast } from 'vue-toastification'
import StoresDropdown from '@/components/forms/StoresDropdown.vue'
import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'
import BanksDropdown from '@/components/forms/BanksDropdown.vue'
import CustomersDropdown from '@/components/forms/CustomersDropdown.vue'
import CustomerModal from '@/views/customers/CustomerModal.vue'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
})

const customerStore = useCustomerStore()
const saleStore = useSaleStore()
const toast = useToast()

const showTreasurySelector = computed(() => {
  if (formData.value.invoice_type === 'return') {
    return formData.value.payment_type === 'cash'
  }

  return Number(formData.value.cash_amount ?? 0) > 0
})

const showBankSelector = computed(() => {
  if (formData.value.invoice_type === 'return') {
    return formData.value.payment_type === 'card'
  }

  return Number(formData.value.bank_amount ?? 0) > 0
})

const originalSales = ref([])

const customerPhone = ref('')
const isCheckingPhone = ref(false)
const isCustomerModalOpen = ref(false)
const newCustomerInitialData = ref(null)
const isSavingCustomer = ref(false)

const checkCustomerPhone = async () => {
  const phone = customerPhone.value?.trim()
  if (!phone) {
    toast.warning('يرجى إدخال رقم الهاتف أولاً لإجراء الفحص.')
    return
  }

  isCheckingPhone.value = true
  try {
    const matchedCustomer = await customerStore.findByPhone(phone)
    if (matchedCustomer) {
      formData.value.customer_id = matchedCustomer.id
      toast.success(`تم العثور على العميل "${matchedCustomer.name}" واختياره للفاتورة.`)
    } else {
      toast.info('العميل غير مسجل، تم فتح نافذة تسجيل عميل جديد.')
      newCustomerInitialData.value = {
        name: '',
        phone: phone,
        email: '',
        credit_limit: '',
        opening_balance: '',
        price_list_id: null,
      }
      isCustomerModalOpen.value = true
    }
  } catch (error) {
    console.error('خطأ أثناء فحص رقم هاتف العميل:', error)
    toast.error('تعذر استكمال فحص رقم الهاتف، حاول مرة أخرى.')
  } finally {
    isCheckingPhone.value = false
  }
}

const handleSaveNewCustomer = async (customerData) => {
  isSavingCustomer.value = true
  try {
    const response = await customerStore.createCustomer(customerData)
    const createdCustomer = response?.data || response

    if (createdCustomer && createdCustomer.id) {
      formData.value.customer_id = createdCustomer.id
      customerPhone.value = createdCustomer.phone || customerPhone.value
      toast.success(`تم تسجيل العميل "${createdCustomer.name}" بنجاح وتعيينه للفاتورة.`)
    }

    isCustomerModalOpen.value = false
  } catch (error) {
    const errorMsg =
      customerStore.error || error.response?.data?.message || 'فشل في تسجيل بيانات العميل الجديد.'
    toast.error(errorMsg)
  } finally {
    isSavingCustomer.value = false
  }
}

watch(
  () => formData.value.customer_id,
  (newId) => {
    if (newId && customerStore.customers) {
      const currentCust = customerStore.customers.find((c) => c.id === newId)
      if (currentCust && currentCust.phone && !customerPhone.value) {
        customerPhone.value = currentCust.phone
      }
    }
  },
)

const selectedCustomerPriceListName = computed(() => {
  if (!formData.value.customer_id || !customerStore.customers) return null
  const currentCust = customerStore.customers.find((c) => c.id === formData.value.customer_id)
  return (
    currentCust?.price_list?.name ||
    (currentCust?.price_list_id ? `فئة #${currentCust.price_list_id}` : null)
  )
})

const loadOriginalSales = async () => {
  if (formData.value.invoice_type === 'return' && formData.value.customer_id) {
    try {
      await saleStore.fetchSales(1, {
        customer_id: formData.value.customer_id,
        invoice_type: 'sale',
      })
      originalSales.value = saleStore.sales
    } catch (error) {
      console.error('فشل جلب فواتير المبيعات المتاحة للمردود:', error)
      originalSales.value = []
    }
  } else {
    originalSales.value = []
    if (!formData.value.parent_id) {
      formData.value.parent_id = null
    }
  }
}

watch(
  () => [formData.value.invoice_type, formData.value.customer_id],
  async () => {
    await loadOriginalSales()
  },
)

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}

onMounted(async () => {
  await customerStore.fetchCustomers(1, { is_active: 1 })

  if (formData.value.customer_name_text === undefined) {
    formData.value.customer_name_text = null
  }

  if (formData.value.invoice_type === 'return' && formData.value.customer_id) {
    await loadOriginalSales()
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

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
