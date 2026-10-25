<!--src/components/ui/AppButton.vue-->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    class="inline-flex items-center justify-center font-bold rounded-lg shadow-sm focus:outline-none transition-all duration-200 ease-in-out cursor-pointer"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, danger, warning, success, outline
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const buttonClasses = computed(() => {
  const classes = []

  // كلاسات الحجم
  if (props.size === 'sm') {
    classes.push('px-3 py-1.5 text-sm')
  } else if (props.size === 'lg') {
    classes.push('px-6 py-3 text-lg')
  } else {
    classes.push('px-4 py-2 text-base') // md (الافتراضي)
  }

  // كلاسات الأنماط والحالات الدلالية
  switch (props.variant) {
    case 'success':
      classes.push('bg-success text-white hover:opacity-90 focus:ring-2 focus:ring-success/50')
      break

    case 'warning':
      classes.push('bg-warning text-white hover:opacity-90 focus:ring-2 focus:ring-warning/50')
      break

    case 'danger':
      classes.push('bg-danger text-white hover:opacity-90 focus:ring-2 focus:ring-danger/50')
      break

    case 'secondary':
      classes.push(
        'bg-surface-section text-text-primary border border-surface-border hover:bg-surface-ground focus:ring-2 focus:ring-surface-border',
      )
      break

    case 'outline':
      classes.push(
        'bg-transparent border border-surface-border text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 focus:ring-2 focus:ring-primary/30',
      )
      break

    default: // primary
      classes.push(
        'bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20 focus:ring-2 focus:ring-primary/40',
      )
      break
  }

  // حالة التعطيل وتأثير الحركة
  if (props.disabled) {
    classes.push('opacity-50 cursor-not-allowed pointer-events-none')
  } else {
    classes.push('hover:-translate-y-0.5 active:translate-y-0')
  }

  return classes.join(' ')
})
</script>
