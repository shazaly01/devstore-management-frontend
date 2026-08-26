<!--src\views\items\components\ItemBaseInfo.vue--->
<template>
  <AppCard>
    <div class="p-4 space-y-4">
      <!-- 1. القسم الأول: التعريف الأساسي والنوع مع زر التجميع المدمج -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        <!-- اسم الصنف -->
        <div class="lg:col-span-7">
          <label class="block text-xs font-bold text-text-secondary mb-1"
            >اسم الصنف / الخدمة التجاري</label
          >
          <AppInput
            id="item-name"
            :model-value="props.formState.name"
            @update:model-value="(val) => updateField('name', val)"
            placeholder="ادخل الاسم التجاري بالكامل..."
            input-class="h-[38px] text-xs font-bold"
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

        <!-- طبيعة الصنف + خيار الصنف التجميعي في كتلة تفاعلية واحدة متناسقة -->
        <div class="lg:col-span-5">
          <label class="block text-xs font-bold text-text-secondary mb-1"
            >طبيعة الصنف وخياراته</label
          >
          <div class="flex items-center gap-2">
            <!-- محول النوع (مخزني / خدمة) -->
            <div
              class="flex-1 grid grid-cols-2 gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border h-[38px] items-center"
            >
              <button
                type="button"
                v-for="type in itemTypes"
                :key="type.value"
                @click="updateField('item_type', type.value)"
                :class="[
                  'h-[28px] text-[11px] font-bold rounded transition-all flex items-center justify-center',
                  props.formState.item_type === type.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary',
                ]"
              >
                {{ type.label }}
              </button>
            </div>

            <!-- زر التبديل السريع للصنف التجميعي -->
            <button
              v-if="props.formState.item_type === 'product'"
              type="button"
              @click="updateField('is_composite', !props.formState.is_composite)"
              :class="[
                'h-[38px] px-3 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 select-none cursor-pointer',
                props.formState.is_composite
                  ? 'bg-primary/10 border-primary text-primary shadow-xs'
                  : 'bg-surface-ground border-surface-border text-text-muted hover:text-text-primary hover:border-surface-border/80',
              ]"
              title="تحديد الصنف كصنف تجميعي مركب من مواد أخرى"
            >
              <span class="text-sm">🧩</span>
              <span>تجميعي</span>
              <span
                :class="[
                  'w-2 h-2 rounded-full transition-colors',
                  props.formState.is_composite ? 'bg-primary' : 'bg-surface-border',
                ]"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. القسم الثاني: التصنيف الشجري، الوحدة الأساسية، وتاريخ الصلاحية -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
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

        <div>
          <label class="block text-xs font-bold text-text-secondary mb-1">تاريخ الصلاحية</label>
          <AppInput
            id="expiry-date"
            :model-value="props.formState.expiry_date"
            @update:model-value="(val) => updateField('expiry_date', val)"
            type="date"
            input-class="h-[38px] text-xs font-bold"
          />
          <div v-if="validationErrors && validationErrors.expiry_date" class="mt-1">
            <p
              v-for="(err, i) in validationErrors.expiry_date"
              :key="i"
              class="text-rose-500 text-xs font-bold"
            >
              {{ err }}
            </p>
          </div>
        </div>
      </div>

      <!-- 3. القسم الثالث: حاوية سياسات وهوامش التسعير الذكي -->
      <div class="p-3.5 bg-surface-ground/40 border border-surface-border/70 rounded-xl space-y-3">
        <!-- ترويسة التسعير مع تثبيت شارة سعر الصرف في الترويسة -->
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border/50 pb-2"
        >
          <div class="flex items-center gap-1.5">
            <span class="text-primary text-xs">⚡</span>
            <h3 class="text-xs font-bold text-text-primary">سياسات وهوامش التسعير الذكي</h3>
            <span class="text-[10px] text-text-muted hidden sm:inline"
              >- قواعد الاحتساب وحماية الهامش</span
            >
          </div>

          <div
            v-if="selectedCurrencyInfo"
            class="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md"
          >
            <span class="text-[10px] text-text-muted">سعر الصرف المعتمد:</span>
            <span class="text-[11px] font-bold text-primary font-mono" dir="ltr">
              1 {{ selectedCurrencyInfo.code }} =
              {{ selectedCurrencyInfo.exchange_rate.toLocaleString('en-US') }}
            </span>
          </div>
        </div>

        <!-- شبكة حقول التسعير الخمسة بمحاذاة متطابقة 100% -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-start">
          <!-- 1. العملة المرجعية -->
          <div>
            <label class="block text-[11px] font-bold text-text-secondary mb-1"
              >العملة المرجعية</label
            >
            <AppDropdown
              id="purchase-currency"
              :model-value="props.formState.purchase_currency_id"
              @update:model-value="(val) => updateField('purchase_currency_id', val)"
              :options="currencyOptions"
              placeholder="العملة المحلية..."
            />
            <div v-if="validationErrors && validationErrors.purchase_currency_id" class="mt-1">
              <p
                v-for="(err, i) in validationErrors.purchase_currency_id"
                :key="i"
                class="text-rose-500 text-[10px] font-bold"
              >
                {{ err }}
              </p>
            </div>
          </div>

          <!-- 2. سياسة التسعير -->
          <div>
            <label class="block text-[11px] font-bold text-text-secondary mb-1"
              >سياسة التسعير</label
            >
            <AppDropdown
              id="pricing-policy"
              :model-value="props.formState.pricing_policy"
              @update:model-value="(val) => updateField('pricing_policy', val)"
              :options="pricingPolicies"
              placeholder="اختر السياسة..."
              :show-clear="false"
            />
            <div v-if="validationErrors && validationErrors.pricing_policy" class="mt-1">
              <p
                v-for="(err, i) in validationErrors.pricing_policy"
                :key="i"
                class="text-rose-500 text-[10px] font-bold"
              >
                {{ err }}
              </p>
            </div>
          </div>

          <!-- 3. الهامش المستهدف -->
          <div>
            <label class="block text-[11px] font-bold text-text-secondary mb-1"
              >الهامش المستهدف (%)</label
            >
            <AppInput
              id="profit-margin"
              :model-value="props.formState.profit_margin"
              @update:model-value="(val) => updateField('profit_margin', val ? Number(val) : 0)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              input-class="h-[38px] text-xs font-bold text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div v-if="validationErrors && validationErrors.profit_margin" class="mt-1">
              <p
                v-for="(err, i) in validationErrors.profit_margin"
                :key="i"
                class="text-rose-500 text-[10px] font-bold"
              >
                {{ err }}
              </p>
            </div>
          </div>

          <!-- 4. الحد الأدنى للهامش -->
          <div>
            <label class="block text-[11px] font-bold text-text-secondary mb-1"
              >الحد الأدنى للهامش (%)</label
            >
            <AppInput
              id="min-margin"
              :model-value="props.formState.min_margin_percentage"
              @update:model-value="
                (val) => updateField('min_margin_percentage', val ? Number(val) : 0)
              "
              type="number"
              min="0"
              max="100"
              step="0.01"
              input-class="h-[38px] text-xs font-bold text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div v-if="validationErrors && validationErrors.min_margin_percentage" class="mt-1">
              <p
                v-for="(err, i) in validationErrors.min_margin_percentage"
                :key="i"
                class="text-rose-500 text-[10px] font-bold"
              >
                {{ err }}
              </p>
            </div>
          </div>

          <!-- 5. قاعدة التقريب -->
          <div>
            <label class="block text-[11px] font-bold text-text-secondary mb-1"
              >قاعدة التقريب</label
            >
            <AppDropdown
              id="rounding-rule"
              :model-value="props.formState.rounding_rule"
              @update:model-value="(val) => updateField('rounding_rule', val)"
              :options="roundingRules"
              placeholder="قاعدة التقريب..."
              :show-clear="false"
            />
            <div v-if="validationErrors && validationErrors.rounding_rule" class="mt-1">
              <p
                v-for="(err, i) in validationErrors.rounding_rule"
                :key="i"
                class="text-rose-500 text-[10px] font-bold"
              >
                {{ err }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { useUnitStore } from '@/stores/unitStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useCurrencyStore } from '@/stores/currencyStore'
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
const currencyStore = useCurrencyStore()

const { validationErrors } = storeToRefs(itemStore)
const isEditMode = computed(() => !!route.params.id)

onMounted(async () => {
  if (currencyStore.currencies.length === 0) {
    await currencyStore.fetchCurrencies()
  }
})

const itemTypes = [
  { value: 'product', label: 'مخزني' },
  { value: 'service', label: 'خدمة' },
]

const pricingPolicies = [
  { id: 'manual', name: 'تسعير يدوي' },
  { id: 'auto_indexed', name: 'تلقائي مرتبط بالصرف' },
  { id: 'phased', name: 'تسعير مرحلي' },
]

const roundingRules = [
  { id: 'none', name: 'بدون تقريب' },
  { id: 'nearest_50', name: 'لأقرب 50' },
  { id: 'nearest_100', name: 'لأقرب 100' },
  { id: 'nearest_500', name: 'لأقرب 500' },
  { id: 'psychological_90', name: 'نفسي (ينتهي بـ 90)' },
  { id: 'psychological_900', name: 'نفسي (ينتهي بـ 900)' },
]

const categoryOptions = computed(() => {
  return categoryStore.categories.map((cat) => ({
    id: cat.id,
    name: cat.full_path || cat.indent_name || cat.name,
  }))
})

const currencyOptions = computed(() => {
  return currencyStore.currencies.map((curr) => ({
    id: curr.id,
    name: `${curr.name} (${curr.code})`,
  }))
})

const selectedCurrencyInfo = computed(() => {
  if (!props.formState.purchase_currency_id) return null
  const curr = currencyStore.currencies.find((c) => c.id === props.formState.purchase_currency_id)
  if (!curr) return null

  const rateVal =
    curr.latest_exchange_rate?.rate ||
    curr.latestExchangeRate?.rate ||
    curr.exchange_rate ||
    curr.rate ||
    1

  return {
    code: curr.code,
    exchange_rate: Number(rateVal),
  }
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
 * دالة مساعدة لإعادة احتساب فئات الأسعار التابعة للوحدة
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

const updateField = (field, value) => {
  emit('clear-error', field)

  const extraUpdates = {}

  // تصفير خصائص التجميع فوراً في حال تحويل طبيعة الصنف إلى خدمة
  if (field === 'item_type' && value !== 'product') {
    extraUpdates.is_composite = false
    extraUpdates.components = []
  }

  // عند تعديل نسبة الربح أو قاعدة التقريب، إعادة احتساب أسعار الوحدات وفئاتها تلقائياً
  if (
    (field === 'profit_margin' || field === 'rounding_rule') &&
    props.formState.units &&
    props.formState.units.length > 0
  ) {
    const margin =
      field === 'profit_margin' ? Number(value || 0) : Number(props.formState.profit_margin || 0)
    const rule = field === 'rounding_rule' ? value : props.formState.rounding_rule || 'none'

    extraUpdates.units = props.formState.units.map((unit) => {
      const rawPrice = Number(unit.cost || 0) * (1 + margin / 100)
      const calculatedPrice = applyRounding(rawPrice, rule)
      return {
        ...unit,
        price: calculatedPrice,
        prices: updatePricesArray(unit.prices, calculatedPrice, rule),
      }
    })
  }

  // عند تغيير العملة المرجعية للشراء، إعادة مواءمة التكلفة الأجنبية foreign_cost لكل وحدة
  if (
    field === 'purchase_currency_id' &&
    props.formState.units &&
    props.formState.units.length > 0
  ) {
    const newCurr = currencyStore.currencies.find((c) => c.id === value)
    const newRate = Number(
      newCurr?.latest_exchange_rate?.rate ||
        newCurr?.latestExchangeRate?.rate ||
        newCurr?.exchange_rate ||
        newCurr?.rate ||
        1,
    )

    extraUpdates.units = props.formState.units.map((unit) => {
      return {
        ...unit,
        foreign_cost:
          value && newRate > 0 ? Number((Number(unit.cost || 0) / newRate).toFixed(4)) : null,
      }
    })
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
</script>
