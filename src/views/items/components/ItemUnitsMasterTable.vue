<!--src\views\items\components\ItemUnitsMasterTable.vue--->
<template>
  <AppCard>
    <div class="p-5">
      <div class="flex justify-between items-center border-b border-surface-border pb-2 mb-4">
        <div>
          <h3 class="text-sm font-bold text-text-primary">وحدات القياس المتعددة</h3>
          <p class="text-[11px] text-text-muted mt-0.5">
            عرض وتعديل أسطر الوحدات، التكلفة بالعملة الأجنبية والمحلية، وسعر بيع الجمهور
          </p>
        </div>
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          :disabled="!props.formState.base_unit_id"
          @click="addUnitRow"
        >
          + وحدة إضافية
        </AppButton>
      </div>

      <div
        v-if="props.formState.units.length === 0"
        class="text-center py-8 text-text-muted text-xs italic"
      >
        يرجى تحديد الوحدة الأساسية الصغرى أولاً لتأسيس مصفوفة تلقائياً.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(row, index) in props.formState.units"
          :key="index"
          @click="emit('update:activeIndex', index)"
          :class="[
            'p-3 rounded-xl border transition-all cursor-pointer relative group',
            props.activeIndex === index
              ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20'
              : 'bg-surface-ground border-surface-border/60 hover:border-text-muted',
          ]"
        >
          <div
            v-if="props.activeIndex === index"
            class="absolute left-2 top-1/2 -translate-y-1/2 text-primary font-bold text-xs"
          >
            ◀
          </div>

          <div class="grid grid-cols-12 gap-2 items-start pr-1">
            <!-- 1. اختيار الوحدة -->
            <div :class="isForeignCurrency ? 'col-span-2' : 'col-span-3'">
              <label class="block text-[10px] font-bold text-text-secondary mb-1">الوحدة</label>
              <AppDropdown
                :id="'unit-dropdown-' + index"
                :model-value="row.unit_id"
                :options="unitStore.units"
                option-label="name"
                option-value="id"
                :disabled="index === 0"
                placeholder="اختر..."
                :show-clear="false"
                @update:model-value="
                  (val) => modifyUnitRowField(index, 'unit_id', val !== null ? Number(val) : null)
                "
                @click.stop
              />
            </div>

            <!-- 2. معامل التحويل -->
            <div :class="isForeignCurrency ? 'col-span-2' : 'col-span-2'">
              <label class="block text-[10px] font-bold text-text-secondary mb-1 text-center"
                >المعامل</label
              >
              <AppInput
                :id="'unit-factor-' + index"
                type="number"
                step="0.0001"
                :model-value="row.conversion_factor"
                :disabled="index === 0"
                input-class="text-center font-bold"
                @update:model-value="
                  (val) => modifyUnitRowField(index, 'conversion_factor', Number(val))
                "
                @click.stop
              />
            </div>

            <!-- 3. حقل التكلفة بالعملة الأجنبية (يقرأ foreign_cost مباشرة) -->
            <div v-if="isForeignCurrency" class="col-span-2" @click.stop>
              <AppCurrencyInput
                :id="'unit-foreign-cost-' + index"
                :label="'التكلفة (' + (selectedCurrency?.code || '') + ')'"
                :model-value="row.foreign_cost"
                :precision="4"
                label-class="!text-[10px] !font-bold text-amber-600 dark:text-amber-400 !mb-1 text-right truncate"
                input-class="!px-2.5 !py-2 !text-xs !font-mono !font-bold !text-right !bg-surface-section !border-surface-border"
                @update:model-value="
                  (val) =>
                    modifyUnitRowField(
                      index,
                      'foreign_cost',
                      val !== null && val !== undefined ? Number(val) : 0,
                    )
                "
              />
            </div>

            <!-- 4. حقل التكلفة بالعملة المحلية -->
            <div :class="isForeignCurrency ? 'col-span-3' : 'col-span-3'" @click.stop>
              <AppCurrencyInput
                :id="'unit-local-cost-' + index"
                label="التكلفة المحلية"
                :model-value="row.cost"
                :precision="2"
                label-class="!text-[10px] !font-bold text-text-secondary !mb-1 text-right"
                input-class="!px-2.5 !py-2 !text-xs !font-mono !font-bold !text-right !bg-surface-section !border-surface-border"
                @update:model-value="
                  (val) =>
                    modifyUnitRowField(
                      index,
                      'cost',
                      val !== null && val !== undefined ? Number(val) : 0,
                    )
                "
              />
            </div>

            <!-- 5. سعر الجمهور (بالعملة المحلية) -->
            <div :class="isForeignCurrency ? 'col-span-2' : 'col-span-3'" @click.stop>
              <AppCurrencyInput
                :id="'unit-price-' + index"
                label="سعر الجمهور"
                :model-value="row.price"
                :precision="2"
                label-class="!text-[10px] !font-bold text-text-secondary !mb-1 text-right"
                input-class="!px-2.5 !py-2 !text-xs !font-mono !font-bold !text-right !bg-surface-section !border-surface-border"
                @update:model-value="
                  (val) =>
                    modifyUnitRowField(
                      index,
                      'price',
                      val !== null && val !== undefined ? Number(val) : 0,
                    )
                "
              />
            </div>

            <!-- 6. زر الحذف -->
            <div class="col-span-1 flex justify-center items-center pt-5">
              <button
                v-if="index > 0"
                type="button"
                @click.stop="removeUnitRow(index)"
                class="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                title="حذف هذه الوحدة"
              >
                ✕
              </button>
              <div v-else class="h-8 w-1"></div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="itemStore.validationErrors && itemStore.validationErrors.units"
        class="mt-4 p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-lg"
      >
        <p
          v-for="(err, i) in itemStore.validationErrors.units"
          :key="i"
          class="text-rose-600 dark:text-rose-400 text-xs font-bold"
        >
          {{ err }}
        </p>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import { useUnitStore } from '@/stores/unitStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const props = defineProps({
  formState: { type: Object, required: true },
  activeIndex: { type: Number, required: true },
})

const emit = defineEmits(['update:formState', 'update:activeIndex', 'clear-error'])

const itemStore = useItemStore()
const unitStore = useUnitStore()
const currencyStore = useCurrencyStore()

/**
 * جلب العملة المرجعية المحددة وسعر صرفها النشط
 */
const selectedCurrency = computed(() => {
  if (!props.formState.purchase_currency_id) return null
  const curr = currencyStore.currencies.find((c) => c.id === props.formState.purchase_currency_id)
  if (!curr) return null

  const rateVal = curr.latest_exchange_rate?.rate || curr.exchange_rate || curr.rate || 1

  return {
    id: curr.id,
    name: curr.name,
    code: curr.code,
    exchange_rate: Number(rateVal),
  }
})

const isForeignCurrency = computed(() => {
  return !!selectedCurrency.value && selectedCurrency.value.exchange_rate > 0
})

/**
 * تطبيق قواعد التقريب السعري المعتمدة في النظام
 */
const applyRounding = (price, rule = 'none') => {
  if (!price || price <= 0) return 0

  switch (rule) {
    case 'nearest_50':
      return Math.round(price / 50) * 50
    case 'nearest_100':
      return Math.round(price / 100) * 100
    case 'nearest_500':
      return Math.round(price / 500) * 500
    case 'psychological_90': {
      const base = 100
      const ending = 90
      if (price <= ending) return ending
      const remainder = price % base
      const baseFloor = Math.floor(price / base) * base
      return remainder <= ending ? baseFloor + ending : baseFloor + base + ending
    }
    case 'psychological_900': {
      const base = 1000
      const ending = 900
      if (price <= ending) return ending
      const remainder = price % base
      const baseFloor = Math.floor(price / base) * base
      return remainder <= ending ? baseFloor + ending : baseFloor + base + ending
    }
    default:
      return Number(price.toFixed(2))
  }
}

/**
 * دالة مساعدة لتحديث مصفوفة فئات الأسعار التابعة للوحدة
 */
const updatePricesArray = (pricesList, newPrice, roundingRule) => {
  if (!pricesList || pricesList.length === 0) return []
  return pricesList.map((pr) => {
    const discount = Number(pr.discount_percentage || 0)
    const discountedPrice = newPrice * (1 - discount / 100)
    return {
      ...pr,
      price: applyRounding(discountedPrice, roundingRule),
    }
  })
}

/**
 * تعديل الحقول ومزامنة foreign_cost و cost والاشتقاق الشجري التلقائي (عند الإدخال اليدوي فقط)
 */
const modifyUnitRowField = (index, field, value) => {
  emit('clear-error', 'units')

  const roundingRule = props.formState.rounding_rule || 'none'
  const margin = Number(props.formState.profit_margin || 0)
  const rate = selectedCurrency.value?.exchange_rate || 1

  let clonedUnits = JSON.parse(JSON.stringify(props.formState.units))

  // 1. التعديل على الوحدة القياسية الصغرى (السطر الأول index 0)
  if (index === 0) {
    if (field === 'foreign_cost') {
      const baseForeignCost = Number(value)
      const baseCost = Number((baseForeignCost * rate).toFixed(4))
      const rawBasePrice = baseCost * (1 + margin / 100)
      const basePrice = applyRounding(rawBasePrice, roundingRule)

      clonedUnits[0].foreign_cost = baseForeignCost
      clonedUnits[0].cost = baseCost
      clonedUnits[0].price = basePrice
      clonedUnits[0].prices = updatePricesArray(clonedUnits[0].prices, basePrice, roundingRule)

      // توريث الحقول تلقائياً لكافة الوحدات الكبرى المرتبطة
      for (let i = 1; i < clonedUnits.length; i++) {
        const factor = Number(clonedUnits[i].conversion_factor || 1)
        const unitForeignCost = Number((baseForeignCost * factor).toFixed(4))
        const unitCost = Number((baseCost * factor).toFixed(4))
        const unitPrice = applyRounding(basePrice * factor, roundingRule)

        clonedUnits[i].foreign_cost = unitForeignCost
        clonedUnits[i].cost = unitCost
        clonedUnits[i].price = unitPrice
        clonedUnits[i].prices = updatePricesArray(clonedUnits[i].prices, unitPrice, roundingRule)
      }
    } else if (field === 'cost') {
      const baseCost = Number(value)
      const baseForeignCost = isForeignCurrency.value ? Number((baseCost / rate).toFixed(4)) : null
      const rawBasePrice = baseCost * (1 + margin / 100)
      const basePrice = applyRounding(rawBasePrice, roundingRule)

      clonedUnits[0].cost = baseCost
      clonedUnits[0].foreign_cost = baseForeignCost
      clonedUnits[0].price = basePrice
      clonedUnits[0].prices = updatePricesArray(clonedUnits[0].prices, basePrice, roundingRule)

      // توريث الحقول لكافة الوحدات الكبرى
      for (let i = 1; i < clonedUnits.length; i++) {
        const factor = Number(clonedUnits[i].conversion_factor || 1)
        const unitCost = Number((baseCost * factor).toFixed(4))
        const unitForeignCost = isForeignCurrency.value
          ? Number((baseForeignCost * factor).toFixed(4))
          : null
        const unitPrice = applyRounding(basePrice * factor, roundingRule)

        clonedUnits[i].cost = unitCost
        clonedUnits[i].foreign_cost = unitForeignCost
        clonedUnits[i].price = unitPrice
        clonedUnits[i].prices = updatePricesArray(clonedUnits[i].prices, unitPrice, roundingRule)
      }
    } else if (field === 'price') {
      const basePrice = Number(value)
      clonedUnits[0].price = basePrice
      clonedUnits[0].prices = updatePricesArray(clonedUnits[0].prices, basePrice, roundingRule)

      for (let i = 1; i < clonedUnits.length; i++) {
        const factor = Number(clonedUnits[i].conversion_factor || 1)
        const unitPrice = applyRounding(basePrice * factor, roundingRule)

        clonedUnits[i].price = unitPrice
        clonedUnits[i].prices = updatePricesArray(clonedUnits[i].prices, unitPrice, roundingRule)
      }
    } else {
      clonedUnits[0][field] = value
    }
  } else {
    // 2. التعديل على إحدى الوحدات الإضافية (index > 0)
    const baseUnit = clonedUnits[0] || { cost: 0, price: 0, foreign_cost: null }

    if (field === 'conversion_factor') {
      const factor = Number(value > 0 ? value : 1)
      const derivedCost = Number((Number(baseUnit.cost || 0) * factor).toFixed(4))
      const derivedForeignCost =
        isForeignCurrency.value && baseUnit.foreign_cost !== null
          ? Number((Number(baseUnit.foreign_cost || 0) * factor).toFixed(4))
          : isForeignCurrency.value
            ? Number((derivedCost / rate).toFixed(4))
            : null
      const derivedPrice = applyRounding(Number(baseUnit.price || 0) * factor, roundingRule)

      clonedUnits[index].conversion_factor = value
      clonedUnits[index].cost = derivedCost
      clonedUnits[index].foreign_cost = derivedForeignCost
      clonedUnits[index].price = derivedPrice
      clonedUnits[index].prices = updatePricesArray(
        clonedUnits[index].prices,
        derivedPrice,
        roundingRule,
      )
    } else if (field === 'foreign_cost') {
      const customForeignCost = Number(value)
      const customCost = Number((customForeignCost * rate).toFixed(4))
      const rawPrice = customCost * (1 + margin / 100)
      const calculatedPrice = applyRounding(rawPrice, roundingRule)

      clonedUnits[index].foreign_cost = customForeignCost
      clonedUnits[index].cost = customCost
      clonedUnits[index].price = calculatedPrice
      clonedUnits[index].prices = updatePricesArray(
        clonedUnits[index].prices,
        calculatedPrice,
        roundingRule,
      )
    } else if (field === 'cost') {
      const customCost = Number(value)
      const customForeignCost = isForeignCurrency.value
        ? Number((customCost / rate).toFixed(4))
        : null
      const rawPrice = customCost * (1 + margin / 100)
      const calculatedPrice = applyRounding(rawPrice, roundingRule)

      clonedUnits[index].cost = customCost
      clonedUnits[index].foreign_cost = customForeignCost
      clonedUnits[index].price = calculatedPrice
      clonedUnits[index].prices = updatePricesArray(
        clonedUnits[index].prices,
        calculatedPrice,
        roundingRule,
      )
    } else if (field === 'price') {
      const customPrice = Number(value)
      clonedUnits[index].price = customPrice
      clonedUnits[index].prices = updatePricesArray(
        clonedUnits[index].prices,
        customPrice,
        roundingRule,
      )
    } else {
      clonedUnits[index][field] = value
    }
  }

  emit('update:formState', { ...props.formState, units: clonedUnits })
}

/**
 * إضافة سطر وحدة إضافية مع تثبيت foreign_cost واشتقاقه فورياً من الوحدة الصغرى
 */
const addUnitRow = () => {
  const baseUnit = props.formState.units[0] || { cost: 0, price: 0, foreign_cost: null }
  const roundingRule = props.formState.rounding_rule || 'none'
  const rate = selectedCurrency.value?.exchange_rate || 1
  const initialFactor = 1

  const initialCost = Number(baseUnit.cost || 0) * initialFactor
  const initialForeignCost = isForeignCurrency.value
    ? baseUnit.foreign_cost !== null && baseUnit.foreign_cost !== undefined
      ? Number(baseUnit.foreign_cost) * initialFactor
      : Number((initialCost / rate).toFixed(4))
    : null

  const initialPrice = Number(baseUnit.price || 0) * initialFactor

  const defaultPrices = itemStore.priceLists.map((pl) => {
    return {
      price_list_id: pl.id,
      price_list_name: pl.name,
      discount_percentage: 0,
      price: applyRounding(initialPrice, roundingRule),
    }
  })

  const updatedUnits = [
    ...props.formState.units,
    {
      unit_id: null,
      conversion_factor: initialFactor,
      cost: initialCost,
      foreign_cost: initialForeignCost,
      price: initialPrice,
      barcodes: [],
      prices: defaultPrices,
    },
  ]

  emit('update:formState', { ...props.formState, units: updatedUnits })
  emit('update:activeIndex', updatedUnits.length - 1)
}

/**
 * حذف سطر وحدة إضافية بأمان مراجع تام وحماية مؤشر التحديد
 */
const removeUnitRow = (index) => {
  const updatedUnits = props.formState.units.filter((_, idx) => idx !== index)

  emit('update:formState', { ...props.formState, units: updatedUnits })

  if (props.activeIndex >= updatedUnits.length) {
    emit('update:activeIndex', updatedUnits.length - 1)
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>
