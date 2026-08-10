<!--src\views\items\components\ItemBaseInfo.vue--->
<template>
  <AppCard>
    <div class="p-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div class="md:col-span-8">
          <AppInput
            id="item-name"
            label="اسم الصنف / الخدمة التجاري"
            :model-value="props.formState.name"
            @update:model-value="(val) => updateField('name', val)"
            placeholder="ادخل الاسم التجاري بالكامل..."
            required
          />
          <div v-if="validationErrors && validationErrors.name" class="mt-1">
            <p
              v-for="(err, i) in validationErrors.name"
              :key="i"
              class="text-rose-500 text-xs font-bold"
            >
              {{ err }}
            </p>
          </div>
        </div>

        <div class="md:col-span-4">
          <label class="block text-xs font-bold text-text-secondary mb-1.5">طبيعة ونوع الصنف</label>
          <div
            class="grid grid-cols-2 gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border"
          >
            <button
              type="button"
              v-for="type in itemTypes"
              :key="type.value"
              @click="updateField('item_type', type.value)"
              :class="[
                'py-1 text-[11px] font-bold rounded transition-all',
                props.formState.item_type === type.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary',
              ]"
            >
              {{ type.label }}
            </button>
          </div>
        </div>

        <!-- خيار الصنف التجميعي يظهر شرطياً فقط إذا كان نوع الصنف مخزني -->
        <div
          v-if="props.formState.item_type === 'product'"
          class="md:col-span-12 flex items-start gap-3 bg-surface-ground/40 p-3 rounded-xl border border-surface-border/60 animate-fade-in mt-1"
        >
          <input
            id="is-composite"
            type="checkbox"
            :checked="props.formState.is_composite"
            @change="(e) => updateField('is_composite', e.target.checked)"
            class="w-4 h-4 rounded text-primary bg-surface-section border-surface-border focus:ring-primary focus:ring-offset-surface-section mt-0.5 cursor-pointer"
          />
          <div class="flex flex-col gap-0.5">
            <label
              for="is-composite"
              class="text-xs font-bold text-text-primary cursor-pointer select-none"
            >
              هل هذا الصنف تجميعي؟ (يتكون من منتجات ومواد أخرى)
            </label>
            <span class="text-[10px] text-text-muted">
              تفعيل هذا الخيار سيفتح لك وحدة بناء المكونات بالأسفل لربط المواد والقطع، ليقوم النظام
              بخصمها تلقائياً من المخزن عند حركات البيع.
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <AppInput
            id="profit-margin"
            label="نسبة هامش الربح المستهدف (%)"
            :model-value="props.formState.profit_margin"
            @update:model-value="(val) => updateField('profit_margin', val ? Number(val) : 0)"
            type="number"
            min="0"
            max="100"
            step="0.01"
          />
          <div v-if="validationErrors && validationErrors.profit_margin" class="mt-1">
            <p
              v-for="(err, i) in validationErrors.profit_margin"
              :key="i"
              class="text-rose-500 text-xs font-bold"
            >
              {{ err }}
            </p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-text-secondary mb-1">التصنيف الشجري</label>
          <AppDropdown
            id="item-category"
            :model-value="props.formState.category_id"
            @update:model-value="(val) => updateField('category_id', val)"
            :options="categoryOptions"
            placeholder="اختر فئة التصنيف..."
          />
          <div v-if="validationErrors && validationErrors.category_id" class="mt-1">
            <p
              v-for="(err, i) in validationErrors.category_id"
              :key="i"
              class="text-rose-500 text-xs font-bold"
            >
              {{ err }}
            </p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-text-secondary mb-1">
            الوحدة الأساسية الصغرى (قاعدة الجرد)
          </label>
          <AppDropdown
            id="item-base-unit"
            :model-value="props.formState.base_unit_id"
            @update:model-value="(val) => handleBaseUnitChange(val !== null ? Number(val) : null)"
            :options="unitStore.units"
            option-label="name"
            option-value="id"
            placeholder="اختر الوحدة الصغرى..."
            :disabled="isEditMode"
            :show-clear="false"
          />
          <div v-if="validationErrors && validationErrors.base_unit_id" class="mt-1">
            <p
              v-for="(err, i) in validationErrors.base_unit_id"
              :key="i"
              class="text-rose-500 text-xs font-bold"
            >
              {{ err }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { useUnitStore } from '@/stores/unitStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { storeToRefs } from 'pinia'

import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  formState: { type: Object, required: true },
})

const emit = defineEmits(['update:formState', 'clear-error'])

const route = useRoute()
const itemStore = useItemStore()
const unitStore = useUnitStore()
const categoryStore = useCategoryStore()

const { validationErrors } = storeToRefs(itemStore)
const isEditMode = computed(() => !!route.params.id)

const itemTypes = [
  { value: 'product', label: 'مخزني' },
  { value: 'service', label: 'خدمة' },
]

const categoryOptions = computed(() => {
  return categoryStore.categories.map((cat) => ({
    id: cat.id,
    name: cat.full_path || cat.indent_name || cat.name,
  }))
})

const updateField = (field, value) => {
  emit('clear-error', field)

  // معالجة حماية البيانات لتصفير خصائص التجميع فوراً في حال تحويل طبيعة الصنف إلى خدمة
  const extraUpdates = {}
  if (field === 'item_type' && value !== 'product') {
    extraUpdates.is_composite = false
    extraUpdates.components = []
  }

  emit('update:formState', {
    ...props.formState,
    [field]: value,
    ...extraUpdates,
  })
}

/**
 * دالة معالجة تغيير الوحدة الأساسية مع تأسيس فئات الأسعار الافتراضية
 */
const handleBaseUnitChange = (unitId) => {
  emit('clear-error', 'base_unit_id')

  let updatedUnits = []
  if (unitId) {
    // جلب وبناء مصفوفة فئات الأسعار الافتراضية
    const defaultPrices = itemStore.priceLists.map((pl) => ({
      price_list_id: pl.id,
      price_list_name: pl.name,
      discount_percentage: 0,
      price: 0,
    }))

    updatedUnits = [
      {
        unit_id: unitId,
        conversion_factor: 1,
        cost: 0,
        price: 0,
        barcodes: [],
        prices: defaultPrices,
      },
    ]
  }

  emit('update:formState', {
    ...props.formState,
    base_unit_id: unitId,
    units: updatedUnits,
  })
}
</script>
