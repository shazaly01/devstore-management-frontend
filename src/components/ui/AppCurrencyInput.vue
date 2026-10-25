<!--src/components/ui/AppCurrencyInput.vue-->
<template>
  <div class="w-full">
    <div v-if="label" class="flex justify-between items-center mb-1">
      <label :for="id" :class="['block text-sm font-medium text-text-secondary', labelClass]">
        {{ label }}
      </label>
      <slot name="label-append"></slot>
    </div>

    <div class="relative w-full flex items-center">
      <!-- شارة العملة المخصصة -->
      <div
        v-if="hasSymbol"
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10 text-xs font-mono font-bold select-none text-text-muted"
      >
        <span>{{ displaySymbol }}</span>
      </div>

      <!-- حقل الإدخال الرقمي -->
      <input
        :id="id"
        ref="inputRef"
        type="text"
        :value="formattedValue"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        dir="ltr"
        inputmode="decimal"
        autocomplete="off"
        :class="[
          'block w-full rounded-md shadow-sm py-2 text-sm font-bold text-right font-mono transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed',
          hasSymbol ? 'pr-12 pl-3' : 'px-3',
          variant === 'sales'
            ? 'bg-transparent border-0 text-text-primary placeholder:text-text-muted focus:ring-0 p-0'
            : 'bg-surface-section border border-surface-border text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20',
          inputClass,
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { DEFAULT_CURRENCY } from '@/utils/formatters'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: [Number, String], default: null },
  symbol: { type: String, default: '' },
  showSymbol: { type: Boolean, default: false },
  placeholder: { type: String, default: '0.00' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  precision: { type: Number, default: 4 },
  labelClass: { type: String, default: '' },
  inputClass: { type: String, default: '' },
  variant: { type: String, default: 'default' },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputRef = ref(null)
const formattedValue = ref('')
const isFocused = ref(false)

const hasSymbol = computed(() => props.showSymbol || !!props.symbol)
const displaySymbol = computed(() => props.symbol || DEFAULT_CURRENCY)

const formatNumberWithCommas = (val) => {
  if (val === null || val === undefined || val === '') return ''
  const str = val.toString().replace(/,/g, '')
  const parts = str.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal === null || newVal === undefined || newVal === '') {
      formattedValue.value = ''
      return
    }
    const cleanCurrent = formattedValue.value.replace(/,/g, '')
    if (
      Number(cleanCurrent) !== Number(newVal) ||
      (!isFocused.value && cleanCurrent !== newVal.toString())
    ) {
      formattedValue.value = formatNumberWithCommas(newVal)
    }
  },
  { immediate: true },
)

const onInput = (event) => {
  let val = event.target.value
  val = val.replace(/[^0-9.]/g, '')

  const parts = val.split('.')
  if (parts.length > 2) {
    val = parts[0] + '.' + parts.slice(1).join('')
  }

  if (parts.length === 2 && parts[1].length > props.precision) {
    val = parts[0] + '.' + parts[1].substring(0, props.precision)
  }

  const formatted = formatNumberWithCommas(val)
  formattedValue.value = formatted

  if (val === '' || val === '.') {
    emit('update:modelValue', null)
  } else {
    emit('update:modelValue', Number(val))
  }

  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.value = formatted
    }
  })
}

const onFocus = (e) => {
  isFocused.value = true
  emit('focus', e)
}

const onBlur = (e) => {
  isFocused.value = false
  if (props.modelValue !== null && props.modelValue !== '') {
    formattedValue.value = formatNumberWithCommas(props.modelValue)
  }
  emit('blur', e)
}
</script>
