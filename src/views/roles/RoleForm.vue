<!-- src/views/roles/RoleForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="space-y-6 text-right font-sans" dir="rtl">
    <div class="space-y-5">
      <!-- حقل اسم الدور -->
      <div>
        <AppInput
          id="role-name"
          label="اسم الدور"
          v-model="form.name"
          placeholder="ادخل اسم الدور"
          required
          :disabled="isDefaultRole"
        />
        <p v-if="isDefaultRole" class="text-xs text-warning font-semibold mt-1.5 pr-1">
          لا يمكن تعديل اسم الأدوار الافتراضية.
        </p>
      </div>

      <!-- مكون قائمة الصلاحيات -->
      <div>
        <label class="block text-sm font-semibold text-text-secondary mb-2">
          الصلاحيات الممنوحة
        </label>
        <PermissionsChecklist v-model:selectedPermissions="form.permissions" />
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ الدور</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PermissionsChecklist from '@/components/forms/PermissionsChecklist.vue'

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

const emit = defineEmits(['submit'])

const form = ref({
  id: null,
  name: '',
  permissions: [],
})

const isDefaultRole = computed(() => {
  if (!form.value || !form.value.name) return false
  return ['Super Admin', 'Admin', 'User'].includes(form.value.name)
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = {
        id: newData.id,
        name: newData.name,
        permissions: newData.permissions ? newData.permissions.map((p) => p.name) : [],
      }
    } else {
      form.value = { id: null, name: '', permissions: [] }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
