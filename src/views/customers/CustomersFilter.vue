<!--src/views/customers/CustomersFilter.vue-->
<template>
  <AppCard class="mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end" dir="rtl">
      <!-- بحث سريع -->
      <div class="w-full">
        <label class="block font-semibold text-xs mb-2 text-text-secondary">بحث سريع</label>
        <div class="relative">
          <span
            class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted"
          >
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
            placeholder="اسم العميل، رقم الهاتف، البريد..."
            class="block w-full pr-10 pl-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xs font-semibold"
          />
        </div>
      </div>

      <!-- حالة العميل -->
      <div class="w-full">
        <label class="block font-semibold text-xs mb-2 text-text-secondary">حالة العميل</label>
        <div class="relative">
          <select
            :value="statusFilter"
            @change="$emit('update:statusFilter', $event.target.value)"
            class="block w-full pr-4 pl-10 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xs font-bold appearance-none cursor-pointer"
          >
            <option value="" class="bg-surface-section text-text-primary">الكل</option>
            <option value="1" class="bg-surface-section text-text-primary">نشط</option>
            <option value="0" class="bg-surface-section text-text-primary">غير نشط</option>
          </select>
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted text-[10px]"
          >
            ▼
          </div>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/ui/AppCard.vue'

defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  statusFilter: {
    type: String,
    default: '',
  },
})

defineEmits(['update:searchQuery', 'update:statusFilter'])
</script>
