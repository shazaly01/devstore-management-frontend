<!-- src/views/roles/RoleModal.vue -->
<template>
  <AppDialog :model-value="modelValue" @update:modelValue="close" :title="dialogTitle">
    <form @submit.prevent="handleSubmit" class="space-y-4 text-right font-sans" dir="rtl">
      <div>
        <AppInput
          id="role-name"
          label="اسم الدور"
          v-model="form.name"
          type="text"
          required
          placeholder="مثال: مشرف محتوى"
          :disabled="isDefaultRole"
        />
        <p v-if="isDefaultRole" class="text-xs text-warning font-semibold mt-1.5 pr-1">
          لا يمكن تعديل اسم الأدوار الافتراضية.
        </p>
      </div>

      <div class="mt-6 flex justify-end gap-3 pt-3 border-t border-surface-border">
        <AppButton type="button" variant="secondary" @click="close">إلغاء</AppButton>
        <AppButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الدور' }}
        </AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: Boolean,
  initialData: {
    type: Object,
    default: () => null,
  },
  isSubmitting: Boolean,
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = ref({ id: null, name: '' })

const dialogTitle = computed(() => (props.initialData?.id ? 'تعديل اسم الدور' : 'إضافة دور جديد'))

const isDefaultRole = computed(() => {
  if (!form.value || !form.value.name) return false
  return ['Super Admin', 'Admin', 'User'].includes(form.value.name)
})

watch(
  () => props.initialData,
  (newData) => {
    form.value = newData ? { ...newData } : { id: null, name: '' }
  },
  { immediate: true, deep: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
