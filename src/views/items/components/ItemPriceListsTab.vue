<!--src/views/items/components/ItemPriceListsTab.vue-->
<template>
  <AppCard>
    <div class="space-y-4">
      <!-- 1. ترويسة التبويب مع محدد الوحدة التفاعلي -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3"
      >
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
          <div>
            <h3 class="text-sm font-black text-text-primary">مصفوفة فئات الأسعار وسياسات الخصم</h3>
            <p class="text-xs text-text-muted mt-0.5">
              تحديد أسعار البيع ونسب الخصم المعتمدة لكل فئة سعرية (جملة، تجزئة، موزع...)
            </p>
          </div>
        </div>

        <!-- شارة سعر بيع الجمهور المعتمد للوحدة الحالية المعروضة -->
        <div v-if="currentUnit" class="flex items-center gap-2">
          <span
            class="text-xs font-bold text-text-secondary bg-surface-ground px-3 py-1.5 rounded-lg border border-surface-border flex items-center gap-1.5"
          >
            <span>سعر الجمهور المعتمد:</span>
            <span class="font-mono text-primary font-black" dir="ltr">
              {{
                Number(currentUnit.price || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </span>
          </span>
        </div>
      </div>

      <!-- تنبيه في حال عدم اختيار الوحدة الأساسية بعد -->
      <div
        v-if="!props.formState.units || props.formState.units.length === 0"
        class="text-center py-10 bg-surface-ground/40 rounded-xl border border-dashed border-surface-border text-text-muted text-xs italic space-y-1"
      >
        <p class="font-bold text-text-secondary">
          لم يتم تحديد الوحدة الأساسية الصغرى للصنف حتى الآن.
        </p>
        <p>
          يرجى اختيار الوحدة الأساسية من تبويب "البيانات والتسعير السريع" لتأسيس مصفوفة الأسعار
          تلقائياً.
        </p>
      </div>

      <div v-else class="space-y-4">
        <!-- 2. شريط التبديل بين وحدات القياس (يظهر إذا كان للصنف أكثر من وحدة) -->
        <div
          v-if="props.formState.units.length > 1"
          class="flex items-center gap-2 p-1.5 bg-surface-ground/60 rounded-xl border border-surface-border overflow-x-auto custom-scrollbar"
        >
          <span class="text-xs font-bold text-text-muted px-2 shrink-0">معاينة أسعار الوحدة:</span>
          <button
            v-for="(unit, index) in props.formState.units"
            :key="index"
            type="button"
            @click="selectedUnitIndex = index"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer select-none',
              selectedUnitIndex === index
                ? 'bg-primary text-white shadow-xs font-black'
                : 'bg-surface-section text-text-secondary border border-surface-border hover:text-text-primary hover:bg-surface-ground',
            ]"
          >
            <span>{{ getUnitDisplayName(unit, index) }}</span>
            <span
              v-if="index === 0"
              :class="[
                'text-[10px] px-1.5 py-0.2 rounded font-normal',
                selectedUnitIndex === index
                  ? 'bg-white/20 text-white'
                  : 'bg-primary/10 text-primary',
              ]"
            >
              الأساسية
            </span>
          </button>
        </div>

        <!-- 3. مصفوفة فئات الأسعار والخصومات للوحدة المحددة -->
        <div v-if="currentUnit" class="pt-1">
          <ItemUnitPricesGrid
            :prices="currentUnit.prices || []"
            :base-price="currentUnit.price || 0"
            :rounding-rule="props.formState.rounding_rule || 'none'"
            @update:prices="handlePricesUpdate"
          />
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUnitStore } from '@/stores/unitStore'
import AppCard from '@/components/ui/AppCard.vue'
import ItemUnitPricesGrid from './ItemUnitPricesGrid.vue'

const props = defineProps({
  formState: { type: Object, required: true },
})

const emit = defineEmits(['update:formState', 'clear-error'])

const unitStore = useUnitStore()
const selectedUnitIndex = ref(0)

// الوحدة المحددة حالياً لتعديل أسعارها
const currentUnit = computed(() => {
  if (props.formState.units && props.formState.units[selectedUnitIndex.value]) {
    return props.formState.units[selectedUnitIndex.value]
  }
  return props.formState.units?.[0] || null
})

// جلب اسم الوحدة للعرض
const getUnitDisplayName = (unit, index) => {
  if (!unit) return `وحدة #${index + 1}`
  const found = unitStore.units.find((u) => u.id === unit.unit_id)
  return found ? found.name : index === 0 ? 'الوحدة الأساسية' : `وحدة إضافية #${index + 1}`
}

// تحديث مصفوفة أسعار الوحدة المحددة في الـ Form State
const handlePricesUpdate = (updatedPrices) => {
  emit('clear-error', 'units')

  const targetIndex = selectedUnitIndex.value
  const clonedUnits = props.formState.units.map((unit, idx) => {
    if (idx === targetIndex) {
      return {
        ...unit,
        prices: [...updatedPrices],
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-surface-border));
  border-radius: 10px;
}
</style>
