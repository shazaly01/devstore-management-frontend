<!--src/views/purchases/PurchaseFilters.vue-->
<template>
  <div
    class="p-5 bg-surface-section rounded-xl border border-surface-border shadow-sm space-y-4 text-right font-sans transition-colors duration-200 mb-6"
    dir="rtl"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. البحث السريع -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">بحث سريع</label>
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
            placeholder="رقم الفاتورة، الملاحظات..."
            class="block w-full h-full pr-10 pl-3 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
          />
        </div>
      </div>

      <!-- 2. نوع المستند -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">نوع المستند</label>
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </span>
          <select
            :value="invoiceTypeFilter"
            @change="$emit('update:invoiceTypeFilter', $event.target.value)"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">الكل</option>
            <option value="purchase" class="bg-surface-section text-text-primary">
              فاتورة شراء
            </option>
            <option value="return" class="bg-surface-section text-text-primary">
              مرتجع مشتريات
            </option>
          </select>
          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>

      <!-- 3. المستودع -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">المستودع</label>
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
            :value="storeFilter"
            @change="$emit('update:storeFilter', $event.target.value)"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">كل المستودعات</option>
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

      <!-- 4. المورد المعتمد -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">المورد المعتمد</label>
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </span>
          <select
            :value="supplierFilter"
            @change="$emit('update:supplierFilter', $event.target.value)"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">كل الموردين</option>
            <option
              v-for="supplier in suppliers"
              :key="supplier.id"
              :value="supplier.id"
              class="bg-surface-section text-text-primary"
            >
              {{ supplier.name }}
            </option>
          </select>
          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: { type: String, default: '' },
  invoiceTypeFilter: { type: String, default: '' },
  storeFilter: { type: [String, Number], default: '' },
  supplierFilter: { type: [String, Number], default: '' },
  stores: { type: Array, default: () => [] },
  suppliers: { type: Array, default: () => [] },
})

defineEmits([
  'update:searchQuery',
  'update:invoiceTypeFilter',
  'update:storeFilter',
  'update:supplierFilter',
])
</script>
