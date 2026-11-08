<!-- src/views/settings/components/SettingFieldRenderer.vue -->
<template>
  <div class="font-sans text-right" dir="rtl">
    <!-- 1. نوع الحقل: قيمة منطقية (Boolean Switch) -->
    <div
      v-if="setting.type === 'boolean' || setting.type === 'bool'"
      class="flex items-center justify-between p-3.5 bg-surface-card border border-surface-border rounded-xl transition-all hover:border-primary/40 shadow-2xs"
    >
      <div class="space-y-1 pr-1 flex-1 pl-4">
        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-text-primary cursor-pointer select-none">
            {{ setting.label || setting.key }}
          </label>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors"
            :class="
              modelValue
                ? 'bg-success/15 text-success border border-success/30'
                : 'bg-surface-ground text-text-muted border border-surface-border'
            "
          >
            {{ modelValue ? 'مفعّل' : 'معطّل' }}
          </span>
        </div>
        <p v-if="setting.description" class="text-[11px] text-text-muted leading-relaxed">
          {{ setting.description }}
        </p>
      </div>

      <!-- مفتاح التبديل المنزلق (Toggle Switch) -->
      <button
        type="button"
        dir="ltr"
        role="switch"
        :aria-checked="!!modelValue"
        @click="modelValue = !modelValue"
        :class="modelValue ? 'bg-primary' : 'bg-surface-border dark:bg-slate-700'"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
      >
        <span
          :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        />
      </button>
    </div>

    <!-- 2. نوع الحقل: مصفوفة / شرائح JSON (مثل أرقام الهواتف أو القوائم) -->
    <div
      v-else-if="setting.type === 'json' || setting.type === 'array'"
      class="p-3.5 bg-surface-card border border-surface-border rounded-xl space-y-3 transition-all hover:border-primary/40 shadow-2xs"
    >
      <div class="space-y-0.5 pr-0.5">
        <label class="text-xs font-bold text-text-primary block">
          {{ setting.label || setting.key }}
        </label>
        <p v-if="setting.description" class="text-[11px] text-text-muted leading-relaxed">
          {{ setting.description }}
        </p>
      </div>

      <!-- شريط عرض الشرائح الحالية -->
      <div
        class="flex flex-wrap gap-2 min-h-9 p-2 bg-surface-ground/70 border border-surface-border rounded-lg items-center"
      >
        <span
          v-for="(chip, idx) in chipsList"
          :key="idx"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-card border border-surface-border text-primary font-mono text-xs font-bold rounded-lg shadow-2xs"
        >
          <span>{{ chip }}</span>
          <button
            type="button"
            @click="removeChip(idx)"
            class="text-text-muted hover:text-danger p-0.5 rounded transition-colors cursor-pointer"
            title="حذف هذا العنصر"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </span>

        <span
          v-if="chipsList.length === 0"
          class="text-text-muted text-[11px] font-medium pr-1 select-none"
        >
          لا توجد أرقام أو عناصر مضافة حالياً.
        </span>
      </div>

      <!-- حقل إدخال قيمة جديدة للشرائح -->
      <div class="flex items-center gap-2">
        <input
          type="text"
          v-model="newChipInput"
          @keydown.enter.prevent="addChip"
          placeholder="أدخل القيمة ثم اضغط Enter للإضافة..."
          class="flex-1 h-9 px-3 bg-surface-ground border border-surface-border focus:border-primary focus:bg-surface-card rounded-lg text-text-primary text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-2xs placeholder:text-text-muted"
        />
        <button
          type="button"
          @click="addChip"
          :disabled="!newChipInput.trim()"
          class="h-9 px-4 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
        >
          <span>+</span>
          <span>إضافة</span>
        </button>
      </div>
    </div>

    <!-- 3. نوع الحقل: رقمي أو نصي (String / Integer / Textarea) -->
    <div
      v-else
      class="p-3.5 bg-surface-card border border-surface-border rounded-xl space-y-2 transition-all hover:border-primary/40 shadow-2xs"
    >
      <div class="space-y-0.5 pr-0.5">
        <label class="text-xs font-bold text-text-primary block">
          {{ setting.label || setting.key }}
        </label>
        <p v-if="setting.description" class="text-[11px] text-text-muted leading-relaxed">
          {{ setting.description }}
        </p>
      </div>

      <!-- نص طويل (Textarea) للترويسة أو التذييل والملاحظات -->
      <textarea
        v-if="isLongTextField"
        v-model="modelValue"
        rows="3"
        class="block w-full p-2.5 bg-surface-ground border border-surface-border focus:border-primary focus:bg-surface-card rounded-lg text-text-primary text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none shadow-2xs placeholder:text-text-muted"
        placeholder="أدخل النص هنا..."
      ></textarea>

      <!-- حقل رقمي (Integer) -->
      <input
        v-else-if="setting.type === 'integer' || setting.type === 'int'"
        type="number"
        v-model.number="modelValue"
        class="block w-full h-9 px-3 bg-surface-ground border border-surface-border focus:border-primary focus:bg-surface-card rounded-lg text-text-primary font-mono text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-2xs"
      />

      <!-- حقل نصي قياسي (String) -->
      <input
        v-else
        type="text"
        v-model="modelValue"
        class="block w-full h-9 px-3 bg-surface-ground border border-surface-border focus:border-primary focus:bg-surface-card rounded-lg text-text-primary text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-2xs"
      />
    </div>

    <!-- رسالة خطأ التحقق إن وجدت -->
    <p v-if="error" class="text-danger text-[10px] font-bold mt-1 pr-2">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const modelValue = defineModel({ required: true })

const props = defineProps({
  setting: {
    type: Object,
    required: true,
  },
  error: {
    type: String,
    default: null,
  },
})

// تمييز ما إذا كان الحقل النصي يتطلب صندوق كتابة متعدد الأسطر
const isLongTextField = computed(() => {
  if (props.setting.type !== 'string') return false
  const key = props.setting.key?.toLowerCase() || ''
  return (
    key.includes('footer') ||
    key.includes('header') ||
    key.includes('notes') ||
    key.includes('address')
  )
})

// إدارة شرائح الـ JSON
const newChipInput = ref('')

const chipsList = computed(() => {
  if (Array.isArray(modelValue.value)) {
    return modelValue.value
  }
  if (typeof modelValue.value === 'string' && modelValue.value.trim().length > 0) {
    try {
      const parsed = JSON.parse(modelValue.value)
      return Array.isArray(parsed) ? parsed : [modelValue.value]
    } catch {
      return [modelValue.value]
    }
  }
  return []
})

const addChip = () => {
  const trimmed = newChipInput.value.trim()
  if (!trimmed) return

  const current = Array.isArray(chipsList.value) ? [...chipsList.value] : []
  if (!current.includes(trimmed)) {
    current.push(trimmed)
    modelValue.value = current
  }
  newChipInput.value = ''
}

const removeChip = (index) => {
  const current = [...chipsList.value]
  current.splice(index, 1)
  modelValue.value = current
}
</script>
