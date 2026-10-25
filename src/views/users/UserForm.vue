<!--src/views/users/UserForm.vue-->
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 text-right font-sans" dir="rtl">
    <div class="space-y-4">
      <AppInput
        id="user-full-name"
        label="الاسم الكامل"
        v-model="form.full_name"
        placeholder="ادخل الاسم الكامل"
        required
      />

      <AppInput
        id="user-username"
        label="اسم المستخدم"
        v-model="form.username"
        placeholder="ادخل اسم المستخدم"
        required
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RolesDropdown id="user-role" label="الدور" v-model="form.roles[0]" required />

        <AppDropdown
          id="user-type"
          label="نوع المستخدم الوظيفي"
          v-model="form.type"
          :options="userTypes"
          option-label="name"
          option-value="id"
          placeholder="اختر نوع المستخدم الوظيفي..."
          :show-clear="false"
          required
        />
      </div>

      <div class="border-t border-surface-border pt-4 mt-4">
        <h4 class="font-bold text-xs text-text-secondary mb-3">
          إعدادات الربط الافتراضي ونظام العمل (اختياري)
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StoresDropdown id="user-store" label="المخزن الافتراضي" v-model="form.store_id" />

          <TreasuriesDropdown
            id="user-treasury"
            label="الخزنة الافتراضية"
            v-model="form.treasury_id"
          />

          <BanksDropdown id="user-bank" label="البنك الافتراضي" v-model="form.bank_id" />
        </div>

        <!-- خيار تفعيل الرقابة المخزنية والتحقق من الكميات -->
        <div class="mt-4 pt-3 border-t border-surface-border/60">
          <label class="flex items-center space-x-3 space-x-reverse cursor-pointer select-none">
            <input
              type="checkbox"
              id="user-stock-control"
              v-model="form.stock_control"
              class="w-4 h-4 rounded border-surface-border bg-surface-ground text-primary focus:ring-primary/20 cursor-pointer"
            />
            <div class="flex flex-col pr-2">
              <span class="text-sm font-bold text-text-primary">
                تفعيل الرقابة على المخزون (التحكم بالمخزون)
              </span>
              <span class="text-xs text-text-muted mt-0.5">
                عند التفعيل، لن يتمكن المستخدم من إتمام عمليات البيع إذا كان رصيد الصنف غير كافٍ أو
                مصفراً في المخزن.
              </span>
            </div>
          </label>
        </div>
      </div>

      <div class="border-t border-surface-border pt-4 mt-4">
        <h4 class="font-bold text-xs text-text-secondary mb-2">
          {{ form.id ? 'تغيير كلمة المرور (اختياري)' : 'كلمة المرور' }}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppInput
            id="user-password"
            label="كلمة المرور"
            type="password"
            v-model="form.password"
            :required="!form.id"
            autocomplete="new-password"
          />
          <AppInput
            id="user-password-confirmation"
            label="تأكيد كلمة المرور"
            type="password"
            v-model="form.password_confirmation"
            :required="!form.id || !!form.password"
            autocomplete="new-password"
          />
        </div>
      </div>
    </div>

    <div
      class="mt-8 flex justify-end space-x-3 space-x-reverse pt-3 border-t border-surface-border"
    >
      <AppButton type="button" variant="secondary" @click="$emit('cancel')" :disabled="isSaving">
        تراجع
      </AppButton>

      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import RolesDropdown from '@/components/forms/RolesDropdown.vue'
import StoresDropdown from '@/components/forms/StoresDropdown.vue'
import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'
import BanksDropdown from '@/components/forms/BanksDropdown.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const userTypes = [
  { id: 'regular', name: 'مستخدم عادي / إداري' },
  { id: 'designer', name: 'مصمم' },
  { id: 'technician', name: 'فني تنفيذ' },
]

const form = ref({
  id: null,
  full_name: '',
  username: '',
  password: '',
  password_confirmation: '',
  roles: [],
  type: 'regular',
  store_id: null,
  treasury_id: null,
  bank_id: null,
  stock_control: false,
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = {
        id: newData.id,
        full_name: newData.full_name,
        username: newData.username,
        password: '',
        password_confirmation: '',
        roles: newData.roles ? newData.roles.map((r) => r.name) : [],
        type: newData.type || 'regular',
        store_id: newData.store_id || null,
        treasury_id: newData.treasury_id || null,
        bank_id: newData.bank_id || null,
        stock_control: Boolean(newData.stock_control),
      }
    } else {
      form.value = {
        id: null,
        full_name: '',
        username: '',
        password: '',
        password_confirmation: '',
        roles: [],
        type: 'regular',
        store_id: null,
        treasury_id: null,
        bank_id: null,
        stock_control: false,
      }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  const payload = { ...form.value }

  if (payload.id && !payload.password) {
    delete payload.password
    delete payload.password_confirmation
  }

  emit('submit', payload)
}
</script>
