<!--src\views\purchases\PurchaseTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="purchases"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- 1. بيانات الفاتورة والسند (المعرف + النوع + السداد + التاريخ والملاحظات) -->
      <template #cell-invoice_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              class="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded"
            >
              #{{ item.id }}
            </span>

            <span
              :class="[
                'px-2 py-0.5 text-[10px] font-black rounded border',
                item.invoice_type === 'purchase'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
              ]"
            >
              {{ item.invoice_type === 'purchase' ? 'فاتورة شراء' : 'مرتجع مشتريات' }}
            </span>

            <span
              :class="[
                'px-2 py-0.5 text-[10px] font-bold rounded-full',
                item.payment_type === 'cash'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
                  : 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
              ]"
            >
              {{ item.payment_type === 'cash' ? 'نقدي' : 'آجل' }}
            </span>
          </div>

          <div class="flex items-center gap-2 text-xs text-text-muted">
            <span class="font-mono">{{ formatDateOnly(item.invoice_date) }}</span>
            <span v-if="item.notes" class="truncate max-w-[180px] text-[11px]" :title="item.notes">
              • {{ item.notes }}
            </span>
          </div>
        </div>
      </template>

      <!-- 2. المورد والمستودع -->
      <template #cell-entities="{ item }">
        <div class="flex flex-col justify-center py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.supplier_name || item.supplier?.name || '-' }}
          </span>
          <span class="text-xs text-text-muted mt-0.5">
            {{ item.store_name || item.store?.name || '-' }}
          </span>
        </div>
      </template>

      <!-- 3. المبالغ المالية والخصومات -->
      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[110px] py-1">
          <span class="font-mono font-bold text-sm text-text-primary">
            {{ formatCurrency(item.grand_total || 0) }}
          </span>
          <span
            v-if="item.discount_amount"
            class="text-[10px] font-mono text-rose-600 dark:text-rose-400 mt-0.5"
          >
            خصم: {{ formatCurrency(item.discount_amount) }}
          </span>
        </div>
      </template>

      <!-- 4. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            @click.stop="$emit('edit-purchase', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors"
            title="تعديل الفاتورة بالكامل"
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
            @click.stop="$emit('delete-purchase', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            title="حذف وإلغاء المستند ماليًا ومخزنيًا"
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
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  purchases: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-purchase', 'delete-purchase', 'row-clicked'])

const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-'
  return String(dateStr).split(' ')[0].split('T')[0]
}

const tableHeaders = computed(() => [
  { key: 'invoice_info', label: 'بيانات الفاتورة والسند' },
  { key: 'entities', label: 'المورد / المستودع' },
  { key: 'financials', label: 'الإجمالي الصافي' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[80px]' },
])
</script>
