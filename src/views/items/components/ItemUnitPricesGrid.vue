<!--src\views\items\components\ItemUnitPricesGrid.vue--->
<template>
  <div class="space-y-4">
    <!-- ترويسة المصفوفة السعرية وإرشاد الحساب التلقائي -->
    <div
      class="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-surface-ground/50 rounded-xl border border-surface-border"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm">📊</span>
        <div>
          <h4 class="text-xs font-black text-text-primary">
            مصفوفة أسعار فئات البيع وسياسات الخصم
          </h4>
          <p class="text-[11px] text-text-muted mt-0.5">
            احتساب متبادل فوري بين نسبة الخصم وسعر البيع النهائي بناءً على سعر بيع الجمهور المعتمد
          </p>
        </div>
      </div>
      <span
        class="text-[11px] text-text-muted font-bold font-mono bg-surface-section px-2.5 py-1 rounded-md border border-surface-border select-none"
      >
        العملة: {{ DEFAULT_CURRENCY }}
      </span>
    </div>

    <!-- جدول مصفوفة فئات الأسعار المسطح والمنظم -->
    <div
      v-if="props.prices && props.prices.length > 0"
      class="overflow-x-auto custom-scrollbar -mx-1 p-1"
    >
      <table class="w-full text-right border-collapse min-w-[560px]">
        <thead>
          <tr
            class="border-b border-surface-border text-[11px] font-black text-text-muted bg-surface-ground/70 rounded-lg"
          >
            <th class="py-2.5 px-3 rounded-r-lg">فئة السعر</th>
            <th class="py-2.5 px-3 text-center w-40">نسبة الخصم (%)</th>
            <th class="py-2.5 px-3 text-right rounded-l-lg w-52">سعر البيع النهائي للفئة</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-surface-border/50 text-xs">
          <tr
            v-for="(priceRow, pIdx) in props.prices"
            :key="priceRow.price_list_id"
            class="hover:bg-surface-ground/40 transition-colors"
          >
            <!-- 1. اسم فئة السعر -->
            <td class="py-3 px-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-primary/70"></span>
                <span class="font-bold text-text-primary">
                  {{ priceRow.price_list_name || 'فئة غير معرّفة' }}
                </span>
              </div>
            </td>

            <!-- 2. نسبة الخصم مع شارة النسبة المئوية -->
            <td class="py-3 px-3 text-center">
              <div class="relative w-32 mx-auto">
                <input
                  :id="'discount-input-' + pIdx"
                  :value="priceRow.discount_percentage"
                  @input="
                    (e) =>
                      handleDiscountInput(pIdx, e.target.value === '' ? 0 : Number(e.target.value))
                  "
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                  class="block w-full h-9 px-2 pl-6 border border-surface-border rounded-lg bg-surface-section text-text-primary text-xs font-mono font-bold text-center outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-xs"
                />
                <span
                  class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-text-muted pointer-events-none select-none"
                >
                  %
                </span>
              </div>
            </td>

            <!-- 3. السعر النهائي للبيع للفئة -->
            <td class="py-3 px-3">
              <AppCurrencyInput
                :id="'category-price-input-' + pIdx"
                :model-value="priceRow.price"
                :precision="2"
                input-class="!h-9 !px-3 !text-xs !font-mono !font-bold !text-right !bg-surface-section !border-surface-border focus:!border-primary shadow-xs"
                @update:model-value="
                  (val) =>
                    handlePriceInput(pIdx, val !== null && val !== undefined ? Number(val) : 0)
                "
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- حالة عدم وجود فئات أسعار معرفة -->
    <div
      v-else
      class="text-center py-7 px-4 bg-surface-ground/20 rounded-xl border border-dashed border-surface-border text-text-muted text-xs"
    >
      لا توجد فئات أسعار معرّفة في المنظومة حالياً لهذه الوحدة.
    </div>
  </div>
</template>

<script setup>
import { DEFAULT_CURRENCY } from '@/utils/formatters'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const props = defineProps({
  prices: { type: Array, required: true, default: () => [] },
  basePrice: { type: Number, required: true, default: 0 },
  roundingRule: { type: String, default: 'none' },
})

const emit = defineEmits(['update:prices'])

/**
 * تطبيق قاعدة التقريب المحددة للصنف على السعر
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
 * أتمتة احتساب السعر النهائي للفئة بناءً على قيمة الخصم المدخلة يدوياً
 */
const handleDiscountInput = (index, discountValue) => {
  const currentBasePrice = props.basePrice || 0
  const rawPrice = currentBasePrice * (1 - discountValue / 100)
  const calculatedPrice = applyRounding(rawPrice, props.roundingRule)

  const updatedPrices = props.prices.map((priceObj, idx) => {
    if (idx !== index) return priceObj
    return {
      ...priceObj,
      discount_percentage: discountValue,
      price: calculatedPrice,
    }
  })

  emit('update:prices', updatedPrices)
}

/**
 * أتمتة احتساب نسبة الخصم تلقائياً عند تغيير السعر النهائي يدوياً
 */
const handlePriceInput = (index, priceValue) => {
  const currentBasePrice = props.basePrice || 0

  let calculatedDiscount = 0
  if (currentBasePrice > 0) {
    const difference = currentBasePrice - priceValue
    calculatedDiscount = Number(((difference / currentBasePrice) * 100).toFixed(2))
  }

  const updatedPrices = props.prices.map((priceObj, idx) => {
    if (idx !== index) return priceObj
    return {
      ...priceObj,
      discount_percentage: calculatedDiscount,
      price: priceValue,
    }
  })

  emit('update:prices', updatedPrices)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 5px;
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-surface-border));
  border-radius: 10px;
}
</style>
