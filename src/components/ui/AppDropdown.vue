<!--src/components/ui/AppDropdown.vue-->
<template>
  <div class="relative w-full">
    <label v-if="label" :for="id" class="block text-sm font-medium mb-1 text-text-secondary">
      {{ label }}
    </label>

    <Dropdown
      :id="id"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="options"
      :option-label="optionLabel"
      :option-value="optionValue"
      :filter="true"
      :loading="loading"
      :required="required"
      :placeholder="placeholder"
      :show-clear="showClear"
      :disabled="disabled"
      appendTo="body"
      class="w-full"
      :pt="{
        root: ({ state }) => ({
          class: [
            'w-full inline-flex relative cursor-pointer select-none items-center h-full',
            props.variant === 'sales'
              ? 'bg-transparent border-0 shadow-none outline-none ring-0'
              : 'bg-surface-section border border-surface-border transition-colors duration-200 rounded-md shadow-sm hover:border-primary',
            state.focused && props.variant !== 'sales'
              ? 'border-primary ring-2 ring-primary/20 outline-none'
              : '',
            disabled ? 'opacity-60 cursor-not-allowed pointer-events-none bg-surface-ground' : '',
          ],
        }),
        input: {
          class: [
            'w-full bg-transparent border-0 focus:outline-none text-xs font-bold text-text-primary placeholder:text-text-muted',
            props.variant === 'sales' ? 'p-0 pr-1' : 'p-2',
          ],
        },
        trigger: {
          class: [
            'flex items-center justify-center shrink-0 text-text-muted',
            props.variant === 'sales' ? 'w-6 h-full' : 'w-12',
          ],
        },
        clearIcon: {
          class: [
            'mr-1 text-xs text-text-muted hover:text-text-primary',
            props.variant === 'sales' ? '' : 'mr-2',
          ],
        },
        panel: {
          class: [
            'bg-surface-section border border-surface-border rounded-xl shadow-2xl mt-1 overflow-hidden z-50',
          ],
        },
        header: {
          class: ['p-2 border-b border-surface-border bg-surface-ground'],
        },
        filterInput: {
          class: [
            'w-full p-2 border border-surface-border rounded-md bg-surface-section text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs font-medium',
          ],
        },
        list: {
          class: ['p-1 max-h-60 overflow-y-auto custom-scrollbar bg-surface-section relative z-10'],
        },
        item: ({ context }) => ({
          class: [
            'p-2 rounded-lg cursor-pointer overflow-hidden whitespace-nowrap text-xs transition-colors duration-150',
            !context.focused && !context.selected
              ? 'text-text-primary hover:bg-surface-ground'
              : '',
            context.focused && !context.selected ? 'bg-surface-ground text-text-primary' : '',
            context.selected ? 'bg-primary/10 text-primary font-bold' : '',
          ],
        }),
        itemGroup: {
          class: ['p-2 font-bold text-xs text-text-muted'],
        },
      }"
    />
  </div>
</template>

<script setup>
import Dropdown from 'primevue/dropdown'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, default: 'name' },
  optionValue: { type: String, default: 'id' },
  placeholder: { type: String, default: 'اختر...' },
  loading: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  showClear: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-surface-border));
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-text-muted));
}
</style>
