<!--src/views/vouchers/VoucherTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="vouchers"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-voucher_info="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <span class="font-bold text-text-primary text-base font-mono leading-tight">
            {{ item.voucher_number }}
          </span>
          <span class="text-xs text-text-muted"> مسلسل رقم: {{ item.voucher_sequence }} </span>
        </div>
      </template>

      <template #cell-type_badge="{ item }">
        <div class="flex items-center">
          <AppBadge
            :variant="item.voucher_type === 'receipt' ? 'success' : 'danger'"
            size="xs"
            pill
            dot
          >
            {{ item.voucher_type_lbl }}
          </AppBadge>
        </div>
      </template>

      <template #cell-accounting_info="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <!-- العنوان الرئيسي: يظهر اسم الحساب المساعد الفعلي (عميل/مورد/مصروف) مباشرة -->
          <span class="font-bold text-sm text-text-primary">
            {{ item.sub_ledger_name || item.account_name || '-' }}
          </span>
          <!-- العنوان الفرعي: يظهر الحساب التجميعي بالأسفل كمرجع محاسبي خفيف إذا كان الحساب المساعد معروضاً -->
          <span
            v-if="item.sub_ledger_name && item.account_name"
            class="text-[11px] text-text-muted mt-0.5"
          >
            {{ item.account_name }}
          </span>
        </div>
      </template>

      <template #cell-fund_info="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="text-xs font-bold text-text-secondary">
            {{ item.payment_method_lbl }}
          </span>
          <span class="text-xs text-text-muted mt-0.5 font-mono">
            {{ item.fund_account_name || '-' }}
          </span>
        </div>
      </template>

      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span
            :class="[
              'font-mono font-bold text-base',
              item.voucher_type === 'receipt' ? 'text-success' : 'text-danger',
            ]"
          >
            {{ item.voucher_type === 'receipt' ? '+' : '-' }} {{ formatCurrency(item.amount || 0) }}
          </span>
        </div>
      </template>

      <template #cell-date_info="{ item }">
        <div class="flex flex-col justify-center min-w-[140px] text-right" dir="rtl">
          <span class="text-xs text-text-primary font-mono">
            {{ item.voucher_date.split(' ')[0] }}
          </span>
          <span class="text-[11px] text-text-muted mt-0.5">
            بواسطة: {{ item.user_name || '-' }}
          </span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            @click="$emit('print-voucher', item)"
            class="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-ground rounded-lg transition-colors cursor-pointer"
            title="طباعة السند المالي المعتمد A5"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('voucher.update')"
            @click="$emit('edit-voucher', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل السند المالي"
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
            v-if="authStore.can('voucher.delete')"
            @click="$emit('delete-voucher', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف السند"
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

const props = defineProps({
  vouchers: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  hideTypeColumn: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-voucher', 'delete-voucher', 'row-clicked', 'print-voucher'])

const authStore = useAuthStore()

const tableHeaders = computed(() => {
  const headers = [{ key: 'voucher_info', label: 'رقم السند المالي', class: 'w-[150px]' }]

  if (!props.hideTypeColumn) {
    headers.push({ key: 'type_badge', label: 'طبيعة السند' })
  }

  headers.push(
    { key: 'accounting_info', label: 'الحساب المالي المستهدف' },
    { key: 'fund_info', label: 'طريقة النقدية / الصندوق' },
    { key: 'financials', label: 'المبلغ الإجمالي' },
    { key: 'date_info', label: 'تاريخ السند والمنشئ' },
    { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[120px]' },
  )

  return headers
})
</script>
