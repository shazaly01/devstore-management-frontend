<!--src/components/ui/AppConfirmDialog.vue-->
<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div
      class="bg-surface-section border border-surface-border rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300 scale-95 text-right font-sans"
      :class="{ 'scale-100': isOpen }"
      dir="rtl"
    >
      <h3 class="text-lg font-bold text-text-primary mb-2">{{ title }}</h3>
      <p class="text-xs leading-relaxed text-text-secondary mb-6">{{ message }}</p>
      <div class="flex justify-end space-x-2 space-x-reverse">
        <AppButton variant="outline" size="sm" @click="cancel">إلغاء</AppButton>
        <AppButton variant="danger" size="sm" @click="confirm">تأكيد</AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppButton from './AppButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'تأكيد الإجراء',
  },
  message: {
    type: String,
    default: 'هل أنت متأكد من أنك تريد تنفيذ هذا الإجراء؟',
  },
})

const emit = defineEmits(['update:modelValue', 'confirmed'])

const isOpen = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue
  },
)

const confirm = () => {
  isOpen.value = false
  emit('update:modelValue', false)
  emit('confirmed', true)
}

const cancel = () => {
  isOpen.value = false
  emit('update:modelValue', false)
}
</script>
