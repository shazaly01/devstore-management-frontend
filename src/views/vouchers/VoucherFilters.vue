<!--src/views/vouchers/VoucherFilters.vue-->
<template>
  <div
    class="p-5 bg-surface-section rounded-xl border border-surface-border shadow-sm space-y-4 text-right font-sans transition-colors duration-200 mb-6"
    dir="rtl"
  >
    <div
      class="grid grid-cols-1 gap-4"
      :class="hideTypeFilter ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'"
    >
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
            placeholder="رقم السند، البيان والشرح..."
            class="block w-full h-full pr-10 pl-3 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
          />
        </div>
      </div>

      <!-- 2. نوع السند (شرطي) -->
      <div v-if="!hideTypeFilter" class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">نوع السند</label>
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
            :value="voucherTypeFilter"
            @change="$emit('update:voucherTypeFilter', $event.target.value)"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">الكل (صرف وقبض)</option>
            <option value="payment" class="bg-surface-section text-text-primary">
              سندات صرف فقط
            </option>
            <option value="receipt" class="bg-surface-section text-text-primary">
              سندات قبض فقط
            </option>
          </select>
          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>

      <!-- 3. طريقة الدفع -->
      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-bold text-text-secondary pr-1">طريقة الدفع</label>
        <div
          class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
        >
          <span class="absolute right-3 text-primary pointer-events-none z-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </span>
          <select
            :value="paymentMethodFilter"
            @change="$emit('update:paymentMethodFilter', $event.target.value)"
            class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">الكل (نقدي وبنكي)</option>
            <option value="cash" class="bg-surface-section text-text-primary">نقدي (خزينة)</option>
            <option value="bank" class="bg-surface-section text-text-primary">بنكي (بنك)</option>
          </select>
          <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  voucherTypeFilter: {
    type: String,
    default: '',
  },
  paymentMethodFilter: {
    type: String,
    default: '',
  },
  hideTypeFilter: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:searchQuery', 'update:voucherTypeFilter', 'update:paymentMethodFilter'])
</script>
