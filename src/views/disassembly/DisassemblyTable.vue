<!--src/views/disassembly/DisassemblyTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="disassemblies"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- رقم المستند -->
      <template #cell-document_number="{ item }">
        <AppBadge variant="primary" size="sm">
          {{ item.document_number }}
        </AppBadge>
      </template>

      <!-- التاريخ والملاحظات -->
      <template #cell-doc_info="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <span class="text-xs text-text-primary font-mono font-bold">
            {{ item.disassembly_date ? item.disassembly_date.substr(0, 10) : '-' }}
          </span>
          <span v-if="item.notes" class="text-[11px] text-text-muted max-w-[200px] truncate">
            {{ item.notes }}
          </span>
        </div>
      </template>

      <!-- المستودع الحاضن والمستخدم -->
      <template #cell-store_info="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-bold text-xs text-text-primary">
            {{ item.store?.name || 'مستودع غير محدد' }}
          </span>
          <span v-if="item.user?.name" class="text-[10px] text-text-muted mt-0.5">
            بواسطة: {{ item.user.name }}
          </span>
        </div>
      </template>

      <!-- الصنف الخام المصروف -->
      <template #cell-source_item="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-xs text-primary">
              {{ item.source_item?.name || 'صنف غير محدد' }}
            </span>
          </div>
          <div class="flex items-center gap-1 text-[11px] font-mono text-text-secondary mt-0.5">
            <span>الكمية:</span>
            <span class="font-bold text-text-primary">{{ Number(item.source_quantity) }}</span>
            <span>{{ item.source_item_unit?.unit_name || 'كجم' }}</span>
          </div>
        </div>
      </template>

      <!-- ملخص الأجزاء الناتجة -->
      <template #cell-outputs_summary="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <div class="flex items-center gap-1">
            <AppBadge variant="info" size="xs" pill>
              {{ item.items?.length || 0 }} أجزاء ناتجة
            </AppBadge>
            <span
              v-if="Number(item.waste_quantity) > 0"
              class="text-[10px] text-danger font-mono font-bold"
            >
              (هالك: {{ Number(item.waste_quantity) }} كجم)
            </span>
          </div>
        </div>
      </template>

      <!-- التكلفة الإجمالية للمستند -->
      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[130px] text-right" dir="rtl">
          <div class="flex justify-between text-[11px] text-text-secondary font-medium">
            <span>إجمالي التكلفة:</span>
            <span class="font-mono font-bold text-success">
              {{ formatCurrency(item.source_total_cost || 0) }}
            </span>
          </div>
          <div
            class="flex justify-between text-[10px] text-text-muted mt-0.5 border-t border-surface-border pt-0.5"
          >
            <span>تكلفة الكيلو الخام:</span>
            <span class="font-mono font-bold text-text-primary">
              {{ formatCurrency(item.source_unit_cost || 0) }}
            </span>
          </div>
        </div>
      </template>

      <!-- الإجراءات المتاحة -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            @click="$emit('edit-disassembly', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل إذن التفكيك وموازنة التكاليف"
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
            @click="$emit('delete-disassembly', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="إلغاء وحذف الإذن وعكس الحركات المخزنية"
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
  disassemblies: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-disassembly', 'delete-disassembly', 'row-clicked'])

const tableHeaders = computed(() => [
  { key: 'document_number', label: 'رقم الإذن' },
  { key: 'doc_info', label: 'التاريخ والملاحظات' },
  { key: 'store_info', label: 'المستودع والمستخدم' },
  { key: 'source_item', label: 'الصنف الخام المستهلك' },
  { key: 'outputs_summary', label: 'الأجزاء الناتجة' },
  { key: 'financials', label: 'التكلفة والمحاسبة' },
  { key: 'actions', label: 'الإجراءات', class: 'text-left min-w-[90px]' },
])
</script>
