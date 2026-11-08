<!--src/views/items/components/ItemBaseInfo.vue-->
<template>
  <AppCard>
    <!-- بطاقة واحدة مريحة وبسيطة ترتب كل عناصر المسار السريع رأسياً تحت بعضها -->
    <div class="max-w-2xl mx-auto space-y-4 py-1">
      <!-- 1. التصنيف الشجري للصنف -->
      <div>
        <label for="item-category" class="block text-xs font-bold text-text-secondary mb-1.5">
          التصنيف الشجري للصنف
        </label>
        <AppDropdown
          id="item-category"
          :model-value="props.formState.category_id"
          @update:model-value="(val) => updateField('category_id', val)"
          :options="categoryOptions"
          placeholder="اختر فئة التصنيف..."
        />
        <div v-if="validationErrors && validationErrors.category_id" class="mt-1 space-y-0.5">
          <p
            v-for="(err, i) in validationErrors.category_id"
            :key="i"
            class="text-danger text-xs font-bold"
          >
            {{ err }}
          </p>
        </div>
      </div>

      <!-- 2. الوحدة الأساسية الصغرى (قاعدة الجرد) -->
      <div>
        <label for="item-base-unit" class="block text-xs font-bold text-text-secondary mb-1.5">
          الوحدة الأساسية الصغرى (قاعدة الجرد) <span class="text-danger">*</span>
        </label>
        <AppDropdown
          id="item-base-unit"
          :model-value="props.formState.base_unit_id"
          @update:model-value="(val) => handleBaseUnitChange(val !== null ? Number(val) : null)"
          :options="unitStore.units"
          option-label="name"
          option-value="id"
          placeholder="اختر الوحدة الصغرى التي يتم جرد الصنف بها..."
          :disabled="isEditMode"
          :show-clear="false"
        />
        <div v-if="validationErrors && validationErrors.base_unit_id" class="mt-1 space-y-0.5">
          <p
            v-for="(err, i) in validationErrors.base_unit_id"
            :key="i"
            class="text-danger text-xs font-bold"
          >
            {{ err }}
          </p>
        </div>
      </div>

      <!-- 3. شريط العملة المرجعية وسعر صرف اليوم للصنف -->
      <div class="p-3 bg-surface-ground/50 rounded-xl border border-surface-border space-y-3">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div class="flex-1">
            <label for="purchase-currency" class="block text-xs font-bold text-text-secondary mb-1">
              العملة المرجعية للتكلفة
            </label>
            <AppDropdown
              id="purchase-currency"
              :model-value="props.formState.purchase_currency_id"
              @update:model-value="(val) => handleCurrencyChange(val)"
              :options="currencyOptions"
              placeholder="العملة المحلية الافتراضية..."
            />
          </div>

          <!-- سعر صرف اليوم للصنف (يظهر فور اختيار عملة أجنبية ويظل ثابتاً بين الأصناف) -->
          <div v-if="isForeignCurrency" class="w-full sm:w-44">
            <label for="custom-rate" class="block text-xs font-bold text-primary mb-1">
              سعر الصرف للصنف
            </label>
            <AppInput
              id="custom-rate"
              type="number"
              step="0.01"
              :model-value="activeExchangeRate"
              @update:model-value="handleRateAdjustment"
              input-class="h-10 text-xs font-bold font-mono text-center"
            />
          </div>
        </div>
      </div>

      <!-- 4. كبسولة التسعير التبادلي المزدوج (أجنبي ⇄ محلي) وهامش وسعر البيع -->
      <div
        v-if="props.formState.base_unit_id"
        class="p-4 bg-surface-ground/30 rounded-xl border border-primary/20 space-y-3.5"
      >
        <div class="flex items-center justify-between border-b border-surface-border/60 pb-2">
          <span class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span>⚡</span>
            <span>تسعير الوحدة الأساسية [{{ baseUnitName }}]</span>
          </span>
          <span
            class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded select-none"
          >
            احتساب تبادلي فوري
          </span>
        </div>

        <!-- أ. التكلفة بالعملة الأجنبية (مكتوبة باسم العملة الصريح وليس الرمز) -->
        <div v-if="isForeignCurrency">
          <AppCurrencyInput
            id="base-foreign-cost"
            :label="`تكلفة الشراء بـ (${selectedCurrencyInfo?.name || 'العملة المرجعية'})`"
            :model-value="baseUnitForeignCost"
            :precision="4"
            label-class="!text-xs !font-bold !text-primary !mb-1"
            input-class="!h-10 !px-3 !text-xs !font-mono !font-bold !text-right !bg-surface-section !border-surface-border focus:!border-primary"
            @update:model-value="handleForeignCostInput"
          />
        </div>

        <!-- ب. تكلفة الشراء بالعملة المحلية -->
        <div>
          <AppCurrencyInput
            id="base-local-cost"
            label="تكلفة الشراء بالعملة المحلية"
            :model-value="baseUnitCost"
            :precision="2"
            label-class="!text-xs !font-bold !text-text-secondary !mb-1"
            input-class="!h-10 !px-3 !text-xs !font-mono !font-bold !text-right !bg-surface-section !border-surface-border focus:!border-primary"
            @update:model-value="handleLocalCostInput"
          />
        </div>

        <!-- ج. هامش الربح المستهدف (%) -->
        <div>
          <label
            for="direct-profit-margin"
            class="block text-xs font-bold text-text-secondary mb-1"
          >
            هامش الربح المستهدف (%)
          </label>
          <div class="relative">
            <AppInput
              id="direct-profit-margin"
              :model-value="props.formState.profit_margin"
              @update:model-value="(val) => updateProfitMargin(val ? Number(val) : 0)"
              type="number"
              min="0"
              max="1000"
              step="0.01"
              placeholder="0.00"
              input-class="h-10 text-xs font-bold font-mono text-center pr-3 pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-text-muted pointer-events-none select-none"
            >
              %
            </span>
          </div>
        </div>

        <!-- د. سعر بيع الجمهور المعتمد للوحدة الأساسية -->
        <div>
          <AppCurrencyInput
            id="base-unit-price"
            label="سعر بيع الجمهور المعتمد"
            :model-value="baseUnitPrice"
            :precision="2"
            label-class="!text-xs !font-bold !text-primary !mb-1"
            input-class="!h-10 !px-3 !text-xs !font-mono !font-bold !text-right !bg-surface-section !border-primary/50 focus:!border-primary ring-1 ring-primary/20"
            @update:model-value="handleDirectPriceInput"
          />
        </div>
      </div>

      <!-- 5. الباركود السريع المباشر للوحدة الأساسية -->
      <div class="p-3.5 bg-surface-ground/40 rounded-xl border border-surface-border space-y-2">
        <div class="flex items-center justify-between">
          <label
            for="quick-barcode-input"
            class="text-xs font-bold text-text-secondary flex items-center gap-1.5"
          >
            <span>🏷️</span>
            <span>الباركود السريع (يدعم الإسكانر مباشرة)</span>
          </label>
          <span
            v-if="baseUnitBarcodes.length > 0"
            class="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20"
          >
            {{ baseUnitBarcodes.length }} مسجل
          </span>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <input
              id="quick-barcode-input"
              v-model="quickBarcode"
              @keydown.enter.prevent="handleQuickBarcodeAdd"
              type="text"
              :disabled="!props.formState.base_unit_id"
              placeholder="امسح الباركود بالإسكانر أو اكتب الرقم واضغط Enter..."
              class="block w-full h-10 pr-3 pl-16 border border-surface-border rounded-lg bg-surface-section text-text-primary text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:bg-surface-ground"
            />
            <span
              class="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-text-muted bg-surface-ground px-1.5 py-0.5 rounded border border-surface-border pointer-events-none select-none"
            >
              Enter ↩
            </span>
          </div>

          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            class="h-10 px-3.5 shrink-0"
            :disabled="!quickBarcode.trim() || !props.formState.base_unit_id"
            @click="handleQuickBarcodeAdd"
          >
            + إضافة
          </AppButton>
        </div>

        <!-- وسوم الباركودات المسجلة للوحدة الأساسية -->
        <div v-if="baseUnitBarcodes.length > 0" class="flex flex-wrap gap-1.5 pt-1">
          <span
            v-for="(bc, bIdx) in baseUnitBarcodes"
            :key="bIdx"
            class="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-section text-text-primary font-mono text-xs font-bold rounded-md border border-surface-border shadow-2xs"
          >
            <span>{{ bc }}</span>
            <button
              type="button"
              @click="removeQuickBarcode(bIdx)"
              class="text-text-muted hover:text-danger text-xs font-bold cursor-pointer"
              title="إزالة هذا الباركود"
            >
              ✕
            </button>
          </span>
        </div>
      </div>

      <!-- 6. تاريخ انتهاء الصلاحية (اختياري) -->
      <div>
        <label for="expiry-date" class="block text-xs font-bold text-text-secondary mb-1.5">
          تاريخ انتهاء الصلاحية (اختياري)
        </label>
        <AppInput
          id="expiry-date"
          :model-value="props.formState.expiry_date"
          @update:model-value="(val) => updateField('expiry_date', val)"
          type="date"
          input-class="h-10 text-xs font-bold"
        />
        <div v-if="validationErrors && validationErrors.expiry_date" class="mt-1 space-y-0.5">
          <p
            v-for="(err, i) in validationErrors.expiry_date"
            :key="i"
            class="text-danger text-xs font-bold"
          >
            {{ err }}
          </p>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { useUnitStore } from '@/stores/unitStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const props = defineProps({
  formState: { type: Object, required: true },
})

const emit = defineEmits(['update:formState', 'clear-error'])

const route = useRoute()
const itemStore = useItemStore()
const unitStore = useUnitStore()
const categoryStore = useCategoryStore()
const currencyStore = useCurrencyStore()
const toast = useToast()

const { validationErrors } = storeToRefs(itemStore)
const isEditMode = computed(() => !!route.params.id)
const quickBarcode = ref('')
const customExchangeRate = ref(null)

// تفريغ حقل الباركود تلقائياً عند تصفير اسم الصنف للصنف الجديد
watch(
  () => props.formState.name,
  (newVal) => {
    if (!newVal) {
      quickBarcode.value = ''
    }
  },
)

// تفريغ حقل الباركود عند تصفير الوحدة
watch(
  () => props.formState.base_unit_id,
  (newVal) => {
    if (!newVal) {
      quickBarcode.value = ''
    }
  },
)

const categoryOptions = computed(() => {
  return categoryStore.categories.map((cat) => ({
    id: cat.id,
    name: cat.full_path || cat.indent_name || cat.name,
  }))
})

// عرض اسم العملة باللغة العربية بوضوح تام دون رموز إنجليزية
const currencyOptions = computed(() => {
  return currencyStore.currencies.map((curr) => ({
    id: curr.id,
    name: curr.name,
  }))
})

const selectedCurrencyInfo = computed(() => {
  if (!props.formState.purchase_currency_id) return null
  const curr = currencyStore.currencies.find((c) => c.id === props.formState.purchase_currency_id)
  if (!curr) return null

  const defaultRate =
    curr.latest_exchange_rate?.rate ||
    curr.latestExchangeRate?.rate ||
    curr.exchange_rate ||
    curr.rate ||
    1

  return {
    id: curr.id,
    name: curr.name,
    code: curr.code,
    default_rate: Number(defaultRate),
  }
})

const isForeignCurrency = computed(() => {
  return !!selectedCurrencyInfo.value
})

const activeExchangeRate = computed(() => {
  if (customExchangeRate.value !== null && customExchangeRate.value > 0) {
    return customExchangeRate.value
  }
  return selectedCurrencyInfo.value?.default_rate || 1
})

const baseUnitName = computed(() => {
  if (!props.formState.base_unit_id) return ''
  const u = unitStore.units.find((x) => x.id === props.formState.base_unit_id)
  return u ? u.name : 'قاعدة الجرد'
})

const baseUnitCost = computed(() => {
  return props.formState.units?.[0]?.cost ?? 0
})

const baseUnitForeignCost = computed(() => {
  return props.formState.units?.[0]?.foreign_cost ?? 0
})

const baseUnitPrice = computed(() => {
  return props.formState.units?.[0]?.price ?? 0
})

const baseUnitBarcodes = computed(() => {
  return props.formState.units?.[0]?.barcodes || []
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

/**
 * 1. إدخال التكلفة بالعملة الأجنبية -> احتساب التكلفة المحلية وسعر البيع آلياً
 */
const handleForeignCostInput = (foreignVal) => {
  if (!props.formState.units || props.formState.units.length === 0) return

  const fCost = foreignVal !== null && foreignVal !== undefined ? Number(foreignVal) : 0
  const rate = activeExchangeRate.value
  const localCost = Number((fCost * rate).toFixed(2))
  const margin = Number(props.formState.profit_margin || 0)
  const rule = props.formState.rounding_rule || 'none'
  const rawPrice = localCost * (1 + margin / 100)
  const basePrice = applyRounding(rawPrice, rule)

  let clonedUnits = JSON.parse(JSON.stringify(props.formState.units))
  clonedUnits[0].foreign_cost = fCost
  clonedUnits[0].cost = localCost
  clonedUnits[0].price = basePrice
  clonedUnits[0].prices = updatePricesArray(clonedUnits[0].prices, basePrice, rule)

  for (let i = 1; i < clonedUnits.length; i++) {
    const factor = Number(clonedUnits[i].conversion_factor || 1)
    const unitForeign = Number((fCost * factor).toFixed(4))
    const unitCost = Number((localCost * factor).toFixed(2))
    const unitPrice = applyRounding(basePrice * factor, rule)

    clonedUnits[i].foreign_cost = unitForeign
    clonedUnits[i].cost = unitCost
    clonedUnits[i].price = unitPrice
    clonedUnits[i].prices = updatePricesArray(clonedUnits[i].prices, unitPrice, rule)
  }

  emit('update:formState', {
    ...props.formState,
    units: clonedUnits,
  })
}

/**
 * 2. إدخال التكلفة المحلية -> احتساب التكلفة الأجنبية وسعر البيع آلياً
 */
const handleLocalCostInput = (localVal) => {
  if (!props.formState.units || props.formState.units.length === 0) return

  const lCost = localVal !== null && localVal !== undefined ? Number(localVal) : 0
  const rate = activeExchangeRate.value
  const fCost = isForeignCurrency.value && rate > 0 ? Number((lCost / rate).toFixed(4)) : null
  const margin = Number(props.formState.profit_margin || 0)
  const rule = props.formState.rounding_rule || 'none'
  const rawPrice = lCost * (1 + margin / 100)
  const basePrice = applyRounding(rawPrice, rule)

  let clonedUnits = JSON.parse(JSON.stringify(props.formState.units))
  clonedUnits[0].cost = lCost
  clonedUnits[0].foreign_cost = fCost
  clonedUnits[0].price = basePrice
  clonedUnits[0].prices = updatePricesArray(clonedUnits[0].prices, basePrice, rule)

  for (let i = 1; i < clonedUnits.length; i++) {
    const factor = Number(clonedUnits[i].conversion_factor || 1)
    const unitCost = Number((lCost * factor).toFixed(2))
    const unitForeign = fCost !== null ? Number((fCost * factor).toFixed(4)) : null
    const unitPrice = applyRounding(basePrice * factor, rule)

    clonedUnits[i].cost = unitCost
    clonedUnits[i].foreign_cost = unitForeign
    clonedUnits[i].price = unitPrice
    clonedUnits[i].prices = updatePricesArray(clonedUnits[i].prices, unitPrice, rule)
  }

  emit('update:formState', {
    ...props.formState,
    units: clonedUnits,
  })
}

/**
 * 3. تحديث هامش الربح -> إعادة احتساب أسعار البيع
 */
const updateProfitMargin = (marginVal) => {
  const margin = Number(marginVal || 0)
  const rule = props.formState.rounding_rule || 'none'

  let clonedUnits = JSON.parse(JSON.stringify(props.formState.units || []))
  if (clonedUnits.length > 0) {
    const baseCost = Number(clonedUnits[0].cost || 0)
    const rawPrice = baseCost * (1 + margin / 100)
    const basePrice = applyRounding(rawPrice, rule)

    clonedUnits[0].price = basePrice
    clonedUnits[0].prices = updatePricesArray(clonedUnits[0].prices, basePrice, rule)

    for (let i = 1; i < clonedUnits.length; i++) {
      const factor = Number(clonedUnits[i].conversion_factor || 1)
      const unitPrice = applyRounding(basePrice * factor, rule)
      clonedUnits[i].price = unitPrice
      clonedUnits[i].prices = updatePricesArray(clonedUnits[i].prices, unitPrice, rule)
    }
  }

  emit('update:formState', {
    ...props.formState,
    profit_margin: margin,
    units: clonedUnits,
  })
}

/**
 * 4. تعديل سعر بيع الجمهور المباشر -> احتساب هامش الربح تلقائياً
 */
const handleDirectPriceInput = (priceVal) => {
  if (!props.formState.units || props.formState.units.length === 0) return

  const pVal = priceVal !== null && priceVal !== undefined ? Number(priceVal) : 0
  const rule = props.formState.rounding_rule || 'none'
  const currentCost = Number(props.formState.units[0].cost || 0)

  let calculatedMargin = Number(props.formState.profit_margin || 0)
  if (currentCost > 0) {
    calculatedMargin = Number((((pVal - currentCost) / currentCost) * 100).toFixed(2))
  }

  let clonedUnits = JSON.parse(JSON.stringify(props.formState.units))
  clonedUnits[0].price = pVal
  clonedUnits[0].prices = updatePricesArray(clonedUnits[0].prices, pVal, rule)

  for (let i = 1; i < clonedUnits.length; i++) {
    const factor = Number(clonedUnits[i].conversion_factor || 1)
    const unitPrice = applyRounding(pVal * factor, rule)
    clonedUnits[i].price = unitPrice
    clonedUnits[i].prices = updatePricesArray(clonedUnits[i].prices, unitPrice, rule)
  }

  emit('update:formState', {
    ...props.formState,
    profit_margin: calculatedMargin,
    units: clonedUnits,
  })
}

/**
 * 5. ضبط سعر الصرف المخصص للصنف (يبقى ثابتاً في الذاكرة لتسهيل إدخال الأصناف التالية)
 */
const handleRateAdjustment = (newRate) => {
  const rate = Number(newRate > 0 ? newRate : 1)
  customExchangeRate.value = rate

  if (baseUnitForeignCost.value > 0) {
    handleForeignCostInput(baseUnitForeignCost.value)
  }
}

/**
 * 6. تغيير العملة المرجعية
 */
const handleCurrencyChange = (currId) => {
  emit('clear-error', 'purchase_currency_id')
  customExchangeRate.value = null

  const newCurr = currencyStore.currencies.find((c) => c.id === currId)
  const rate = Number(
    newCurr?.latest_exchange_rate?.rate ||
      newCurr?.latestExchangeRate?.rate ||
      newCurr?.exchange_rate ||
      newCurr?.rate ||
      1,
  )

  let clonedUnits = JSON.parse(JSON.stringify(props.formState.units || []))
  if (clonedUnits.length > 0) {
    for (let unit of clonedUnits) {
      unit.foreign_cost =
        currId && rate > 0 ? Number((Number(unit.cost || 0) / rate).toFixed(4)) : null
    }
  }

  emit('update:formState', {
    ...props.formState,
    purchase_currency_id: currId,
    units: clonedUnits,
  })
}

/**
 * 7. تغيير الوحدة الأساسية وتأسيس جدول الوحدات
 */
const handleBaseUnitChange = (unitId) => {
  emit('clear-error', 'base_unit_id')

  let updatedUnits = []
  if (unitId) {
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
        foreign_cost: null,
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

/**
 * 8. إدارة الباركود السريع
 */
const handleQuickBarcodeAdd = () => {
  const code = quickBarcode.value.trim()
  if (!code) return

  if (!props.formState.units || props.formState.units.length === 0) {
    toast.warning('يرجى اختيار الوحدة الأساسية أولاً.')
    return
  }

  const currentBarcodes = props.formState.units[0].barcodes || []
  if (currentBarcodes.includes(code)) {
    toast.warning('هذا الباركود مدرج مسبقاً للوحدة الأساسية.')
    quickBarcode.value = ''
    return
  }

  let clonedUnits = JSON.parse(JSON.stringify(props.formState.units))
  clonedUnits[0].barcodes = [...currentBarcodes, code]

  emit('update:formState', {
    ...props.formState,
    units: clonedUnits,
  })

  quickBarcode.value = ''
}

const removeQuickBarcode = (index) => {
  if (!props.formState.units || props.formState.units.length === 0) return

  let clonedUnits = JSON.parse(JSON.stringify(props.formState.units))
  clonedUnits[0].barcodes = (clonedUnits[0].barcodes || []).filter((_, i) => i !== index)

  emit('update:formState', {
    ...props.formState,
    units: clonedUnits,
  })
}

const updateField = (field, value) => {
  emit('clear-error', field)
  emit('update:formState', {
    ...props.formState,
    [field]: value,
  })
}
</script>
