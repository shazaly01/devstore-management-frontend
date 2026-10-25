<!-- src/views/pricing/components/PriceHistoryTable.vue -->
<template>
  <div class="space-y-4 text-right" dir="rtl">
    <!-- 1. بطاقة فلاتر البحث المتقدم لأرشيف المجموعات -->
    <AppCard>
      <form @submit.prevent="handleSearch">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <AppInput
              id="batch-code-filter"
              label="كود الدفعة / المجموعة"
              v-model="filters.batch_code"
              placeholder="مثال: PRC-2026..."
            />
          </div>

          <div>
            <AppDropdown
              id="batch-category-filter"
              label="التصنيف المستهدف"
              v-model="filters.category_id"
              :options="categories"
              option-value="id"
              option-label="name"
              placeholder="كافة التصنيفات"
              :show-clear="true"
            />
          </div>

          <div>
            <AppDropdown
              id="batch-currency-filter"
              label="العملة المرجعية"
              v-model="filters.currency_id"
              :options="currencies"
              option-value="id"
              option-label="name"
              placeholder="كافة العملات"
              :show-clear="true"
            />
          </div>

          <div>
            <AppDropdown
              id="batch-status-filter"
              label="حالة المجموعة"
              v-model="filters.is_rolled_back"
              :options="statusOptions"
              option-value="id"
              option-label="name"
              placeholder="الكل (معتمدة / متراجع عنها)"
              :show-clear="true"
            />
          </div>

          <div>
            <AppInput
              id="batch-exchange-rate-filter"
              type="number"
              step="0.0001"
              label="سعر الصرف المعتمد"
              v-model="filters.exchange_rate"
              placeholder="بحث بسعر صرف محدد"
            />
          </div>

          <div>
            <AppInput
              id="batch-from-date"
              type="date"
              label="من تاريخ التسعير"
              v-model="filters.from_date"
            />
          </div>

          <div>
            <AppInput
              id="batch-to-date"
              type="date"
              label="إلى تاريخ التسعير"
              v-model="filters.to_date"
            />
          </div>

          <div class="flex items-center gap-2">
            <AppButton type="submit" :disabled="isLoading" class="w-full"> تصفية وبحث </AppButton>
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

    <!-- 2. جدول أرشيف مجموعات التسعير -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="batches"
        :is-loading="isLoading"
        :row-clickable="false"
      >
        <!-- كود الدفعة وتاريخ التنفيذ -->
        <template #cell-batch_info="{ item }">
          <div class="flex flex-col py-1 font-mono text-xs text-right">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-primary">{{ item.batch_code }}</span>
              <AppBadge v-if="item.change_type === 'rollback'" variant="danger" size="xs">
                دفعة تراجع
              </AppBadge>
            </div>
            <span class="text-text-muted text-[11px] mt-0.5">{{ item.created_at }}</span>
          </div>
        </template>

        <!-- النطاق والنوع المستهدف -->
        <template #cell-scope_info="{ item }">
          <div class="flex flex-col py-1 text-xs text-right">
            <span class="font-semibold text-text-primary">
              {{ item.category_name || 'كافة التصنيفات والأصناف' }}
            </span>
            <span class="text-[11px] text-text-muted font-mono mt-0.5">
              {{ translateChangeType(item.change_type) }}
            </span>
          </div>
        </template>

        <!-- بيانات العملة وسعر الصرف -->
        <template #cell-currency_info="{ item }">
          <div class="flex flex-col text-xs font-mono text-right" v-if="item.currency_code">
            <span class="font-bold text-text-primary"
              >{{ item.currency_code }} ({{ item.currency_name }})</span
            >
            <span class="text-success text-[11px] font-bold">
              سعر الصرف: {{ formatNumber(item.exchange_rate) }}
            </span>
          </div>
          <span v-else class="text-text-muted text-xs font-mono text-right block"
            >العملة المحلية الأساسية</span
          >
        </template>

        <!-- إحصائية عدد الأصناف والوحدات -->
        <template #cell-items_count="{ item }">
          <div class="font-mono text-xs font-bold text-text-primary">
            <span class="px-2.5 py-1 rounded-md bg-surface-ground border border-surface-border">
              {{ item.items_count }} وحدة
            </span>
          </div>
        </template>

        <!-- حالة الدفعة وسجل التراجع -->
        <template #cell-status="{ item }">
          <div class="flex flex-col text-xs text-right">
            <div v-if="item.is_rolled_back" class="flex flex-col items-start gap-1">
              <AppBadge variant="danger" size="xs" pill dot> تم التراجع عنها </AppBadge>
              <span class="text-[10px] text-text-muted font-mono">
                {{ item.rolled_back_at }}
              </span>
              <span v-if="item.rolled_back_by_name" class="text-[10px] text-text-muted">
                بواسطة: {{ item.rolled_back_by_name }}
              </span>
            </div>
            <div v-else>
              <AppBadge variant="success" size="xs" pill dot> سارية ومعتمدة </AppBadge>
            </div>
          </div>
        </template>

        <!-- المستخدم والملاحظات -->
        <template #cell-user_notes="{ item }">
          <div class="flex flex-col text-xs text-right">
            <span class="font-semibold text-text-primary">{{ item.user_name || '-' }}</span>
            <span
              v-if="item.notes"
              class="text-text-muted text-[11px] truncate max-w-xs mt-0.5"
              :title="item.notes"
            >
              {{ item.notes }}
            </span>
          </div>
        </template>

        <!-- الإجراءات -->
        <template #cell-actions="{ item }">
          <div class="flex items-center justify-end gap-2">
            <!-- زر استعراض الأصناف التابعة للمجموعة -->
            <button
              type="button"
              @click="openDetailsModal(item)"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-ground text-text-primary border border-surface-border hover:bg-surface-border transition-colors flex items-center gap-1 cursor-pointer"
              title="عرض أصناف المجموعة"
            >
              <svg
                class="w-3.5 h-3.5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>الأصناف</span>
            </button>

            <!-- زر التراجع عن المجموعة كاملة -->
            <button
              v-if="
                authStore.can('pricing.rollback') &&
                !item.is_rolled_back &&
                item.change_type !== 'rollback'
              "
              type="button"
              @click="$emit('rollback-batch', item)"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition-colors flex items-center gap-1 cursor-pointer"
              title="تراجع عن هذه المجموعة بالكامل واسترجع الأسعار السابقة"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <span>تراجع</span>
            </button>
          </div>
        </template>
      </AppTable>

      <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />
    </AppCard>

    <!-- 3. نافذة منبثقة معتمة لاستعراض تفاصيل أصناف المجموعة -->
    <div
      v-if="isDetailsModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-surface-section rounded-2xl border border-surface-border shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] relative z-10 text-right font-sans"
        dir="rtl"
      >
        <!-- رأس النافذة -->
        <div
          class="p-4 border-b border-surface-border flex justify-between items-center bg-surface-ground"
        >
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-text-primary">تفاصيل مجموعة التسعير</h3>
              <span
                class="font-mono font-bold text-primary text-xs px-2 py-0.5 rounded bg-primary/10 border border-primary/20"
              >
                {{ selectedBatchHeader?.batch_code }}
              </span>
            </div>
            <p class="text-xs text-text-muted mt-0.5">
              تاريخ التنفيذ: {{ selectedBatchHeader?.created_at }} | المنفذ:
              {{ selectedBatchHeader?.user_name }}
            </p>
          </div>
          <button
            type="button"
            @click="isDetailsModalOpen = false"
            class="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-section transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- محتوى الجدول التفصيلي -->
        <div class="p-4 overflow-y-auto flex-1 bg-surface-section">
          <div v-if="isLoadingDetails" class="p-12 text-center text-text-muted">
            <span class="text-xs">جاري تحميل تفاصيل الأصناف...</span>
          </div>
          <div
            v-else-if="batchDetailsItems.length === 0"
            class="p-8 text-center text-text-muted text-xs"
          >
            لا توجد أصناف مسجلة داخل هذه المجموعة.
          </div>
          <div v-else class="space-y-4">
            <div class="overflow-x-auto border border-surface-border rounded-xl bg-surface-section">
              <table class="w-full text-right text-xs">
                <thead
                  class="bg-surface-ground text-text-secondary border-b border-surface-border font-semibold"
                >
                  <tr>
                    <th class="p-3">الصنف والوحدة</th>
                    <th class="p-3">السعر السابق</th>
                    <th class="p-3">السعر المعتمد</th>
                    <th class="p-3">التكلفة السابقة</th>
                    <th class="p-3">التكلفة الجديدة</th>
                    <th class="p-3">نسبة التغيير</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-border font-mono bg-surface-section">
                  <tr
                    v-for="detail in paginatedDetails"
                    :key="detail.id"
                    class="hover:bg-surface-ground/70 transition-colors"
                  >
                    <td class="p-3 font-sans">
                      <div class="font-bold text-text-primary">{{ detail.item_name }}</div>
                      <div class="text-[11px] text-text-muted">
                        {{ detail.unit_name }}
                        <span v-if="detail.price_list_name" class="text-primary mr-1"
                          >({{ detail.price_list_name }})</span
                        >
                      </div>
                    </td>
                    <td class="p-3 text-text-muted">{{ formatNumber(detail.old_price) }}</td>
                    <td class="p-3 font-bold text-success">
                      {{ formatNumber(detail.new_price) }}
                    </td>
                    <td class="p-3 text-text-muted">
                      {{ detail.old_cost !== null ? formatNumber(detail.old_cost) : '-' }}
                    </td>
                    <td class="p-3 font-semibold text-text-primary">
                      {{ detail.new_cost !== null ? formatNumber(detail.new_cost) : '-' }}
                    </td>
                    <td class="p-3">
                      <span
                        v-if="detail.change_percentage !== null"
                        :class="[
                          'font-bold',
                          detail.change_percentage > 0
                            ? 'text-success'
                            : detail.change_percentage < 0
                              ? 'text-danger'
                              : 'text-text-muted',
                        ]"
                      >
                        {{ detail.change_percentage > 0 ? '+' : ''
                        }}{{ formatNumber(detail.change_percentage) }}%
                      </span>
                      <span v-else>-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- نظام صفحات الأصناف داخل النافذة -->
            <AppPagination
              v-if="batchDetailsItems.length > detailsPerPage"
              :meta="detailsPaginationMeta"
              @page-change="detailsCurrentPage = $event"
            />
          </div>
        </div>

        <!-- أسفل النافذة -->
        <div
          class="p-4 border-t border-surface-border bg-surface-ground flex justify-between items-center"
        >
          <span class="text-xs text-text-muted font-mono font-bold">
            إجمالي الأصناف والوحدات: {{ batchDetailsItems.length }}
          </span>
          <AppButton type="button" variant="secondary" @click="isDetailsModalOpen = false">
            إغلاق
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePricingStore } from '@/stores/pricingStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

defineProps({
  batches: { type: Array, default: () => [] },
  pagination: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
  currencies: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
})

const emit = defineEmits(['filter', 'page-change', 'rollback-batch'])

const authStore = useAuthStore()
const pricingStore = usePricingStore()

const isDetailsModalOpen = ref(false)
const isLoadingDetails = ref(false)
const selectedBatchHeader = ref(null)
const batchDetailsItems = ref([])

const detailsCurrentPage = ref(1)
const detailsPerPage = ref(10)

const paginatedDetails = computed(() => {
  const start = (detailsCurrentPage.value - 1) * detailsPerPage.value
  return batchDetailsItems.value.slice(start, start + detailsPerPage.value)
})

const totalDetailsPages = computed(() => {
  return Math.ceil(batchDetailsItems.value.length / detailsPerPage.value) || 1
})

const detailsPaginationMeta = computed(() => {
  const total = batchDetailsItems.value.length
  const from = total === 0 ? 0 : (detailsCurrentPage.value - 1) * detailsPerPage.value + 1
  const to = Math.min(detailsCurrentPage.value * detailsPerPage.value, total)

  return {
    current_page: detailsCurrentPage.value,
    last_page: totalDetailsPages.value,
    per_page: detailsPerPage.value,
    total,
    from,
    to,
  }
})

const filters = reactive({
  batch_code: '',
  category_id: null,
  currency_id: null,
  exchange_rate: '',
  is_rolled_back: null,
  from_date: '',
  to_date: '',
})

const statusOptions = [
  { id: 'false', name: 'سارية ومعتمدة فقط' },
  { id: 'true', name: 'تم التراجع عنها' },
]

const tableHeaders = [
  { key: 'batch_info', label: 'كود المجموعة / التاريخ' },
  { key: 'scope_info', label: 'التصنيف ونوع المعيار' },
  { key: 'currency_info', label: 'العملة وسعر الصرف' },
  { key: 'items_count', label: 'حجم التعديل' },
  { key: 'status', label: 'حالة المجموعة' },
  { key: 'user_notes', label: 'المنفذ / ملاحظات' },
  { key: 'actions', label: 'الإجراءات', class: 'text-left' },
]

const translateChangeType = (type) => {
  const map = {
    bulk_reprice: 'تسعير جماعي شامل',
    exchange_rate: 'معيار سعر الصرف',
    percentage: 'معيار نسبة التكلفة',
    target_margin: 'معيار هامش الربح',
    manual: 'تعديل يدوي',
    auto_indexed: 'ربط آلي بالصرف',
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
  filters.batch_code = ''
  filters.category_id = null
  filters.currency_id = null
  filters.exchange_rate = ''
  filters.is_rolled_back = null
  filters.from_date = ''
  filters.to_date = ''
  emit('filter', { ...filters })
}

const openDetailsModal = async (batch) => {
  selectedBatchHeader.value = batch
  isDetailsModalOpen.value = true
  isLoadingDetails.value = true
  batchDetailsItems.value = []
  detailsCurrentPage.value = 1

  try {
    const data = await pricingStore.fetchBatchDetails(batch.id)
    batchDetailsItems.value = data.details || []
  } catch {
    batchDetailsItems.value = []
  } finally {
    isLoadingDetails.value = false
  }
}
</script>
