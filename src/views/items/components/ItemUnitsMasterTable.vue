<!--src\views\items\components\ItemUnitsMasterTable.vue--->
<template>
  <AppCard>
    <div class="space-y-4">
      <!-- ترويسة الكرت وزر إضافة وحدة -->
      <div
        class="flex flex-wrap justify-between items-center gap-2 border-b border-surface-border pb-3"
      >
        <div>
          <h3 class="text-sm font-black text-text-primary">
            وحدات القياس وسياسات التكلفة وسعر البيع
          </h3>
          <p class="text-xs text-text-muted mt-0.5">
            عرض وتعديل أسطر الوحدات، ومعاملات التحويل، والتكلفة، وسعر بيع الجمهور
          </p>
        </div>
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          :disabled="!props.formState.base_unit_id"
          @click="addUnitRow"
        >
          + إضافة وحدة قياس إضافية
        </AppButton>
      </div>

      <!-- حالة عدم تحديد الوحدة الأساسية بعد -->
      <div
        v-if="props.formState.units.length === 0"
        class="text-center py-8 bg-surface-ground/50 rounded-xl border border-dashed border-surface-border text-text-muted text-xs italic"
      >
        يرجى اختيار الوحدة الأساسية الصغرى في قسم البيانات الأساسية أولاً لتأسيس جدول الوحدات
        تلقائياً.
      </div>

      <!-- قائمة أسطر الوحدات بكامل العرض المتناسق -->
      <div v-else class="space-y-3">
        <div
          v-for="(row, index) in props.formState.units"
          :key="index"
          @click="emit('update:activeIndex', index)"
          :class="[
            'p-4 rounded-xl border transition-all cursor-pointer relative',
            props.activeIndex === index
              ? 'bg-primary/[0.03] border-primary ring-1 ring-primary/20 shadow-xs border-r-4 border-r-primary'
              : 'bg-surface-ground/60 border-surface-border hover:border-surface-border/90',
          ]"
        >
          <!-- شريط علوي يوضح نوع الوحدة ومؤشر التحديد النشط -->
          <div
            class="flex items-center justify-between pb-3 mb-3 border-b border-surface-border/70"
          >
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'text-xs font-black px-2.5 py-0.5 rounded-md border',
                  index === 0
                    ? 'bg-primary/10 text-primary border-primary/25'
                    : 'bg-surface-section text-text-secondary border-surface-border',
                ]"
              >
                {{
                  index === 0 ? 'الوحدة الأساسية الصغرى (قاعدة الجرد)' : `وحدة إضافية #${index + 1}`
                }}
              </span>

              <span
                v-if="props.activeIndex === index"
                class="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md"
              >
                <span>●</span> تفاصيل الباركود والأسعار معروضة بالأسفل
              </span>
            </div>

            <!-- زر حذف السطر للوحدات الإضافية -->
            <button
              v-if="index > 0"
              type="button"
              @click.stop="removeUnitRow(index)"
              class="text-xs font-bold text-danger hover:bg-danger/10 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              title="حذف هذه الوحدة"
            >
              إزالة الوحدة ✕
            </button>
          </div>

          <!-- شبكة حقول السطر المالية بمساحات تنفس واسعة (12 عمود على كامل العرض) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
            <!-- 1. اختيار الوحدة -->
            <div :class="isForeignCurrency ? 'lg:col-span-3' : 'lg:col-span-4'" @click.stop>
              <label
                :for="'unit-dropdown-' + index"
                class="block text-xs font-bold text-text-secondary mb-1.5"
              >
                اسم الوحدة
                <span v-if="index === 0" class="text-text-muted text-[10px]">(أساسية)</span>
              </label>
              <AppDropdown
                :id="'unit-dropdown-' + index"
                :model-value="row.unit_id"
                :options="unitStore.units"
                option-label="name"
                option-value="id"
                :disabled="index === 0"
                placeholder="اختر الوحدة..."
                :show-clear="false"
                @update:model-value="
                  (val) => modifyUnitRowField(index, 'unit_id', val !== null ? Number(val) : null)
                "
              />
            </div>

            <!-- 2. معامل التحويل -->
            <div class="lg:col-span-2" @click.stop>
              <label
                :for="'unit-factor-' + index"
                class="block text-xs font-bold text-text-secondary mb-1.5 text-center"
              >
                معامل التحويل
              </label>
              <AppInput
                :id="'unit-factor-' + index"
                type="number"
                step="0.0001"
                :model-value="row.conversion_factor"
                :disabled="index === 0"
                input-class="h-10 text-center font-bold font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                @update:model-value="
                  (val) => modifyUnitRowField(index, 'conversion_factor', Number(val))
                "
              />
            </div>

            <!-- 3. التكلفة بالعملة الأجنبية (تظهر فقط عند وجود عملة شراء أجنبية) -->
            <div v-if="isForeignCurrency" class="lg:col-span-2" @click.stop>
              <AppCurrencyInput
                :id="'unit-foreign-cost-' + index"
                :label="'التكلفة (' + (selectedCurrency?.code || '') + ')'"
                :model-value="row.foreign_cost"
                :precision="4"
                label-class="!text-xs !font-bold !text-primary !mb-1.5 text-right truncate"
                input-class="!h-10 !px-3 !text-xs !font-mono !font-bold !text-right !bg-surface-section !border-surface-border focus:!border-primary"
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

            <!-- 4. التكلفة بالعملة المحلية -->
            <div :class="isForeignCurrency ? 'lg:col-span-2' : 'lg:col-span-3'" @click.stop>
              <AppCurrencyInput
                :id="'unit-local-cost-' + index"
                label="التكلفة المحلية"
                :model-value="row.cost"
                :precision="2"
                label-class="!text-xs !font-bold !text-text-secondary !mb-1.5 text-right"
                input-class="!h-10 !px-3 !text-xs !font-mono !font-bold !text-right !bg-surface-section !border-surface-border focus:!border-primary"
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

            <!-- 5. سعر بيع الجمهور -->
            <div :class="isForeignCurrency ? 'lg:col-span-3' : 'lg:col-span-3'" @click.stop>
              <AppCurrencyInput
                :id="'unit-price-' + index"
                label="سعر بيع الجمهور"
                :model-value="row.price"
                :precision="2"
                label-class="!text-xs !font-bold !text-text-secondary !mb-1.5 text-right"
                input-class="!h-10 !px-3 !text-xs !font-mono !font-bold !text-right !bg-surface-section !border-surface-border focus:!border-primary"
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
          </div>
        </div>
      </div>

      <!-- عرض أخطاء التحقق القادمة من الباك إند للوحدات -->
      <div
        v-if="itemStore.validationErrors && itemStore.validationErrors.units"
        class="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-xl space-y-1"
      >
        <p
          v-for="(err, i) in itemStore.validationErrors.units"
          :key="i"
          class="text-danger text-xs font-bold"
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

const modifyUnitRowField = (index, field, value) => {
  emit('clear-error', 'units')

  const roundingRule = props.formState.rounding_rule || 'none'
  const margin = Number(props.formState.profit_margin || 0)
  const rate = selectedCurrency.value?.exchange_rate || 1

  let clonedUnits = JSON.parse(JSON.stringify(props.formState.units))

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

const removeUnitRow = (index) => {
  const updatedUnits = props.formState.units.filter((_, idx) => idx !== index)

  emit('update:formState', { ...props.formState, units: updatedUnits })

  if (props.activeIndex >= updatedUnits.length) {
    emit('update:activeIndex', updatedUnits.length - 1)
  }
}
</script>
