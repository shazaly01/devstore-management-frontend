<!--src/views/stock-adjustments/StockAdjustmentTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="adjustments"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-adjustment_number="{ item }">
        <AppBadge variant="primary" size="sm">
          {{ item.adjustment_number }}
        </AppBadge>
      </template>

      <template #cell-adjustment_info="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <div class="flex items-center gap-2">
            <span
              class="px-2 py-0.5 text-[10px] font-black rounded border bg-surface-ground text-text-primary border-surface-border"
            >
              تسلسل: {{ item.adjustment_sequence }}
            </span>
            <span class="text-xs text-text-muted font-mono">
              {{ item.adjustment_date.substr(0, 10) }}
            </span>
          </div>
          <span v-if="item.notes" class="text-xs text-text-muted max-w-[250px] truncate">
            {{ item.notes }}
          </span>
        </div>
      </template>

      <template #cell-store_info="{ item }">
        <div class="flex items-center gap-2 py-1 text-right" dir="rtl">
          <span class="inline-block w-1.5 h-1.5 bg-warning rounded-full"></span>
          <span class="font-bold text-xs text-text-primary">
            {{ item.store_name || '-' }}
          </span>
        </div>
      </template>

      <template #cell-operator_info="{ item }">
        <span class="text-xs text-text-secondary font-medium">
          {{ item.user_name || '-' }}
        </span>
      </template>

      <template #cell-journal_info="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span
            v-if="item.journal_entry_id"
            class="font-mono font-bold text-xs text-success flex items-center gap-1"
          >
            <span class="w-1.5 h-1.5 bg-success rounded-full"></span>
            قيد رقم: {{ item.journal_entry_no || item.journal_entry_id }}
          </span>
          <span v-else class="text-[11px] text-danger font-bold"> غير موجه محاسبياً </span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            @click="$emit('edit-adjustment', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل مستند التسوية بالكامل"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            @click="$emit('delete-adjustment', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف المستند وعكس أثره المالي والمخزني"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

defineProps({
  adjustments: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-adjustment', 'delete-adjustment', 'row-clicked'])

const tableHeaders = computed(() => [
  { key: 'adjustment_number', label: 'رقم مستند التسوية' },
  { key: 'adjustment_info', label: 'تفاصيل وبيان الدورة الجردية' },
  { key: 'store_info', label: 'المستودع المتأثر' },
  { key: 'operator_info', label: 'منشئ المستند' },
  { key: 'journal_info', label: 'التوجيه المالي والمحاسبي' },
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[90px]' },
])
</script>
