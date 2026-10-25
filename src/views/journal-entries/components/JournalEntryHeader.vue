<!--src/views/journal-entries/JournalEntryHeader.vue-->
<template>
  <div
    class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 text-right items-end transition-all duration-200"
    dir="rtl"
  >
    <!-- رقم السند / القيد -->
    <div class="flex flex-col space-y-1.5">
      <label class="text-[11px] font-black text-text-secondary">رقم السند / القيد *</label>
      <input
        type="text"
        v-model="formData.entry_number"
        placeholder="أدخل رقم القيد المالي..."
        class="block w-full h-10 px-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary placeholder:text-text-muted focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-bold outline-none transition-all shadow-sm"
      />
      <p v-if="getFieldError('entry_number')" class="text-danger text-[10px] font-bold mt-0.5">
        {{ getFieldError('entry_number') }}
      </p>
    </div>

    <!-- نوع المعاملة -->
    <div class="flex flex-col space-y-1.5">
      <label class="text-[11px] font-black text-text-secondary">نوع المعاملة *</label>
      <div class="relative w-full">
        <select
          v-model="formData.type"
          class="block w-full h-10 pr-3 pl-8 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-bold outline-none transition-all appearance-none cursor-pointer shadow-sm"
        >
          <option value="journal" class="bg-surface-section text-text-primary">
            قيد يومية عام (Journal)
          </option>
          <option value="receipt" class="bg-surface-section text-text-primary">
            سند قبض (Receipt)
          </option>
          <option value="payment" class="bg-surface-section text-text-primary">
            سند صرف (Payment)
          </option>
        </select>
        <span
          class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[10px]"
          >▼</span
        >
      </div>
      <p v-if="getFieldError('type')" class="text-danger text-[10px] font-bold mt-0.5">
        {{ getFieldError('type') }}
      </p>
    </div>

    <!-- تاريخ الحركة المالية -->
    <div class="flex flex-col space-y-1.5">
      <label class="text-[11px] font-black text-text-secondary">تاريخ الحركة المالية *</label>
      <input
        type="date"
        v-model="formData.entry_date"
        class="block w-full h-10 px-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-bold font-mono outline-none transition-all cursor-pointer shadow-sm"
      />
      <p v-if="getFieldError('entry_date')" class="text-danger text-[10px] font-bold mt-0.5">
        {{ getFieldError('entry_date') }}
      </p>
    </div>
  </div>
</template>

<script setup>
const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}
</style>
