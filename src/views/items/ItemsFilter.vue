<!--src/views/items/ItemsFilter.vue-->
<template>
  <div
    class="p-5 bg-surface-section rounded-xl border border-surface-border shadow-sm space-y-4 text-right font-sans transition-colors duration-200 mb-6"
    dir="rtl"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- 1. المخزن المراد البحث فيه -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1"
          >المخزن المراد البحث فيه</label
        >
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
              id="filter-store-id"
              :model-value="storeId"
              @update:model-value="$emit('update:storeId', $event)"
              variant="sales"
              class="w-full bg-transparent"
            />
          </div>
        </div>
      </div>

      <!-- 2. بحث ذكي سريع (يمتد على عمودين) -->
      <div class="flex flex-col space-y-1 sm:col-span-2 lg:col-span-2">
        <label class="text-[11px] font-bold text-text-secondary pr-1">بحث ذكي سريع</label>
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
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            type="text"
            placeholder="ابحث باسم الصنف، أو مرر جهاز قراءة الباركود..."
            class="block w-full h-full pr-10 pl-3 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
          />
        </div>
      </div>

      <!-- 3. طبيعة الصنف -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">طبيعة الصنف</label>
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </span>
          <select
            :value="typeFilter"
            @change="$emit('update:typeFilter', $event.target.value)"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">الكل</option>
            <option value="product" class="bg-surface-section text-text-primary">صنف مخزني</option>
            <option value="service" class="bg-surface-section text-text-primary">
              خدمة / صيانة
            </option>
            <option value="raw_material" class="bg-surface-section text-text-primary">
              مادة خام
            </option>
          </select>
          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>

      <!-- 4. الحالة الإدارية -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">الحالة الإدارية</label>
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
        >
          <span class="absolute right-3 text-text-muted pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <select
            :value="statusFilter"
            @change="$emit('update:statusFilter', $event.target.value)"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">الكل</option>
            <option value="1" class="bg-surface-section text-text-primary">نشط وقابل للبيع</option>
            <option value="0" class="bg-surface-section text-text-primary">موقوف مؤقتاً</option>
          </select>
          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import StoresDropdown from '@/components/forms/StoresDropdown.vue'

defineProps({
  storeId: { type: [String, Number], default: '' },
  searchQuery: { type: String, default: '' },
  typeFilter: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
})

defineEmits(['update:storeId', 'update:searchQuery', 'update:typeFilter', 'update:statusFilter'])
</script>
