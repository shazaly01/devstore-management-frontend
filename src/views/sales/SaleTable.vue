<!--src/views/sales/SaleTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="sales"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-id="{ item }">
        <AppBadge variant="primary" size="sm"> #{{ item.id }} </AppBadge>
      </template>

      <template #cell-invoice_info="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <div class="flex items-center gap-2">
            <AppBadge :variant="item.invoice_type === 'sale' ? 'success' : 'danger'" size="xs">
              {{ item.invoice_type === 'sale' ? 'فاتورة مبيعات' : 'مردودات مبيعات' }}
            </AppBadge>
            <span class="text-xs text-text-secondary font-mono font-semibold">{{
              item.invoice_date.substr(0, 10)
            }}</span>
          </div>
          <span v-if="item.notes" class="text-xs text-text-muted max-w-[200px] truncate">
            {{ item.notes }}
          </span>
        </div>
      </template>

      <template #cell-entities="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-bold text-xs text-text-primary">
            العميل: {{ item.customer_name || item.customer?.name || '-' }}
          </span>
          <span v-if="item.customer_name_text" class="font-bold text-xs text-primary mt-0.5">
            {{ item.customer_name_text }}
          </span>
        </div>
      </template>

      <template #cell-sale_type="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="item.sale_type === 'indoor' ? 'info' : 'warning'" size="xs" pill>
            {{ item.sale_type === 'indoor' ? 'indoor' : 'outdoor' }}
          </AppBadge>
        </div>
      </template>

      <template #cell-payment_type="{ item }">
        <div class="flex flex-col items-center justify-center gap-1" dir="rtl">
          <AppBadge :variant="getPaymentVariant(item)" size="xs" pill>
            {{ getPaymentLabel(item) }}
          </AppBadge>
          <span
            v-if="item.invoice_type === 'sale' && getSalePaymentParts(item).length > 1"
            class="text-[10px] leading-relaxed text-text-muted text-center max-w-[180px]"
          >
            {{ getPaymentBreakdown(item) }}
          </span>
        </div>
      </template>

      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[130px] text-right" dir="rtl">
          <div class="flex justify-between text-[11px] text-text-secondary font-medium">
            <span>الصافي الفعلي:</span>
            <span class="font-mono font-bold text-success">
              {{ formatCurrency(item.grand_total || 0) }}
            </span>
          </div>
          <div
            class="flex justify-between text-[10px] text-text-muted mt-0.5 border-t border-surface-border pt-0.5"
          >
            <span>الخصم الممنوح:</span>
            <span class="font-mono font-bold text-danger">
              {{ formatCurrency(item.discount_amount || 0) }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="item.invoice_type === 'sale'"
            @click="$emit('return-sale', item)"
            class="p-1.5 text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
            title="إصدار مستند مردود مبيعات لهذه الفاتورة"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>

          <button
            @click="$emit('print-sale', item)"
            class="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors cursor-pointer"
            title="طباعة الفاتورة للعميل A4"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>

          <button
            @click="$emit('edit-sale', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل الفاتورة بالكامل"
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
            @click="$emit('delete-sale', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="إلغاء وحذف المستند ماليًا ومخزنيًا"
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
import AppPagination from '@/components/ui/AppPagination.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { formatCurrency } from '@/utils/formatters'

defineProps({
  sales: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-sale', 'delete-sale', 'row-clicked', 'print-sale', 'return-sale'])

const tableHeaders = computed(() => [
  { key: 'id', label: 'المعرف المالي' },
  { key: 'invoice_info', label: 'طبيعة وتاريخ السند' },
  { key: 'entities', label: 'الجهات ذات الصلة' },
  { key: 'sale_type', label: 'نوع البيع', class: 'text-center' },
  { key: 'payment_type', label: 'طريقة الدفع' },
  { key: 'financials', label: 'الحساب المالي والتدقيق' },
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[110px]' },
])

const getSalePaymentParts = (item) => {
  if (item.invoice_type !== 'sale') return []

  const grandTotal = Number(item.grand_total) || 0
  const hasExplicitAmounts =
    (item.cash_amount !== null && item.cash_amount !== undefined) ||
    (item.bank_amount !== null && item.bank_amount !== undefined)

  let cashAmount
  let bankAmount
  let remainingAmount

  if (hasExplicitAmounts) {
    cashAmount = Number(item.cash_amount) || 0
    bankAmount = Number(item.bank_amount) || 0
    remainingAmount =
      item.remaining_amount !== null && item.remaining_amount !== undefined
        ? Number(item.remaining_amount) || 0
        : Math.max(0, grandTotal - cashAmount - bankAmount)
  } else {
    // توافق احتياطي مع استجابة API القديمة التي لا تتضمن حقول المبالغ المفصلة.
    cashAmount = item.payment_type === 'cash' ? grandTotal : 0
    bankAmount = item.payment_type === 'card' ? grandTotal : 0
    remainingAmount =
      item.payment_type === 'credit'
        ? grandTotal
        : Math.max(0, grandTotal - cashAmount - bankAmount)
  }

  const parts = []
  if (cashAmount > 0) parts.push({ label: 'نقدي', amount: cashAmount })
  if (bankAmount > 0) parts.push({ label: 'بنكي', amount: bankAmount })
  if (remainingAmount > 0) parts.push({ label: 'آجل', amount: remainingAmount })

  return parts
}

const getPaymentLabel = (item) => {
  if (item.invoice_type !== 'sale') {
    return (
      item.payment_type_lbl ||
      (item.payment_type === 'cash' ? 'نقدي' : item.payment_type === 'card' ? 'بنكي' : 'آجل / ذمم')
    )
  }

  const parts = getSalePaymentParts(item)
  if (parts.length > 1) return 'مقسّم'
  if (parts.length === 1) return parts[0].label

  return item.payment_type_lbl || 'غير محدد'
}

const getPaymentVariant = (item) => {
  if (item.invoice_type !== 'sale') {
    return item.payment_type === 'cash'
      ? 'success'
      : item.payment_type === 'card'
        ? 'info'
        : 'warning'
  }

  const parts = getSalePaymentParts(item)
  if (parts.length > 1) return 'warning'
  if (parts.length === 0) {
    return item.payment_type === 'cash'
      ? 'success'
      : item.payment_type === 'card'
        ? 'info'
        : 'warning'
  }
  if (parts[0].label === 'نقدي') return 'success'
  if (parts[0].label === 'بنكي') return 'info'
  return 'warning'
}

const formatPaymentAmount = (amount) => {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)
}

const getPaymentBreakdown = (item) => {
  return getSalePaymentParts(item)
    .map((part) => `${part.label} ${formatPaymentAmount(part.amount)}`)
    .join(' · ')
}
</script>
