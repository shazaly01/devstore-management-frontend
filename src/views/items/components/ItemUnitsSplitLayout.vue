<!--src\views\items\components\ItemUnitsSplitLayout.vue--->
<template>
  <div class="space-y-5">
    <!-- 1. جدول وحدات القياس وسياسات التكلفة والبيع بكامل العرض لمنع الاختناق -->
    <ItemUnitsMasterTable
      :form-state="props.formState"
      :active-index="activeUnitIndex"
      @update:active-index="(val) => (activeUnitIndex = val)"
      @update:form-state="(payload) => emit('update:formState', payload)"
      @clear-error="(field) => emit('clear-error', field)"
    />

    <!-- 2. بطاقة تفاصيل الوحدة النشطة تظهر أسفل الجدول مباشرة بشكل مريح -->
    <AppCard v-if="activeUnitRow">
      <div class="space-y-4">
        <!-- ترويسة تفاصيل الوحدة النشطة -->
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-3"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <div>
              <h3 class="text-sm font-black text-text-primary">
                التفاصيل المتقدمة لوحدة:
                <span class="text-primary font-bold">[{{ activeUnitName }}]</span>
              </h3>
              <p class="text-xs text-text-muted mt-0.5">
                إدارة الباركودات المتعددة ومصفوفة فئات الأسعار والخصومات المرتبطة بهذه الوحدة
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span
              class="text-xs font-bold text-text-secondary bg-surface-ground px-3 py-1.5 rounded-lg border border-surface-border"
            >
              سعر بيع الجمهور المعتمد:
              <span class="font-mono text-primary font-black mr-1" dir="ltr">
                {{
                  Number(activeUnitRow.price || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                }}
              </span>
            </span>
          </div>
        </div>

        <!-- شبكة التفاصيل: الباركودات ومصفوفة الخصومات والأسعار في صف متوازن -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-1">
          <!-- عمود الباركودات (5 أعمدة) -->
          <div
            class="lg:col-span-5 bg-surface-ground/50 p-4 rounded-xl border border-surface-border space-y-3"
          >
            <ItemUnitBarcodes
              :model-value="activeUnitRow.barcodes"
              @update:model-value="
                (updatedBarcodes) => updateActiveUnitSubArray('barcodes', updatedBarcodes)
              "
            />
          </div>

          <!-- عمود مصفوفة فئات الأسعار والخصومات (7 أعمدة) -->
          <div
            class="lg:col-span-7 bg-surface-ground/50 p-4 rounded-xl border border-surface-border space-y-3"
          >
            <ItemUnitPricesGrid
              :prices="activeUnitRow.prices"
              :base-price="activeUnitRow.price"
              :rounding-rule="props.formState.rounding_rule"
              @update:prices="(updatedPrices) => updateActiveUnitSubArray('prices', updatedPrices)"
            />
          </div>
        </div>
      </div>
    </AppCard>

    <!-- تنبيه هادئ في حال وجود وحدات ولم يتم اختيار أي وحدة -->
    <div
      v-else-if="props.formState.units && props.formState.units.length > 0"
      class="text-center py-6 bg-surface-ground/40 rounded-xl border border-dashed border-surface-border text-text-muted text-xs"
    >
      انقر على أحد أسطر الوحدات أعلاه لإظهار الباركودات وفئات الأسعار المرتبطة بها.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUnitStore } from '@/stores/unitStore'
import AppCard from '@/components/ui/AppCard.vue'
import ItemUnitsMasterTable from './ItemUnitsMasterTable.vue'
import ItemUnitBarcodes from './ItemUnitBarcodes.vue'
import ItemUnitPricesGrid from './ItemUnitPricesGrid.vue'

const props = defineProps({
  formState: { type: Object, required: true },
})

const emit = defineEmits(['update:formState', 'clear-error'])

const unitStore = useUnitStore()
const activeUnitIndex = ref(0)

const activeUnitRow = computed(() => {
  if (props.formState.units && props.formState.units[activeUnitIndex.value]) {
    return props.formState.units[activeUnitIndex.value]
  }
  return null
})

const activeUnitName = computed(() => {
  if (!activeUnitRow.value) return ''
  const unitObj = unitStore.units.find((u) => u.id === activeUnitRow.value.unit_id)
  return unitObj ? unitObj.name : 'غير محددة'
})

const updateActiveUnitSubArray = (key, updatedArray) => {
  const clonedUnits = props.formState.units.map((unit, idx) => {
    if (idx === activeUnitIndex.value) {
      return {
        ...unit,
        [key]: [...updatedArray],
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
