<!--src/views/expenses/ExpensesTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="expenses"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-expense_info="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.name }}
          </span>
          <span class="text-xs text-text-muted font-mono"> ID: #{{ item.id }} </span>
        </div>
      </template>

      <template #cell-accounting_info="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-medium text-sm text-text-primary">
            {{ item.account?.name || '-' }}
          </span>
          <span v-if="item.account?.code" class="text-xs text-text-muted font-mono">
            كود الحساب: {{ item.account.code }}
          </span>
        </div>
      </template>

      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[120px] text-right" dir="rtl">
          <span class="text-xs text-text-muted mb-0.5">إجمالي المصروفات:</span>
          <span class="font-bold text-sm font-mono text-danger">
            {{ formatCurrency(item.current_balance || 0) }}
          </span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <div class="flex items-center">
          <AppBadge :variant="item.is_active ? 'success' : 'neutral'" size="xs" pill dot>
            {{ item.is_active ? 'نشط' : 'غير نشط' }}
          </AppBadge>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('expense.update')"
            @click="$emit('edit-expense', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل البند"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('expense.delete')"
            @click="$emit('delete-expense', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف البند"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  expenses: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-expense', 'delete-expense', 'row-clicked'])

const authStore = useAuthStore()

const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'expense_info', label: 'بند المصروف الإداري', class: 'min-w-[200px]' },
    { key: 'accounting_info', label: 'الحساب المالي المرتبط بالشجرة' },
    { key: 'financials', label: 'الموقف المالي الحركي' },
    { key: 'status', label: 'الحالة' },
  ]

  if (authStore.can('expense.update') || authStore.can('expense.delete')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' })
  }
  return headers
})
</script>
