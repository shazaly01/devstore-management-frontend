<!--src\components\ui\AppCurrencyInput.vue--->
<template>
  <div class="w-full">
    <div v-if="label" class="flex justify-between items-center mb-1">
      <label
        :for="id"
        :class="[
          'block text-sm font-medium',
          labelClass,
          variant === 'sales' ? 'text-gray-300' : 'text-gray-700 dark:text-text-secondary',
        ]"
      >
        {{ label }}
      </label>
      <slot name="label-append"></slot>
    </div>

    <div class="relative w-full flex items-center">
      <!-- شارة العملة المخصصة (اختيارية) -->
      <div
        v-if="hasSymbol"
        :class="[
          'absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10 text-xs font-mono font-bold select-none',
          variant === 'sales' ? 'text-gray-400' : 'text-gray-500 dark:text-text-muted',
        ]"
      >
        <span>{{ displaySymbol }}</span>
      </div>

      <!-- حقل الإدخال الرقمي المنسق تلقائياً -->
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
            ? 'bg-[#25272e] border border-[#383b45] text-white placeholder:text-gray-500 focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] focus:shadow-[0_0_10px_rgba(224,94,43,0.3)]'
            : 'bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:placeholder:text-text-muted dark:focus:ring-2 dark:focus:ring-emerald-400 dark:focus:border-emerald-400 dark:shadow-[0_0_15px_rgba(52,211,153,0.1)]',
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

/**
 * تنسيق الرقم وإضافة فواصل الآلاف بدقة
 */
const formatNumberWithCommas = (val) => {
  if (val === null || val === undefined || val === '') return ''
  const str = val.toString().replace(/,/g, '')
  const parts = str.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/**
 * مزامنة القيمة الممررة من الخارج مع العرض الداخلي
 */
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

/**
 * معالجة الإدخال اللحظي مع الحفاظ على الفاصلة العشرية أثناء الكتابة
 */
const onInput = (event) => {
  let val = event.target.value

  // السماح بالأرقام والنقطة العشرية فقط
  val = val.replace(/[^0-9.]/g, '')

  // معالجة النقطة العشرية المتعددة
  const parts = val.split('.')
  if (parts.length > 2) {
    val = parts[0] + '.' + parts.slice(1).join('')
  }

  // تحديد عدد الخانات العشرية المسموح بها
  if (parts.length === 2 && parts[1].length > props.precision) {
    val = parts[0] + '.' + parts[1].substring(0, props.precision)
  }

  // تحديث القيمة المعروضة مع الفواصل
  const formatted = formatNumberWithCommas(val)
  formattedValue.value = formatted

  // استخراج القيمة الرقمية النظيفة وتمريرها للأب
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
