<!-- src/views/roles/PermissionsModal.vue -->
<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4"
    @click.self="close"
  >
    <div
      class="bg-surface-section border border-surface-border rounded-xl shadow-2xl p-6 w-full max-w-3xl transform transition-all duration-300 scale-95 text-right font-sans"
      :class="{ 'scale-100': modelValue }"
      dir="rtl"
    >
      <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
        <h3 class="text-lg font-bold text-text-primary">
          تعديل صلاحيات دور: <span class="font-bold text-primary">{{ role?.name }}</span>
        </h3>
        <button
          @click="close"
          class="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-ground transition-colors cursor-pointer text-xl leading-none"
        >
          &times;
        </button>
      </div>

      <div class="max-h-[60vh] overflow-y-auto pr-1">
        <PermissionsChecklist v-model:selectedPermissions="selectedPermissions" />
      </div>

      <div class="mt-8 flex justify-end gap-3 pt-3 border-t border-surface-border">
        <AppButton type="button" variant="secondary" @click="close"> إلغاء </AppButton>
        <AppButton @click="handleSave" :disabled="isSaving">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>حفظ الصلاحيات</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import PermissionsChecklist from '@/components/forms/PermissionsChecklist.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  role: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

const selectedPermissions = ref([])

watch(
  () => props.role,
  (newRole) => {
    if (newRole && props.modelValue) {
      selectedPermissions.value = newRole.permissions ? newRole.permissions.map((p) => p.name) : []
    }
  },
  { immediate: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleSave = () => {
  if (!props.role) return

  const payload = {
    id: props.role.id,
    name: props.role.name,
    permissions: selectedPermissions.value,
  }
  emit('save', payload)
}
</script>
