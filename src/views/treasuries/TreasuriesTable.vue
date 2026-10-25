<!--src/views/treasuries/TreasuriesTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="treasuries"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- تفاصيل الخزنة -->
      <template #cell-treasury_info="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.name }}
          </span>
          <span class="text-xs text-text-muted font-mono"> ID: #{{ item.id }} </span>
        </div>
      </template>

      <!-- الحساب المالي المرتبط بالشجرة -->
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

      <!-- الرصيد الحالي للخزنة -->
      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[120px] text-right" dir="rtl">
          <span class="text-xs text-text-muted mb-0.5">الرصيد الحالي:</span>
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

      <!-- حالة التنشيط -->
      <template #cell-status="{ item }">
        <div class="flex items-center">
          <AppBadge :variant="item.is_active ? 'success' : 'neutral'" size="xs" pill dot>
            {{ item.is_active ? 'نشطة' : 'غير نشطة' }}
          </AppBadge>
        </div>
      </template>

      <!-- الإجراءات المتاحة -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- تعديل الخزنة -->
          <button
            v-if="authStore.can('treasury.update')"
            @click="$emit('edit-treasury', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل الخزنة"
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

          <!-- حذف الخزنة -->
          <button
            v-if="authStore.can('treasury.delete')"
            @click="$emit('delete-treasury', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف الخزنة"
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

    <!-- مركب التنقل الرقمي -->
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
  treasuries: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-treasury', 'delete-treasury', 'row-clicked'])

const authStore = useAuthStore()

const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'treasury_info', label: 'تفاصيل الخزنة المادية', class: 'min-w-[200px]' },
    { key: 'accounting_info', label: 'الحساب المالي المرتبط بالشجرة' },
    { key: 'financials', label: 'الموقف المالي' },
    { key: 'status', label: 'الحالة' },
  ]

  if (authStore.can('treasury.update') || authStore.can('treasury.delete')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' })
  }
  return headers
})
</script>
