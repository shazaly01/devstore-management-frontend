<!--src\views\items\components\ItemUnitBarcodes.vue---->
<template>
  <div class="space-y-4">
    <!-- إرشادات وحقل المسح السريع الفسيح -->
    <div class="p-4 bg-surface-ground/50 rounded-xl border border-surface-border space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <label
          for="barcode-scanner-input"
          class="text-xs font-black text-text-primary flex items-center gap-2 cursor-pointer"
        >
          <span class="text-sm">🏷️</span>
          <span>مسح الباركودات أو إدخالها يدوياً</span>
        </label>
        <span class="text-[11px] font-bold text-text-muted flex items-center gap-1">
          <span>يدعم قارئ الباركود (Barcode Scanner) والضغط على</span>
          <kbd
            class="px-1.5 py-0.5 bg-surface-section border border-surface-border rounded text-[10px] font-mono font-bold text-text-primary"
            >Enter ↩</kbd
          >
        </span>
      </div>

      <!-- حقل المسح مع زر الإضافة المدمج -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <input
            id="barcode-scanner-input"
            v-model="newBarcode"
            @keydown.enter.prevent="addBarcodeTag"
            type="text"
            placeholder="امسح الباركود هنا مباشرة بالإسكانر أو اكتب الرقم..."
            class="block w-full h-11 pr-10 pl-24 border border-surface-border rounded-lg bg-surface-section text-text-primary text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
          />
          <!-- أيقونة الباركود التوضيحية يمين الحقل -->
          <span
            class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none select-none text-sm"
          >
            🛒
          </span>
          <!-- تلميح الـ Enter يسار الحقل -->
          <span
            class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-muted bg-surface-ground px-2 py-1 rounded border border-surface-border pointer-events-none select-none"
          >
            Enter ↩
          </span>
        </div>

        <button
          type="button"
          @click="addBarcodeTag"
          :disabled="!newBarcode.trim()"
          class="h-11 px-5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <span>+</span>
          <span>إضافة باركود</span>
        </button>
      </div>
    </div>

    <!-- قائمة وسوم الباركودات المسجلة للوحدة -->
    <div class="space-y-2.5">
      <div class="flex items-center justify-between text-xs font-bold text-text-secondary px-1">
        <span>الباركودات المرتبطة بهذه الوحدة:</span>
        <span
          class="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 text-[11px]"
        >
          الإجمالي: {{ props.modelValue ? props.modelValue.length : 0 }}
        </span>
      </div>

      <!-- منطقة عرض الوسوم -->
      <div
        v-if="props.modelValue && props.modelValue.length > 0"
        class="flex flex-wrap gap-2.5 p-3.5 bg-surface-ground/30 rounded-xl border border-surface-border min-h-[70px] max-h-[240px] overflow-y-auto custom-scrollbar"
      >
        <span
          v-for="(bc, bIdx) in props.modelValue"
          :key="bIdx"
          class="inline-flex items-center gap-2.5 px-3 py-1.5 bg-surface-section text-text-primary font-mono text-xs font-bold rounded-lg border border-surface-border shadow-xs transition-all hover:border-danger/40 hover:bg-surface-ground group"
        >
          <span class="text-text-muted text-[11px]">#{{ bIdx + 1 }}</span>
          <span class="tracking-wider">{{ bc }}</span>
          <button
            type="button"
            @click="removeBarcodeTag(bIdx)"
            class="text-text-muted hover:text-danger hover:bg-danger/10 w-5 h-5 rounded flex items-center justify-center text-xs font-black transition-colors cursor-pointer mr-0.5"
            title="حذف هذا الباركود"
          >
            ✕
          </button>
        </span>
      </div>

      <!-- حالة عدم وجود باركودات -->
      <div
        v-else
        class="text-center py-7 px-4 bg-surface-ground/20 rounded-xl border border-dashed border-surface-border text-text-muted space-y-1"
      >
        <p class="text-xs font-bold text-text-secondary">
          لا توجد باركودات مسجلة لهذه الوحدة حتى الآن
        </p>
        <p class="text-[11px] text-text-muted">
          قم بمسح الباركود باستخدام القارئ أو اكتبه يدوياً في الحقل أعلاه واضغط على زر الإضافة
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  modelValue: { type: Array, required: true, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])
const toast = useToast()
const newBarcode = ref('')

/**
 * إضافة تاق باركود جديد للوحدة النشطة تلقائياً فور صدور إشارة الـ Enter من الإسكانر
 */
const addBarcodeTag = () => {
  const code = newBarcode.value.trim()
  if (!code) return

  // منع تكرار نفس الباركود في نفس الوحدة لتفادي تضارب قواعد البيانات
  if (props.modelValue.includes(code)) {
    toast.warning('هذا الباركود مدرج مسبقاً لهذه الوحدة.')
    newBarcode.value = ''
    return
  }

  // تمرير المصفوفة الجديدة للأب للحفاظ على تدفق البيانات أحادي الاتجاه
  emit('update:modelValue', [...props.modelValue, code])
  newBarcode.value = ''
}

/**
 * إزالة تاق باركود معين وتحديث الحالة العلوية
 */
const removeBarcodeTag = (index) => {
  const updatedBarcodes = props.modelValue.filter((_, idx) => idx !== index)
  emit('update:modelValue', updatedBarcodes)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-surface-border));
  border-radius: 10px;
}
</style>
