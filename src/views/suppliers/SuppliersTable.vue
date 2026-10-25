<!--src/views/suppliers/SuppliersTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="suppliers"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-supplier_info="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.name }}
          </span>

          <div v-if="item.phone" class="flex items-center gap-1 text-xs text-text-muted mt-0.5">
            <svg
              class="w-3.5 h-3.5 text-text-muted shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span class="font-mono">{{ item.phone }}</span>
          </div>

          <div v-if="item.tax_number" class="flex items-center gap-1 text-[11px] text-text-muted">
            <span
              class="bg-surface-ground px-1.5 py-0.5 rounded border border-surface-border text-[10px] text-text-secondary font-medium"
            >
              الرقم الضريبي: {{ item.tax_number }}
            </span>
          </div>
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
        <div class="flex flex-col justify-center min-w-[130px] text-right" dir="rtl">
          <span class="text-xs text-text-muted mb-0.5">الرصيد المستحق له:</span>
          <span
            :class="[
              'font-bold text-sm font-mono',
              item.current_balance >= 0 ? 'text-success' : 'text-danger',
            ]"
          >
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
            v-if="authStore.can('supplier.update')"
            @click="$emit('edit-supplier', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل المورد"
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
            v-if="authStore.can('supplier.delete')"
            @click="$emit('delete-supplier', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف المورد"
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
import AppBadge from '@/components/ui/AppBadge.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  suppliers: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-supplier', 'delete-supplier', 'row-clicked'])

const authStore = useAuthStore()

const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'supplier_info', label: 'تفاصيل بيانات المورد', class: 'min-w-[220px]' },
    { key: 'accounting_info', label: 'الحساب المالي المرتبط بالشجرة' },
    { key: 'financials', label: 'الحالة المالية للرصيد' },
    { key: 'status', label: 'الحالة' },
  ]

  if (authStore.can('supplier.update') || authStore.can('supplier.delete')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' })
  }
  return headers
})
</script>
