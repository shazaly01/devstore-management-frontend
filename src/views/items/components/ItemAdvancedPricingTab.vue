<!--src/views/items/components/ItemAdvancedPricingTab.vue-->
<template>
  <AppCard>
    <!-- بطاقة موحدة وهادئة للسياسات المتقدمة -->
    <div class="max-w-2xl mx-auto space-y-4 py-1">
      <div class="border-b border-surface-border/70 pb-3">
        <h3 class="text-sm font-black text-text-primary flex items-center gap-2">
          <span>⚙️</span>
          <span>سياسات التسعير وهوامش الأمان وقواعد التقريب</span>
        </h3>
        <p class="text-xs text-text-muted mt-0.5">
          إعدادات اختيارية لضبط أتمتة احتساب الأسعار وحماية العمليات البيعية من تدني الهوامش
        </p>
      </div>

      <!-- 1. سياسة التسعير المطبقة -->
      <div>
        <label for="pricing-policy" class="block text-xs font-bold text-text-secondary mb-1.5">
          سياسة التسعير المطبقة للصنف
        </label>
        <AppDropdown
          id="pricing-policy"
          :model-value="props.formState.pricing_policy"
          @update:model-value="(val) => updateField('pricing_policy', val)"
          :options="pricingPolicies"
          placeholder="اختر السياسة..."
          :show-clear="false"
        />
        <p class="text-[11px] text-text-muted mt-1">
          * (تلقائي مرتبط بالصرف): يتيح تحديث أسعار بيع هذا الصنف آلياً في شاشة تحديث الأسعار بمجرد
          تغير الصرف.
        </p>
        <div
          v-if="itemStore.validationErrors && itemStore.validationErrors.pricing_policy"
          class="mt-1"
        >
          <p
            v-for="(err, i) in itemStore.validationErrors.pricing_policy"
            :key="i"
            class="text-danger text-xs font-bold"
          >
            {{ err }}
          </p>
        </div>
      </div>

      <!-- 2. الحد الأدنى لهامش الربح المقبول (%) -->
      <div>
        <label for="min-margin" class="block text-xs font-bold text-text-secondary mb-1.5">
          الحد الأدنى لهامش الربح المقبول (%)
        </label>
        <div class="relative">
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
            placeholder="0.00"
            input-class="h-10 text-xs font-bold font-mono text-center pr-3 pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span
            class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-text-muted pointer-events-none select-none"
          >
            %
          </span>
        </div>
        <p class="text-[11px] text-text-muted mt-1">
          * يمنع نظام نقاط البيع والفواتير من منح خصومات تتجاوز هذا الهامش لحماية الأرباح.
        </p>
        <div
          v-if="itemStore.validationErrors && itemStore.validationErrors.min_margin_percentage"
          class="mt-1"
        >
          <p
            v-for="(err, i) in itemStore.validationErrors.min_margin_percentage"
            :key="i"
            class="text-danger text-xs font-bold"
          >
            {{ err }}
          </p>
        </div>
      </div>

      <!-- 3. قاعدة التقريب السعري -->
      <div>
        <label for="rounding-rule" class="block text-xs font-bold text-text-secondary mb-1.5">
          قاعدة التقريب السعري التلقائي
        </label>
        <AppDropdown
          id="rounding-rule"
          :model-value="props.formState.rounding_rule"
          @update:model-value="(val) => handleRoundingRuleChange(val)"
          :options="roundingRules"
          placeholder="اختر قاعدة التقريب..."
          :show-clear="false"
        />
        <p class="text-[11px] text-text-muted mt-1">
          * يتم تطبيق قاعدة التقريب تلقائياً على سعر بيع الجمهور المعتمد ومصفوفة أسعار الفئات.
        </p>
        <div
          v-if="itemStore.validationErrors && itemStore.validationErrors.rounding_rule"
          class="mt-1"
        >
          <p
            v-for="(err, i) in itemStore.validationErrors.rounding_rule"
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
import { useItemStore } from '@/stores/itemStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  formState: { type: Object, required: true },
})

const emit = defineEmits(['update:formState', 'clear-error'])
const itemStore = useItemStore()

const pricingPolicies = [
  { id: 'manual', name: 'تسعير يدوي مستقل' },
  { id: 'auto_indexed', name: 'تلقائي مرتبط بسعر الصرف' },
  { id: 'phased', name: 'تسعير مرحلي / شرائح' },
]

const roundingRules = [
  { id: 'none', name: 'بدون تقريب (الكسور المباشرة)' },
  { id: 'nearest_50', name: 'لأقرب 50 جنيه' },
  { id: 'nearest_100', name: 'لأقرب 100 جنيه' },
  { id: 'nearest_500', name: 'لأقرب 500 جنيه' },
  { id: 'psychological_90', name: 'تقريب نفسي (ينتهي بـ 90)' },
  { id: 'psychological_900', name: 'تقريب نفسي (ينتهي بـ 900)' },
]

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

// تحديث قاعدة التقريب وإعادة احتساب أسعار الوحدات ومصفوفات الأسعار فورياً
const handleRoundingRuleChange = (ruleValue) => {
  emit('clear-error', 'rounding_rule')

  const rule = ruleValue || 'none'
  const margin = Number(props.formState.profit_margin || 0)

  let clonedUnits = JSON.parse(JSON.stringify(props.formState.units || []))

  if (clonedUnits.length > 0) {
    // 1. إعادة تقريب الوحدة الأساسية
    const baseCost = Number(clonedUnits[0].cost || 0)
    const rawBasePrice = baseCost * (1 + margin / 100)
    const basePrice = applyRounding(rawBasePrice, rule)

    clonedUnits[0].price = basePrice
    clonedUnits[0].prices = updatePricesArray(clonedUnits[0].prices, basePrice, rule)

    // 2. إعادة تقريب كافة الوحدات الإضافية التابعة
    for (let i = 1; i < clonedUnits.length; i++) {
      const factor = Number(clonedUnits[i].conversion_factor || 1)
      const unitPrice = applyRounding(basePrice * factor, rule)
      clonedUnits[i].price = unitPrice
      clonedUnits[i].prices = updatePricesArray(clonedUnits[i].prices, unitPrice, rule)
    }
  }

  emit('update:formState', {
    ...props.formState,
    rounding_rule: rule,
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
