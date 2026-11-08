<!--src/components/ui/AppInput.vue-->
<template>
  <div>
    <div v-if="label" class="flex justify-between items-center mb-1">
      <label :for="id" class="block text-sm font-medium text-text-secondary">
        {{ label }}
      </label>
      <slot name="label-append"></slot>
    </div>
    <input
      :id="id"
      ref="inputRef"
      :type="type"
      :value="displayValue"
      @input="handleInput"
      @focus="handleFocus"
      @click="handleClick"
      @blur="handleBlur"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :dir="dir"
      :class="[
        'block w-full rounded-md py-2 px-3 transition-all duration-200 text-sm focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed',
        variant === 'sales'
          ? 'bg-transparent border-0 text-text-primary placeholder:text-text-muted focus:ring-0 p-0'
          : 'bg-surface-section border border-surface-border text-text-primary placeholder:text-text-muted shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20',
        inputClass,
      ]"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  dir: {
    type: String,
    default: null,
  },
  inputClass: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'default',
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'click'])

const inputRef = ref(null)
const isFocused = ref(false)
const internalValue = ref('')

const isNumeric = computed(() => {
  return props.type === 'number'
})

const isZero = (val) => {
  if (val === null || val === undefined || val === '') return false
  const str = String(val).trim()
  return str === '0' || str === '0.00' || str === '0.0' || Number(str) === 0
}

watch(
  () => props.modelValue,
  (newVal) => {
    // منع إعادة إدراج الصفر أثناء تركيز المستخدم على الحقل بعد تفريغه
    if (isFocused.value && isNumeric.value) {
      if (isZero(newVal) && internalValue.value === '') {
        return
      }
      if (Number(internalValue.value) === Number(newVal)) {
        return
      }
    }
    internalValue.value = newVal !== null && newVal !== undefined ? newVal : ''
  },
  { immediate: true },
)

const displayValue = computed(() => {
  return internalValue.value
})

/**
 * معالجة النقر والتركيز للحقول الرقمية:
 * 1. تفريغ الصفر فوراً إذا كانت القيمة 0 لتجهيز الحقل لكتابة نظيفة.
 * 2. تظليل وتحديد الرقم بالكامل إذا كان رقماً قديماً ليتم استبداله فور الضغط على أي مفتاح.
 */
const handleInteraction = (target) => {
  if (!isNumeric.value) return

  if (isZero(props.modelValue) || isZero(internalValue.value)) {
    internalValue.value = ''
    if (target) {
      target.value = ''
    }
  } else {
    nextTick(() => {
      target?.select()
    })
  }
}

const handleFocus = (event) => {
  isFocused.value = true
  handleInteraction(event.target)
  emit('focus', event)
}

const handleClick = (event) => {
  handleInteraction(event.target)
  emit('click', event)
}

const handleBlur = (event) => {
  isFocused.value = false

  if (isNumeric.value) {
    if (
      internalValue.value === '' ||
      internalValue.value === null ||
      internalValue.value === undefined
    ) {
      internalValue.value = 0
      emit('update:modelValue', 0)
    } else {
      internalValue.value = props.modelValue
    }
  }

  emit('blur', event)
}

const handleInput = (event) => {
  let val = event.target.value

  if (isNumeric.value) {
    // منع تكرار الأصفار البادئة (مثلاً كتابة 05 تصبح 5 مباشرة)
    if (/^0+[1-9]/.test(val)) {
      val = val.replace(/^0+/, '')
      event.target.value = val
    } else if (/^0{2,}$/.test(val)) {
      val = '0'
      event.target.value = val
    }
  }

  internalValue.value = val

  if (val === '' || val === null || val === undefined) {
    emit('update:modelValue', isNumeric.value ? 0 : '')
  } else {
    emit('update:modelValue', isNumeric.value ? (isNaN(Number(val)) ? val : Number(val)) : val)
  }
}
</script>
