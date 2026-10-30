<!--src\views\items\components\ItemUnitPricesGrid.vue--->
<template>
  <div class="space-y-3">
    <!-- ترويسة مصفوفة الأسعار -->
    <div class="flex items-center justify-between border-b border-surface-border pb-2.5">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-primary"></span>
        <h4 class="text-xs font-black text-text-primary">مصفوفة أسعار فئات البيع والخصومات</h4>
      </div>
      <span
        class="text-[10px] text-text-muted font-bold font-mono bg-surface-section px-2.5 py-1 rounded-md border border-surface-border"
      >
        العملة: {{ DEFAULT_CURRENCY }}
      </span>
    </div>

    <!-- قائمة فئات الأسعار التفاعلية -->
    <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
      <div
        v-for="(priceRow, pIdx) in props.prices"
        :key="priceRow.price_list_id"
        class="p-3 bg-surface-section rounded-xl border border-surface-border space-y-2.5 shadow-xs transition-colors hover:border-surface-border/90"
      >
        <!-- اسم الفئة السعرية -->
        <div class="flex justify-between items-center border-b border-surface-border/60 pb-1.5">
          <span class="text-xs font-black text-primary">
            {{ priceRow.price_list_name || 'فئة غير معرّفة' }}
          </span>
          <span class="text-[10px] font-bold text-text-muted"> احتساب تلقائي متبادل </span>
        </div>

        <!-- شبكة حقلي الخصم والسعر النهائي -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <!-- 1. نسبة الخصم الفئوية -->
          <div>
            <label
              :for="'discount-input-' + pIdx"
              class="block text-xs font-bold text-text-secondary mb-1.5 text-center"
            >
              نسبة الخصم (%)
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
              class="block w-full h-10 px-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary text-xs font-mono font-bold text-center outline-none focus:bg-surface-section focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <!-- 2. السعر النهائي للبيع للفئة -->
          <div>
            <AppCurrencyInput
              :id="'category-price-input-' + pIdx"
              label="سعر البيع النهائي"
              :model-value="priceRow.price"
              :precision="2"
              label-class="!text-xs !font-bold !text-text-secondary !mb-1.5 text-center"
              input-class="!h-10 !px-2 !text-xs !font-mono !font-bold !text-center !bg-surface-ground focus:!bg-surface-section !border-surface-border focus:!border-primary"
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
  background-color: rgb(var(--color-surface-border));
  border-radius: 10px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-surface-border));
}
</style>
