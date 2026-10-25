<!--src/views/inventory/StockAdjustmentFilters.vue-->
<template>
  <div
    class="p-5 bg-surface-section rounded-xl border border-surface-border shadow-sm space-y-4 text-right font-sans transition-colors duration-200 mb-6"
    dir="rtl"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- 1. البحث السريع الجردي -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">البحث السريع الجردي</label>
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
        >
          <span class="absolute right-3 text-text-muted pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            v-model="search"
            placeholder="رقم مستند التسوية، ملاحظات الدورة..."
            class="block w-full h-full pr-10 pl-3 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
          />
        </div>
      </div>

      <!-- 2. مستودع الفحص -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">مستودع الفحص</label>
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
        >
          <span class="absolute right-3 text-text-muted pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>
          <select
            v-model="storeFilter"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">
              كل المستودعات المعتمدة
            </option>
            <option
              v-for="store in stores"
              :key="store.id"
              :value="store.id"
              class="bg-surface-section text-text-primary"
            >
              {{ store.name }}
            </option>
          </select>
          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const search = defineModel('searchQuery', { type: String, default: '' })
const storeFilter = defineModel('storeFilter', { type: [String, Number], default: '' })

defineProps({
  stores: { type: Array, required: true },
})
</script>
