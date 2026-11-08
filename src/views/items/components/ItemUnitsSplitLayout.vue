<!--src/views/items/components/ItemUnitsSplitLayout.vue-->
<template>
  <div class="space-y-4">
    <!-- 1. جدول وحدات القياس الإضافية ومعاملات التحويل -->
    <ItemUnitsMasterTable
      :form-state="props.formState"
      :active-index="activeUnitIndex"
      :is-details-open="isDetailsOpen"
      @toggle-details="handleToggleDetails"
      @update:active-index="handleSelectUnit"
      @update:form-state="(payload) => emit('update:formState', payload)"
      @clear-error="(field) => emit('clear-error', field)"
    />

    <!-- 2. كرت مسح وإدارة باركودات الوحدة النشطة (يفتح عند الضغط على زر الباركودات أو السطر) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <AppCard v-if="isDetailsOpen && activeUnitRow">
        <div class="space-y-3.5">
          <!-- ترويسة إدارة باركودات الوحدة النشطة -->
          <div
            class="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-3"
          >
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <h3 class="text-sm font-black text-text-primary flex items-center gap-1.5">
                <span>🏷️ باركودات وحدة:</span>
                <span class="text-primary font-bold">[{{ activeUnitName }}]</span>
              </h3>
            </div>

            <!-- زر طي وإغلاق قسم الباركودات -->
            <button
              type="button"
              @click="isDetailsOpen = false"
              class="text-xs font-bold text-text-muted hover:text-danger hover:bg-danger/10 px-2.5 py-1.5 rounded-lg border border-surface-border transition-colors cursor-pointer flex items-center gap-1"
              title="طي قسم الباركودات"
            >
              <span>إغلاق</span>
              <span>✕</span>
            </button>
          </div>

          <!-- مكون إدخال ومسح الباركودات للوحدة -->
          <div class="pt-1">
            <ItemUnitBarcodes
              :model-value="activeUnitRow.barcodes || []"
              @update:model-value="handleUpdateBarcodes"
            />
          </div>
        </div>
      </AppCard>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUnitStore } from '@/stores/unitStore'
import AppCard from '@/components/ui/AppCard.vue'
import ItemUnitsMasterTable from './ItemUnitsMasterTable.vue'
import ItemUnitBarcodes from './ItemUnitBarcodes.vue'

const props = defineProps({
  formState: { type: Object, required: true },
})

const emit = defineEmits(['update:formState', 'clear-error'])

const unitStore = useUnitStore()
const activeUnitIndex = ref(0)
const isDetailsOpen = ref(false)

const activeUnitRow = computed(() => {
  if (
    props.formState.units &&
    activeUnitIndex.value !== null &&
    props.formState.units[activeUnitIndex.value]
  ) {
    return props.formState.units[activeUnitIndex.value]
  }
  return null
})

const activeUnitName = computed(() => {
  if (!activeUnitRow.value) return ''
  const unitObj = unitStore.units.find((u) => u.id === activeUnitRow.value.unit_id)
  return unitObj
    ? unitObj.name
    : activeUnitIndex.value === 0
      ? 'الوحدة الأساسية'
      : `وحدة إضافية #${activeUnitIndex.value}`
})

const handleToggleDetails = (index) => {
  if (isDetailsOpen.value && activeUnitIndex.value === index) {
    isDetailsOpen.value = false
  } else {
    activeUnitIndex.value = index
    isDetailsOpen.value = true
  }
}

const handleSelectUnit = (index) => {
  activeUnitIndex.value = index
}

const handleUpdateBarcodes = (updatedBarcodes) => {
  const clonedUnits = props.formState.units.map((unit, idx) => {
    if (idx === activeUnitIndex.value) {
      return {
        ...unit,
        barcodes: [...updatedBarcodes],
      }
    }
    return unit
  })

  emit('update:formState', {
    ...props.formState,
    units: clonedUnits,
  })
}
</script>
