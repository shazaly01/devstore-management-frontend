<!--src/components/ui/StatCard.vue-->
<template>
  <component
    :is="wrapperComponent"
    :to="to"
    class="relative p-6 rounded-2xl overflow-hidden transition-all duration-300 ease-in-out group border border-surface-border/60 shadow-sm"
    :class="[colorClasses.bg, { 'cursor-pointer': !!to }]"
  >
    <div class="relative z-10">
      <div class="flex items-center justify-between">
        <p class="font-bold text-sm text-text-secondary">{{ title }}</p>
        <component
          :is="icon"
          class="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
          :class="colorClasses.icon"
        />
      </div>
      <p class="text-4xl font-extrabold text-text-primary mt-4 font-mono">{{ value }}</p>
    </div>

    <!-- عنصر زخرفي في الخلفية متجاوب مع كلا الوضعين -->
    <div
      class="absolute -bottom-8 -end-8 opacity-10 dark:opacity-5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125 pointer-events-none"
      :class="colorClasses.icon"
    >
      <component :is="icon" class="w-32 h-32" />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  to: {
    type: [Object, String],
    required: false,
    default: null,
  },
  title: String,
  value: [String, Number],
  icon: [Object, Function],
  color: {
    type: String,
    default: 'primary',
  },
})

const wrapperComponent = computed(() => {
  return props.to ? RouterLink : 'div'
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'success':
      return {
        bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
        icon: 'text-emerald-600 dark:text-emerald-400',
      }
    case 'warning':
      return {
        bg: 'bg-amber-500/10 hover:bg-amber-500/15',
        icon: 'text-amber-600 dark:text-amber-400',
      }
    case 'danger':
      return {
        bg: 'bg-rose-500/10 hover:bg-rose-500/15',
        icon: 'text-rose-600 dark:text-rose-400',
      }
    default:
      return {
        bg: 'bg-primary/10 hover:bg-primary/15',
        icon: 'text-primary',
      }
  }
})
</script>
