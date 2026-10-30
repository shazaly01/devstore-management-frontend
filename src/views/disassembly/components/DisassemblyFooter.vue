<!--src/views/disassembly/components/DisassemblyFooter.vue-->
<template>
  <div
    class="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- 1. ميزان الأوزان (التدقيق اللوجستي) -->
    <div
      class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2.5 text-xs font-semibold text-text-secondary">
        <div class="flex items-center justify-between border-b border-surface-border pb-2">
          <h3 class="text-[11px] font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
            ميزان الأوزان ومطابقة الكميات
          </h3>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded border"
            :class="
              weightDifference === 0
                ? 'bg-success/10 text-success border-success/30'
                : 'bg-warning/10 text-warning border-warning/30'
            "
          >
            {{ weightDifference === 0 ? 'موزون تماماً' : 'يوجد فارق وزن' }}
          </span>
        </div>

        <div class="flex justify-between border-b border-surface-border/60 pb-1.5">
          <span>وزن الخام المصروف:</span>
          <span class="font-mono font-bold text-text-primary">
            {{ formatQty(sourceQuantity) }} كجم
          </span>
        </div>

        <div class="flex justify-between border-b border-surface-border/60 pb-1.5 text-info">
          <span>مجموع أوزان النواتج (+):</span>
          <span class="font-mono font-bold"> {{ formatQty(totalOutputsWeight) }} كجم </span>
        </div>

        <!-- حقل إدخال الهالك الفعلي (سوائل، تنظيف، فاقد عظم) -->
        <div class="flex items-center justify-between border-b border-surface-border/60 pb-1.5">
          <span class="text-danger font-bold">وزن الهالك / الفاقد (+):</span>
          <div class="w-24">
            <input
              type="number"
              step="0.0001"
              min="0"
              v-model.number="wasteModel"
              @input="$emit('recalculate')"
              class="w-full h-7 px-2 text-center font-mono font-bold text-xs bg-surface-ground border border-surface-border focus:border-danger rounded text-danger outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div class="pt-2">
        <div
          class="flex justify-between items-center p-2.5 rounded-lg border shadow-sm transition-colors"
          :class="
            weightDifference === 0
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-warning/10 border-warning/30 text-warning'
          "
        >
          <span class="font-black text-[11px]">فارق الميزان المعلق:</span>
          <span class="text-base font-mono font-black">
            {{ formatQty(weightDifference) }} كجم
          </span>
        </div>
        <p v-if="getFieldError('waste_quantity')" class="text-danger text-[10px] font-bold mt-1">
          {{ getFieldError('waste_quantity') }}
        </p>
      </div>
    </div>

    <!-- 2. ميزان التكاليف (التدقيق المالي والمخزني) -->
    <div
      class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm flex flex-col justify-between space-y-3"
    >
      <div class="space-y-2.5 text-xs font-semibold text-text-secondary">
        <div class="flex items-center justify-between border-b border-surface-border pb-2">
          <h3 class="text-[11px] font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
            ميزان التكلفة وسلامة المخزون
          </h3>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded bg-success/10 text-success border border-success/30"
          >
            امتصاص كامل 100%
          </span>
        </div>

        <div class="flex justify-between border-b border-surface-border/60 pb-1.5">
          <span>إجمالي تكلفة الخام المصروف:</span>
          <span class="font-mono font-bold text-text-primary">
            {{ formatCurrency(sourceTotalCost) }}
          </span>
        </div>

        <div class="flex justify-between border-b border-surface-border/60 pb-1.5 text-success">
          <span>إجمالي التكلفة الموزعة للنواتج:</span>
          <span class="font-mono font-bold">
            {{ formatCurrency(totalAllocatedCost) }}
          </span>
        </div>

        <div class="flex justify-between border-b border-surface-border/60 pb-1.5 text-text-muted">
          <span>فروقات كسور التكلفة:</span>
          <span class="font-mono font-bold">
            {{ formatCurrency(costDifference) }}
          </span>
        </div>
      </div>

      <div class="pt-2">
        <div
          class="flex justify-between items-center bg-primary/10 border border-primary/30 p-2.5 rounded-lg text-primary shadow-sm"
        >
          <span class="font-black text-[11px]">صافي التكلفة المعتمدة:</span>
          <span class="text-lg font-mono font-black tracking-wide">
            {{ formatCurrency(totalAllocatedCost) }}
          </span>
        </div>
        <p class="text-[10px] text-text-muted mt-1 leading-relaxed">
          توزع التكلفة آلياً بنسب القيمة البيعية مع تحميل فاقد التنظيف والهالك على الأجزاء الصالحة.
        </p>
      </div>
    </div>

    <!-- 3. ملاحظات وشروط التشغيل -->
    <div
      class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm flex flex-col space-y-1.5"
    >
      <label
        class="text-[11px] font-black text-text-primary border-b border-surface-border pb-2 mb-1 flex items-center gap-1.5"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
        ملاحظات وتوجيهات أمر التفكيك
      </label>
      <textarea
        v-model="notesModel"
        rows="4"
        placeholder="سجل أي ملاحظات خاصة بوردية التقطيع، أسباب زيادة الهالك، أو أرقام الباتشات..."
        class="block w-full h-full min-h-[110px] p-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary placeholder:text-text-muted text-xs font-semibold focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
      ></textarea>
      <p v-if="getFieldError('notes')" class="text-danger text-[10px] font-bold mt-1">
        {{ getFieldError('notes') }}
      </p>
    </div>
  </div>
</template>

<script setup>
const wasteModel = defineModel('wasteQuantity', { type: Number, default: 0 })
const notesModel = defineModel('notes', { type: String, default: '' })

const props = defineProps({
  sourceQuantity: { type: Number, default: 0 },
  totalOutputsWeight: { type: Number, default: 0 },
  weightDifference: { type: Number, default: 0 },
  sourceTotalCost: { type: Number, default: 0 },
  totalAllocatedCost: { type: Number, default: 0 },
  costDifference: { type: Number, default: 0 },
  validationErrors: { type: Object, default: () => null },
})

defineEmits(['recalculate'])

const formatCurrency = (amount) => {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatQty = (amount) => {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value)
}

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
