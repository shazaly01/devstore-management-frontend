<!--src/views/items/components/ItemUnitsMasterTable.vue-->
<template>
  <AppCard>
    <div class="space-y-4">
      <!-- 1. ترويسة الكرت مع زر إضافة وحدة قياس إضافية -->
      <div
        class="flex flex-wrap justify-between items-center gap-3 border-b border-surface-border pb-3"
      >
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
          <div>
            <h3 class="text-sm font-black text-text-primary">
              وحدات القياس الإضافية ومعاملات التحويل
            </h3>
            <p class="text-xs text-text-muted mt-0.5">
              تعريف وحدات التعبئة الأكبر (كرتونة، باكت...) واحتساب تكاليفها وأسعارها آلياً
            </p>
          </div>
        </div>

        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          :disabled="!props.formState.base_unit_id"
          @click="addUnitRow"
          class="shrink-0"
        >
          + إضافة وحدة قياس إضافية
        </AppButton>
      </div>

      <!-- تنبيه في حال عدم اختيار الوحدة الأساسية بعد -->
      <div
        v-if="!props.formState.units || props.formState.units.length === 0"
        class="text-center py-8 bg-surface-ground/40 rounded-xl border border-dashed border-surface-border text-text-muted text-xs italic space-y-1"
      >
        <p class="font-bold text-text-secondary">لم يتم تأسيس جدول الوحدات بعد.</p>
        <p>يرجى اختيار الوحدة الأساسية الصغرى في تبويب "البيانات والتسعير السريع" أولاً.</p>
      </div>

      <!-- جدول بيانات الوحدات -->
      <div v-else class="overflow-x-auto custom-scrollbar -mx-1 p-1">
        <table class="w-full text-right border-collapse min-w-[780px]">
          <thead>
            <tr
              class="border-b border-surface-border text-[11px] font-black text-text-muted bg-surface-ground/70 rounded-lg"
            >
              <th class="py-2.5 px-3 rounded-r-lg">النوع</th>
              <th class="py-2.5 px-3 min-w-[150px]">اسم الوحدة</th>
              <th class="py-2.5 px-3 text-center min-w-[110px]">معامل التحويل</th>
              <th v-if="isForeignCurrency" class="py-2.5 px-3 text-right min-w-[130px]">
                التكلفة ({{ selectedCurrency?.code || '' }})
              </th>
              <th class="py-2.5 px-3 text-right min-w-[130px]">التكلفة المحلية</th>
              <th class="py-2.5 px-3 text-right min-w-[130px]">سعر الجمهور</th>
              <th class="py-2.5 px-3 text-center min-w-[130px]">الباركودات</th>
              <th class="py-2.5 px-3 text-center rounded-l-lg w-16">إجراء</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-surface-border/50 text-xs">
            <tr
              v-for="(row, index) in props.formState.units"
              :key="index"
              @click="handleRowClick(index)"
              :class="[
                'transition-colors cursor-pointer group',
                props.isDetailsOpen && props.activeIndex === index
                  ? 'bg-primary/[0.04] font-bold border-r-4 border-r-primary'
                  : 'hover:bg-surface-ground/60',
              ]"
            >
              <!-- 1. نوع الوحدة -->
              <td class="py-3 px-3 whitespace-nowrap">
                <span
                  :class="[
                    'text-[10px] font-black px-2 py-0.5 rounded-md border inline-block',
                    index === 0
                      ? 'bg-primary/10 text-primary border-primary/25'
                      : 'bg-surface-section text-text-secondary border-surface-border',
                  ]"
                >
                  {{ index === 0 ? 'قاعدة الجرد' : `إضافية #${index}` }}
                </span>
              </td>

              <!-- 2. اسم الوحدة -->
              <td class="py-3 px-3" @click.stop>
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
              </td>

              <!-- 3. معامل التحويل (كم وحدة صغرى تحتوي هذه الوحدة) -->
              <td class="py-3 px-3" @click.stop>
                <AppInput
                  :id="'unit-factor-' + index"
                  type="number"
                  step="0.0001"
                  :model-value="row.conversion_factor"
                  :disabled="index === 0"
                  input-class="!h-9 text-center font-bold font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  @update:model-value="
                    (val) => modifyUnitRowField(index, 'conversion_factor', Number(val))
                  "
                />
              </td>

              <!-- 4. التكلفة بالعملة الأجنبية -->
              <td v-if="isForeignCurrency" class="py-3 px-3" @click.stop>
                <AppCurrencyInput
                  :id="'unit-foreign-cost-' + index"
                  :model-value="row.foreign_cost"
                  :precision="4"
                  input-class="!h-9 !px-2.5 !text-xs !font-mono !font-bold !text-right !bg-surface-ground focus:!bg-surface-section !border-surface-border focus:!border-primary"
                  @update:model-value="
                    (val) =>
                      modifyUnitRowField(
                        index,
                        'foreign_cost',
                        val !== null && val !== undefined ? Number(val) : 0,
                      )
                  "
                />
              </td>

              <!-- 5. التكلفة بالعملة المحلية -->
              <td class="py-3 px-3" @click.stop>
                <AppCurrencyInput
                  :id="'unit-local-cost-' + index"
                  :model-value="row.cost"
                  :precision="2"
                  input-class="!h-9 !px-2.5 !text-xs !font-mono !font-bold !text-right !bg-surface-ground focus:!bg-surface-section !border-surface-border focus:!border-primary"
                  @update:model-value="
                    (val) =>
                      modifyUnitRowField(
                        index,
                        'cost',
                        val !== null && val !== undefined ? Number(val) : 0,
                      )
                  "
                />
              </td>

              <!-- 6. سعر بيع الجمهور -->
              <td class="py-3 px-3" @click.stop>
                <AppCurrencyInput
                  :id="'unit-price-' + index"
                  :model-value="row.price"
                  :precision="2"
                  input-class="!h-9 !px-2.5 !text-xs !font-mono !font-bold !text-right !bg-surface-ground focus:!bg-surface-section !border-surface-border focus:!border-primary"
                  @update:model-value="
                    (val) =>
                      modifyUnitRowField(
                        index,
                        'price',
                        val !== null && val !== undefined ? Number(val) : 0,
                      )
                  "
                />
              </td>

              <!-- 7. زر فتح وإدارة باركودات هذه الوحدة -->
              <td class="py-3 px-3 text-center whitespace-nowrap" @click.stop>
                <button
                  type="button"
                  @click="emit('toggle-details', index)"
                  :class="[
                    'text-[11px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer inline-flex items-center gap-1.5 select-none border',
                    props.isDetailsOpen && props.activeIndex === index
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface-section text-text-secondary hover:text-primary hover:border-primary/40 border-surface-border',
                  ]"
                >
                  <span>🏷️</span>
                  <span>{{ (row.barcodes && row.barcodes.length) || 0 }} باركود</span>
                  <span>{{ props.isDetailsOpen && props.activeIndex === index ? '▲' : '▾' }}</span>
                </button>
              </td>

              <!-- 8. إجراءات: حذف الوحدة الإضافية -->
              <td class="py-3 px-3 text-center whitespace-nowrap" @click.stop>
                <button
                  v-if="index > 0"
                  type="button"
                  @click="removeUnitRow(index)"
                  class="text-text-muted hover:text-danger hover:bg-danger/10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors mx-auto cursor-pointer"
                  title="حذف هذه الوحدة الإضافية"
                >
                  ✕
                </button>
                <span v-else class="text-text-muted text-[10px] select-none">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- عرض أخطاء التحقق الخاصة بالوحدات -->
      <div
        v-if="itemStore.validationErrors && itemStore.validationErrors.units"
        class="mt-2 p-3 bg-danger/10 border border-danger/20 rounded-xl space-y-1"
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
  isDetailsOpen: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:formState',
  'update:activeIndex',
  'toggle-details',
  'clear-error',
])

const itemStore = useItemStore()
const unitStore = useUnitStore()
const currencyStore = useCurrencyStore()

const handleRowClick = (index) => {
  emit('update:activeIndex', index)
}

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
    // تعديل الوحدة الأساسية ينعكس نسبياً على كافة الوحدات الإضافية
    if (field === 'foreign_cost') {
      const baseForeignCost = Number(value)
      const baseCost = Number((baseForeignCost * rate).toFixed(2))
      const rawBasePrice = baseCost * (1 + margin / 100)
      const basePrice = applyRounding(rawBasePrice, roundingRule)

      clonedUnits[0].foreign_cost = baseForeignCost
      clonedUnits[0].cost = baseCost
      clonedUnits[0].price = basePrice
      clonedUnits[0].prices = updatePricesArray(clonedUnits[0].prices, basePrice, roundingRule)

      for (let i = 1; i < clonedUnits.length; i++) {
        const factor = Number(clonedUnits[i].conversion_factor || 1)
        const unitForeignCost = Number((baseForeignCost * factor).toFixed(4))
        const unitCost = Number((baseCost * factor).toFixed(2))
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
        const unitCost = Number((baseCost * factor).toFixed(2))
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
    // تعديل وحدة إضافية محددة
    const baseUnit = clonedUnits[0] || { cost: 0, price: 0, foreign_cost: null }

    if (field === 'conversion_factor') {
      const factor = Number(value > 0 ? value : 1)
      const derivedCost = Number((Number(baseUnit.cost || 0) * factor).toFixed(2))
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
      const customCost = Number((customForeignCost * rate).toFixed(2))
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

  const initialCost = Number((Number(baseUnit.cost || 0) * initialFactor).toFixed(2))
  const initialForeignCost = isForeignCurrency.value
    ? baseUnit.foreign_cost !== null && baseUnit.foreign_cost !== undefined
      ? Number((Number(baseUnit.foreign_cost) * initialFactor).toFixed(4))
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
  emit('toggle-details', updatedUnits.length - 1)
}

const removeUnitRow = (index) => {
  const updatedUnits = props.formState.units.filter((_, idx) => idx !== index)

  emit('update:formState', { ...props.formState, units: updatedUnits })

  if (props.activeIndex >= updatedUnits.length) {
    emit('update:activeIndex', Math.max(0, updatedUnits.length - 1))
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-surface-border));
  border-radius: 10px;
}
</style>
