<!--src/views/customers/CustomerForm.vue-->
<template>
  <form @submit.prevent="handleSubmit" dir="rtl">
    <div class="space-y-5 text-right">
      <!-- اسم العميل -->
      <div>
        <AppInput
          id="customer-name"
          label="اسم العميل"
          v-model="form.name"
          placeholder="ادخل اسم العميل بالكامل"
          required
        />
        <p v-if="errors.name" class="text-danger text-xs mt-1 font-bold">
          اسم العميل مطلوب وإلزامي.
        </p>
      </div>

      <!-- رقم الهاتف والبريد الإلكتروني -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="customer-phone"
          label="رقم الهاتف"
          v-model="form.phone"
          placeholder="ادخل رقم الهاتف (اختياري)"
        />

        <AppInput
          id="customer-email"
          label="البريد الإلكتروني"
          v-model="form.email"
          type="email"
          placeholder="example@domain.com (اختياري)"
        />
      </div>

      <!-- الحد الائتماني والرصيد الافتتاحي -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppCurrencyInput
            id="customer-credit-limit"
            label="الحد الائتماني"
            v-model="form.credit_limit"
            placeholder="0.00 (اختياري)"
          />
          <p v-if="errors.credit_limit" class="text-danger text-xs mt-1 font-bold">
            لا يمكن أن يكون الحد الائتماني أقل من صفر.
          </p>
        </div>

        <div>
          <AppCurrencyInput
            id="customer-opening-balance"
            label="الرصيد الافتتاحي"
            v-model="form.opening_balance"
            placeholder="0.00 (اختياري)"
          />
          <p v-if="errors.opening_balance" class="text-danger text-xs mt-1 font-bold">
            لا يمكن أن يكون الرصيد الافتتاحي للعميل بالسالب.
          </p>
        </div>
      </div>

      <!-- اختيار قائمة فئة الأسعار المرتبطة بالعميل -->
      <div>
        <label for="customer-price-list" class="block text-sm font-medium text-text-secondary mb-1">
          قائمة الأسعار المعتمدة للعميل
        </label>
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
        >
          <select
            id="customer-price-list"
            v-model="form.price_list_id"
            class="block w-full h-full pr-4 pl-10 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer text-right"
          >
            <option :value="null" class="bg-surface-section text-text-muted">
              بدون فئة سعر مخصصة (افتراضي)
            </option>
            <option
              v-for="list in priceLists"
              :key="list.id"
              :value="list.id"
              class="bg-surface-section text-text-primary"
            >
              {{ list.name }}
            </option>
          </select>
          <span class="absolute left-4 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>
    </div>

    <!-- أزرار التحكم -->
    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ العميل</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import priceListService from '@/services/priceListService'

import AppInput from '@/components/ui/AppInput.vue'
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
})

const emit = defineEmits(['submit', 'cancel'])

const errors = reactive({
  name: false,
  credit_limit: false,
  opening_balance: false,
})

const priceLists = ref([])

const createFreshForm = () => ({
  id: null,
  name: '',
  phone: '',
  email: '',
  credit_limit: '',
  opening_balance: '',
  price_list_id: null,
})

const form = ref(createFreshForm())

onMounted(async () => {
  try {
    const response = await priceListService.get()
    priceLists.value = response.data?.data || response.data || []
  } catch (error) {
    console.error('فشل النظام في جلب فئات وقوائم الأسعار المعتمدة:', error)
  }
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        phone: newData.phone || '',
        email: newData.email || '',
        credit_limit:
          newData.credit_limit !== null && newData.credit_limit !== undefined
            ? newData.credit_limit
            : '',
        opening_balance:
          newData.opening_balance !== null && newData.opening_balance !== undefined
            ? newData.opening_balance
            : '',
        price_list_id: newData.price_list_id || null,
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  errors.name = false
  errors.credit_limit = false
  errors.opening_balance = false

  if (!form.value.name || !form.value.name.trim()) {
    errors.name = true
    return
  }

  if (form.value.credit_limit !== '' && form.value.credit_limit < 0) {
    errors.credit_limit = true
    return
  }

  if (form.value.opening_balance !== '' && form.value.opening_balance < 0) {
    errors.opening_balance = true
    return
  }

  const payload = {
    ...form.value,
    credit_limit: form.value.credit_limit !== '' ? Number(form.value.credit_limit) : null,
    opening_balance: form.value.opening_balance !== '' ? Number(form.value.opening_balance) : null,
    price_list_id: form.value.price_list_id || null,
  }

  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
