<!--src\views\items\components\ItemUnitPricesGrid.vue--->
<template>
  <div class="space-y-3">
    <h4 class="text-xs font-bold text-text-secondary">مصفوفة أسعار فئات البيع والخصومات المدرجة</h4>

    <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
      <div
        v-for="(priceRow, pIdx) in props.prices"
        :key="priceRow.price_list_id"
        class="p-3 bg-surface-ground rounded-xl border border-surface-border space-y-2.5 transition-all hover:border-surface-border/80 shadow-sm"
      >
        <!-- ترويسة الفئة السعرية -->
        <div class="flex justify-between items-center border-b border-surface-border/40 pb-1.5">
          <span class="text-xs font-black text-primary">
            {{ priceRow.price_list_name || 'فئة غير معرّفة' }}
          </span>
          <span class="text-[10px] text-text-muted font-medium font-mono">
            العملة الافتراضية: {{ DEFAULT_CURRENCY }}
          </span>
        </div>

        <!-- شبكة الحقول الحسابية -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <!-- 1. نسبة الخصم الفئوية -->
          <div>
            <label class="block text-[10px] text-text-muted mb-1 text-center font-bold">
              الخصم (%)
            </label>
            <input
              :id="'discount-input-' + pIdx"
              :value="priceRow.discount_percentage"
              @input="
                (e) => handleDiscountInput(pIdx, e.target.value === '' ? 0 : Number(e.target.value))
              "
              type="number"
              min="0"
              max="100"
              step="0.01"
              class="block w-full px-2 py-1.5 border border-surface-border rounded-lg bg-surface-section text-text-primary text-xs font-mono text-center outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <!-- 2. السعر النهائي للبيع باستخدام AppCurrencyInput -->
          <div>
            <AppCurrencyInput
              :id="'category-price-input-' + pIdx"
              label="السعر النهائي"
              :model-value="priceRow.price"
              :precision="2"
              label-class="!text-[10px] !text-text-muted !mb-1 text-center !font-bold"
              input-class="!px-2 !py-1.5 !text-xs !font-mono !text-center !bg-surface-section !border-surface-border"
              @update:model-value="
                (val) => handlePriceInput(pIdx, val !== null && val !== undefined ? Number(val) : 0)
              "
            />
          </div>
        </div>
      </div>
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

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
