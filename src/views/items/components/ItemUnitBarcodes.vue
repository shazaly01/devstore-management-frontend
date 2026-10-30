<!--src\views\items\components\ItemUnitBarcodes.vue---->
<template>
  <div class="space-y-3">
    <!-- ترويسة حقل الباركود -->
    <div class="flex items-center justify-between border-b border-surface-border pb-2.5">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-primary"></span>
        <label
          for="barcode-scanner-input"
          class="text-xs font-black text-text-primary cursor-pointer"
        >
          الباركودات المرتبطة بالوحدة
        </label>
      </div>
      <span class="text-[10px] text-text-muted font-bold"> مسح مباشر بالإسكانر 🛒 </span>
    </div>

    <!-- حقل المسح والإدخال السريع -->
    <div class="relative">
      <input
        id="barcode-scanner-input"
        v-model="newBarcode"
        @keydown.enter.prevent="addBarcodeTag"
        type="text"
        placeholder="امسح الباركود هنا ثم اضغط Enter..."
        class="block w-full h-10 pl-20 pr-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary text-xs font-mono font-bold outline-none focus:bg-surface-section focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
      <span
        class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-muted bg-surface-section px-2 py-0.5 rounded border border-surface-border pointer-events-none select-none"
      >
        Enter ↩
      </span>
    </div>

    <!-- قائمة وسوم الباركودات المضافة -->
    <div class="space-y-2 pt-1">
      <div class="text-[11px] font-bold text-text-secondary">
        الباركودات المسجلة ({{ props.modelValue ? props.modelValue.length : 0 }}):
      </div>

      <div class="flex flex-wrap gap-2 max-h-[280px] overflow-y-auto custom-scrollbar p-1">
        <span
          v-for="(bc, bIdx) in props.modelValue"
          :key="bIdx"
          class="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-section text-text-primary font-mono text-xs font-bold rounded-lg border border-surface-border shadow-xs transition-colors hover:border-danger/50"
        >
          <span>{{ bc }}</span>
          <button
            type="button"
            @click="removeBarcodeTag(bIdx)"
            class="text-text-muted hover:text-danger text-xs font-black transition-colors cursor-pointer mr-0.5"
            title="إزالة هذا الباركود"
          >
            ✕
          </button>
        </span>

        <p
          v-if="!props.modelValue || props.modelValue.length === 0"
          class="text-xs text-text-muted italic py-3"
        >
          لم يتم ربط أي باركود مخصص لهذه الوحدة بعد.
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
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-surface-border));
  border-radius: 10px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-surface-border));
}
</style>
