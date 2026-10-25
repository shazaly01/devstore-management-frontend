<!-- src/components/forms/RolesDropdown.vue -->
<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-bold text-text-secondary mb-1">
      {{ label }}
    </label>
    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :required="required"
      class="block w-full rounded-md shadow-sm transition-all duration-200 bg-surface-section border border-surface-border text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm py-2 px-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      :disabled="loading"
    >
      <option value="" disabled class="bg-surface-section text-text-muted">اختر دورًا</option>
      <option v-if="loading" value="" disabled class="bg-surface-section text-text-muted">
        جاري تحميل الأدوار...
      </option>
      <option
        v-for="role in availableRoles"
        :key="role.id"
        :value="role.name"
        class="bg-surface-section text-text-primary"
      >
        {{ role.name }}
      </option>
    </select>
    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import { storeToRefs } from 'pinia'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'الدور' },
  modelValue: { type: String, default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const roleStore = useRoleStore()
const { roles, loading } = storeToRefs(roleStore)
const error = ref(null)

const availableRoles = computed(() => {
  return roles.value.filter((role) => role.name !== 'Super Admin')
})

onMounted(async () => {
  if (roles.value.length === 0) {
    try {
      await roleStore.fetchRoles()
    } catch (err) {
      error.value = 'فشل تحميل قائمة الأدوار.'
    }
  }
})
</script>
