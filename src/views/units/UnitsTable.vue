<!--src/views/units/UnitsTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="units"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-unit_info="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.name }}
          </span>
          <div
            v-if="item.short_name"
            class="flex items-center gap-1 text-xs text-text-muted mt-0.5"
          >
            <span
              class="bg-surface-ground px-1.5 py-0.5 rounded border border-surface-border text-[11px] font-mono text-text-secondary"
            >
              الرمز: {{ item.short_name }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-status="{ item }">
        <div class="flex items-center">
          <AppBadge :variant="item.is_active ? 'success' : 'neutral'" size="xs" pill dot>
            {{ item.is_active ? 'نشط' : 'غير نشط' }}
          </AppBadge>
        </div>
      </template>

      <template #cell-created_at_info="{ item }">
        <span class="text-sm text-text-secondary font-mono">
          {{ item.created_at || '-' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('unit.update')"
            @click="$emit('edit-unit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل الوحدة"
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
            v-if="authStore.can('unit.delete')"
            @click="$emit('delete-unit', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف الوحدة"
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

defineProps({
  units: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit-unit', 'delete-unit', 'row-clicked'])

const authStore = useAuthStore()

const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'unit_info', label: 'وحدة القياس المعتمدة', class: 'min-w-[200px]' },
    { key: 'status', label: 'الحالة' },
    { key: 'created_at_info', label: 'تاريخ الإضافة' },
  ]

  if (authStore.can('unit.update') || authStore.can('unit.delete')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' })
  }
  return headers
})
</script>
