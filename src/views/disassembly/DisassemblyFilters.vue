<!--src/views/disassembly/DisassemblyFilters.vue-->
<template>
  <div
    class="p-5 bg-surface-section rounded-xl border border-surface-border shadow-sm space-y-4 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- الصف الرئيسي: 4 أعمدة (البحث السريع + مستودع العملية + نطاق التواريخ) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- البحث السريع برقم المستند أو الملاحظات -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">البحث السريع</label>
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
            placeholder="رقم الإذن (DIS-...)، ملاحظات..."
            class="block w-full h-full pr-10 pl-3 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
          />
        </div>
      </div>

      <!-- مستودع العملية -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">مستودع العملية</label>
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
          <div class="w-full h-full pr-10 pl-2 flex items-center">
            <StoresDropdown
              id="disassembly-store-filter"
              v-model="storeFilter"
              variant="sales"
              class="w-full bg-transparent"
            />
          </div>
        </div>
      </div>

      <!-- من تاريخ -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">من تاريخ</label>
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
        >
          <input
            type="date"
            v-model="fromDate"
            class="block w-full h-full pr-4 pl-14 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />
          <span
            class="absolute left-3 text-text-muted pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>
      </div>

      <!-- إلى تاريخ -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">إلى تاريخ</label>
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
        >
          <input
            type="date"
            v-model="toDate"
            class="block w-full h-full pr-4 pl-14 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />
          <span
            class="absolute left-3 text-text-muted pointer-events-none flex items-center gap-1.5 text-xs z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import StoresDropdown from '@/components/forms/StoresDropdown.vue'

const search = defineModel('searchQuery', { type: String, default: '' })
const storeFilter = defineModel('storeFilter', { type: [String, Number], default: '' })
const fromDate = defineModel('fromDateFilter', { type: String, default: '' })
const toDate = defineModel('toDateFilter', { type: String, default: '' })
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
