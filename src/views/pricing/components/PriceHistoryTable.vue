<!-- src/views/pricing/components/PriceHistoryTable.vue -->
<template>
  <div class="space-y-4">
    <!-- بطاقة فلاتر البحث المتقدم للسجل -->
    <AppCard>
      <form @submit.prevent="handleSearch" class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <AppInput
              id="history-batch-id"
              label="رقم الدفعة (Batch ID)"
              v-model="filters.batch_id"
              placeholder="مثال: BATCH-..."
            />
          </div>

          <div>
            <AppDropdown
              id="history-change-type"
              label="نوع التعديل"
              v-model="filters.change_type"
              :options="changeTypeOptions"
              placeholder="جميع العمليات"
              :show-clear="true"
            />
          </div>

          <div>
            <AppInput
              id="history-from-date"
              type="date"
              label="من تاريخ"
              v-model="filters.from_date"
            />
          </div>

          <div>
            <AppInput
              id="history-to-date"
              type="date"
              label="إلى تاريخ"
              v-model="filters.to_date"
            />
          </div>

          <div class="flex items-center gap-2">
            <AppButton type="submit" :disabled="isLoading" class="w-full"> بحث </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              @click="resetFilters"
              :disabled="isLoading"
            >
              مسح
            </AppButton>
          </div>
        </div>
      </form>
    </AppCard>

    <!-- جدول السجل التاريخي -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="items"
        :is-loading="isLoading"
        :row-clickable="false"
      >
        <!-- الدفعة وتاريخ العملية -->
        <template #cell-batch_info="{ item }">
          <div class="flex flex-col py-1 font-mono text-xs">
            <span class="font-bold text-primary">{{ item.batch_id }}</span>
            <span class="text-text-muted text-[11px]">{{ item.created_at }}</span>
          </div>
        </template>

        <!-- بيانات الصنف والوحدة -->
        <template #cell-item_info="{ item }">
          <div class="flex flex-col py-1">
            <span class="font-bold text-text-primary text-sm">{{ item.item_name }}</span>
            <span class="text-xs text-text-muted">
              الوحدة: {{ item.unit_name || '-' }}
              <span v-if="item.price_list_name" class="mr-1 text-primary"
                >({{ item.price_list_name }})</span
              >
            </span>
          </div>
        </template>

        <!-- حركة السعر -->
        <template #cell-price_change="{ item }">
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="text-text-muted">{{ formatNumber(item.old_price) }}</span>
            <span class="text-text-muted">&larr;</span>
            <span class="font-bold text-text-primary">{{ formatNumber(item.new_price) }}</span>
          </div>
        </template>

        <!-- حركة التكلفة -->
        <template #cell-cost_change="{ item }">
          <div class="flex items-center gap-2 font-mono text-xs" v-if="item.new_cost !== null">
            <span class="text-text-muted">{{ formatNumber(item.old_cost) }}</span>
            <span class="text-text-muted">&larr;</span>
            <span class="font-bold text-text-secondary">{{ formatNumber(item.new_cost) }}</span>
          </div>
          <span v-else class="text-text-muted text-xs">-</span>
        </template>

        <!-- نسبة التغيير ونوع العملية -->
        <template #cell-change_details="{ item }">
          <div class="flex flex-col text-xs font-mono">
            <span
              v-if="item.change_percentage !== null"
              :class="[
                'font-bold',
                item.change_percentage > 0
                  ? 'text-emerald-600'
                  : item.change_percentage < 0
                    ? 'text-rose-600'
                    : 'text-text-muted',
              ]"
            >
              {{ item.change_percentage > 0 ? '+' : '' }}{{ formatNumber(item.change_percentage) }}%
            </span>
            <span class="text-[10px] text-text-muted">{{
              translateChangeType(item.change_type)
            }}</span>
          </div>
        </template>

        <!-- سعر الصرف والعملة إن وجد -->
        <template #cell-currency_info="{ item }">
          <div class="flex flex-col text-xs font-mono" v-if="item.currency_code">
            <span class="font-semibold text-text-primary">{{ item.currency_code }}</span>
            <span class="text-text-muted text-[11px]">{{ formatNumber(item.exchange_rate) }}</span>
          </div>
          <span v-else class="text-text-muted text-xs">-</span>
        </template>

        <!-- المستخدم والملاحظات -->
        <template #cell-user_notes="{ item }">
          <div class="flex flex-col text-xs">
            <span class="font-semibold text-text-primary">{{ item.user_name || '-' }}</span>
            <span
              v-if="item.notes"
              class="text-text-muted text-[11px] truncate max-w-xs"
              :title="item.notes"
            >
              {{ item.notes }}
            </span>
          </div>
        </template>

        <!-- الإجراءات (زر التراجع عن الدفعة) -->
        <template #cell-actions="{ item }">
          <div class="flex items-center justify-end">
            <button
              v-if="authStore.can('pricing.rollback')"
              type="button"
              @click="$emit('rollback-batch', item.batch_id)"
              class="px-2.5 py-1 text-xs font-semibold rounded bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/50 transition-colors"
              title="تراجع عن هذه الدفعة بالكامل"
            >
              تراجع عن الدفعة
            </button>
          </div>
        </template>
      </AppTable>

      <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />
    </AppCard>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

defineProps({
  items: { type: Array, default: () => [] },
  pagination: { type: Object, default: () => ({}) },
  isLoading: { type: Boolean, default: false },
})

const emit = defineEmits(['filter', 'page-change', 'rollback-batch'])

const authStore = useAuthStore()

const filters = reactive({
  batch_id: '',
  change_type: '',
  from_date: '',
  to_date: '',
})

const changeTypeOptions = [
  { id: 'bulk_reprice', name: 'تسعير جماعي' },
  { id: 'manual', name: 'تعديل يدوي' },
  { id: 'auto_indexed', name: 'ربط تلقائي بالصرف' },
  { id: 'rollback', name: 'عملية تراجع' },
]

const tableHeaders = [
  { key: 'batch_info', label: 'رقم الدفعة / التاريخ' },
  { key: 'item_info', label: 'الصنف والوحدة' },
  { key: 'price_change', label: 'السعر (القديم ← الجديد)' },
  { key: 'cost_change', label: 'التكلفة (القديمة ← الجديدة)' },
  { key: 'change_details', label: 'التغيير والنوع' },
  { key: 'currency_info', label: 'العملة والصرف' },
  { key: 'user_notes', label: 'المستخدم / ملاحظات' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]

const translateChangeType = (type) => {
  const map = {
    bulk_reprice: 'تسعير جماعي',
    manual: 'يدوي',
    auto_indexed: 'مؤشر تلقائي',
    rollback: 'تراجع مسترجع',
  }
  return map[type] || type || '-'
}

const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00'
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const handleSearch = () => {
  emit('filter', { ...filters })
}

const resetFilters = () => {
  filters.batch_id = ''
  filters.change_type = ''
  filters.from_date = ''
  filters.to_date = ''
  emit('filter', { ...filters })
}
</script>
