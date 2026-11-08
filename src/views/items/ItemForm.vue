<!--src/views/items/ItemForm.vue-->
<template>
  <div class="max-w-5xl mx-auto pt-2 pb-24 px-4 sm:px-6 space-y-4">
    <!-- ==================== المنطقة العلوية الثابتة (خارج التبويبات) ==================== -->
    <AppCard>
      <div class="p-1 space-y-3">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <!-- أ. حقل اسم الصنف التجاري الكامل -->
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1.5">
              <label for="item-name" class="block text-xs font-bold text-text-secondary">
                اسم الصنف التجاري <span class="text-danger">*</span>
              </label>

              <!-- شارة تفاعلية ناعمة تظهر فور التصفير لتوجيه المستخدم للكتابة مباشرة -->
              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 -translate-y-1 scale-95"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <span
                  v-if="isReadyForNextItem"
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/25 select-none"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  <span>جاهز لإدخال الصنف التالي هنا ✨</span>
                </span>
              </Transition>
            </div>

            <div
              :class="{ 'ring-2 ring-primary/40 rounded-lg transition-all': isReadyForNextItem }"
            >
              <AppInput
                id="item-name"
                :model-value="form.name"
                @update:model-value="(val) => updateHeaderField('name', val)"
                placeholder="اكتب الاسم التجاري الكامل للصنف..."
                input-class="h-11 text-xs font-bold"
                required
              />
            </div>
          </div>

          <!-- ب. نوع الصنف (مخزني / خدمة) وزر التجميعي -->
          <div class="shrink-0 flex flex-col justify-end">
            <span class="block text-xs font-bold text-text-secondary mb-1.5 sm:text-center">
              طبيعة الصنف
            </span>
            <div class="flex items-center gap-2 h-11">
              <!-- أزرار نوع الصنف -->
              <div
                class="flex bg-surface-ground p-1 rounded-xl border border-surface-border h-full items-center"
              >
                <button
                  type="button"
                  v-for="type in itemTypes"
                  :key="type.value"
                  @click="setItemType(type.value)"
                  :class="[
                    'h-9 px-3.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer select-none',
                    form.item_type === type.value
                      ? 'bg-primary text-white shadow-xs font-black'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-section/60',
                  ]"
                >
                  {{ type.label }}
                </button>
              </div>

              <!-- زر تحديد الصنف كصنف تجميعي (يظهر فقط مع الصنف المخزني) -->
              <button
                v-if="form.item_type === 'product'"
                type="button"
                @click="toggleComposite"
                :class="[
                  'h-full px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all select-none cursor-pointer',
                  form.is_composite
                    ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/20'
                    : 'bg-surface-ground border-surface-border text-text-muted hover:text-text-primary hover:border-surface-border/80',
                ]"
                title="تحديد الصنف كصنف تجميعي مركب من مواد أخرى"
              >
                <span>🧩</span>
                <span>تجميعي</span>
                <span
                  :class="[
                    'w-2 h-2 rounded-full transition-colors mr-0.5',
                    form.is_composite ? 'bg-primary' : 'bg-surface-border',
                  ]"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- رسائل أخطاء التحقق الخاصة بالاسم إن وجدت -->
        <div
          v-if="itemStore.validationErrors && itemStore.validationErrors.name"
          class="space-y-0.5 pt-0.5"
        >
          <p
            v-for="(err, i) in itemStore.validationErrors.name"
            :key="i"
            class="text-danger text-xs font-bold"
          >
            {{ err }}
          </p>
        </div>
      </div>
    </AppCard>

    <!-- ==================== شريط التبويبات الرئيسي ==================== -->
    <div
      class="flex items-center gap-1.5 p-1.5 bg-surface-ground/70 rounded-xl border border-surface-border overflow-x-auto custom-scrollbar"
    >
      <button
        v-for="tab in visibleTabs"
        :key="tab.id"
        type="button"
        @click="activeTab = tab.id"
        :class="[
          'px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer select-none',
          activeTab === tab.id
            ? 'bg-surface-section text-primary shadow-xs border border-surface-border font-black'
            : 'text-text-muted hover:text-text-primary hover:bg-surface-section/50',
        ]"
      >
        <span>{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>

        <!-- شارة التنبيه في حالة وجود أخطاء في هذا التبويب -->
        <span
          v-if="hasTabErrors(tab.id)"
          class="w-2 h-2 rounded-full bg-danger animate-pulse"
          title="توجد حقول تتطلب التصحيح في هذا التبويب"
        ></span>
      </button>
    </div>

    <!-- ==================== حاويات محتوى التبويبات ==================== -->
    <div class="space-y-4">
      <!-- 1. تبويب البيانات الأساسية والتسعير السريع (المسار البسيط) -->
      <div v-show="activeTab === 'general'">
        <ItemBaseInfo
          :form-state="form"
          @update:form-state="handleFormStateUpdate"
          @clear-error="clearBackendError"
        />
      </div>

      <!-- 2. تبويب مصفوفة فئات الأسعار والخصومات -->
      <div v-show="activeTab === 'price_lists'">
        <ItemPriceListsTab
          :form-state="form"
          @update:form-state="handleFormStateUpdate"
          @clear-error="clearBackendError"
        />
      </div>

      <!-- 3. تبويب الوحدات الإضافية ومعاملات التحويل والباركودات -->
      <div v-show="activeTab === 'units'">
        <ItemUnitsSplitLayout
          :form-state="form"
          @update:form-state="handleFormStateUpdate"
          @clear-error="clearBackendError"
        />
      </div>

      <!-- 4. تبويب سياسات وهوامش التسعير المتقدمة -->
      <div v-show="activeTab === 'advanced_pricing'">
        <ItemAdvancedPricingTab
          :form-state="form"
          @update:form-state="handleFormStateUpdate"
          @clear-error="clearBackendError"
        />
      </div>

      <!-- 5. تبويب مكونات الصنف التجميعي (ديناميكي) -->
      <div v-show="activeTab === 'components' && form.is_composite">
        <ItemComponentsSection
          :form-state="form"
          @update:form-state="handleFormStateUpdate"
          @clear-error="clearBackendError"
        />
      </div>
    </div>

    <!-- ==================== كبسولة الحفظ والإجراءات العائمة ==================== -->
    <div class="sticky bottom-4 z-20 mt-6 flex justify-end pointer-events-none">
      <div
        class="bg-surface-section/95 backdrop-blur-md border border-surface-border rounded-xl p-2.5 shadow-xl flex items-center gap-2 pointer-events-auto"
      >
        <AppButton type="button" variant="secondary" size="sm" @click="goBack">
          إلغاء التدوين
        </AppButton>
        <AppButton type="button" :disabled="loading" size="sm" @click="submitForm">
          {{
            loading
              ? 'جاري التثبيت والتدوين...'
              : isEditMode
                ? 'تحديث وحفظ التعديلات'
                : 'حفظ وإضافة صنف جديد'
          }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { useUnitStore } from '@/stores/unitStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useToast } from 'vue-toastification'

import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'

import ItemBaseInfo from './components/ItemBaseInfo.vue'
import ItemPriceListsTab from './components/ItemPriceListsTab.vue'
import ItemUnitsSplitLayout from './components/ItemUnitsSplitLayout.vue'
import ItemAdvancedPricingTab from './components/ItemAdvancedPricingTab.vue'
import ItemComponentsSection from './components/ItemComponentsSection.vue'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const unitStore = useUnitStore()
const categoryStore = useCategoryStore()
const currencyStore = useCurrencyStore()
const toast = useToast()

const isEditMode = computed(() => !!route.params.id)
const loading = computed(() => itemStore.loading)
const activeTab = ref('general')
const isReadyForNextItem = ref(false)

const itemTypes = [
  { value: 'product', label: 'مخزني' },
  { value: 'service', label: 'خدمة' },
]

const visibleTabs = computed(() => {
  const tabs = [
    { id: 'general', label: 'البيانات والتسعير السريع', icon: '⚡' },
    { id: 'price_lists', label: 'فئات الأسعار والخصومات', icon: '📊' },
    { id: 'units', label: 'الوحدات الإضافية والتحويلات', icon: '📦' },
    { id: 'advanced_pricing', label: 'سياسات وهوامش التسعير', icon: '⚙️' },
  ]

  if (form.is_composite) {
    tabs.push({ id: 'components', label: 'مكونات الصنف التجميعي', icon: '🧩' })
  }

  return tabs
})

const hasTabErrors = (tabId) => {
  const errors = itemStore.validationErrors
  if (!errors) return false

  switch (tabId) {
    case 'general':
      return Boolean(errors.category_id || errors.base_unit_id || errors.expiry_date)
    case 'units':
      return Boolean(errors.units)
    case 'components':
      return Object.keys(errors).some((key) => key.startsWith('components'))
    case 'advanced_pricing':
      return Boolean(errors.pricing_policy || errors.min_margin_percentage || errors.rounding_rule)
    default:
      return false
  }
}

const getInitialFormState = () => ({
  name: '',
  item_type: 'product',
  profit_margin: 0,
  purchase_currency_id: null,
  pricing_policy: 'manual',
  min_margin_percentage: 0,
  rounding_rule: 'none',
  category_id: null,
  category_path: '',
  base_unit_id: null,
  is_active: true,
  is_composite: false,
  expiry_date: null,
  components: [],
  units: [],
})

const form = reactive(getInitialFormState())

onMounted(async () => {
  itemStore.validationErrors = null

  await Promise.all([
    unitStore.fetchUnits(1, { is_active: 1 }),
    itemStore.fetchPriceLists(),
    currencyStore.fetchCurrencies(),
    categoryStore.categories.length === 0 ? categoryStore.fetchCategories(1) : Promise.resolve(),
  ])

  if (isEditMode.value) {
    await itemStore.fetchItem(route.params.id)
    if (itemStore.currentItem) {
      const rawItem = itemStore.currentItem

      form.name = rawItem.name || ''
      form.item_type = rawItem.item_type || 'product'
      form.profit_margin =
        rawItem.profit_margin !== null && rawItem.profit_margin !== undefined
          ? Number(rawItem.profit_margin)
          : 0
      form.purchase_currency_id = rawItem.purchase_currency_id ?? null
      form.pricing_policy = rawItem.pricing_policy || 'manual'
      form.min_margin_percentage =
        rawItem.min_margin_percentage !== null && rawItem.min_margin_percentage !== undefined
          ? Number(rawItem.min_margin_percentage)
          : 0
      form.rounding_rule = rawItem.rounding_rule || 'none'
      form.category_id = rawItem.category_id
      form.category_path = rawItem.category_path
      form.base_unit_id = rawItem.base_unit_id
      form.is_active = !!rawItem.is_active
      form.is_composite = !!rawItem.is_composite
      form.expiry_date = rawItem.expiry_date || null

      form.components = (rawItem.components || []).map((comp) => ({
        child_item_id: comp.child_item_id,
        quantity: Number(comp.quantity),
      }))

      form.units = (rawItem.units || []).map((unit) => {
        return {
          unit_id: unit.unit_id,
          conversion_factor: Number(unit.conversion_factor),
          cost: Number(unit.cost),
          foreign_cost:
            unit.foreign_cost !== null &&
            unit.foreign_cost !== undefined &&
            unit.foreign_cost !== ''
              ? Number(unit.foreign_cost)
              : null,
          price: Number(unit.price),
          barcodes: (unit.barcodes || []).map((b) => (typeof b === 'object' ? b.barcode : b)),
          prices: (unit.prices || []).map((p) => ({
            price_list_id: p.price_list_id,
            price_list_name: p.price_list_name,
            discount_percentage: Number(p.discount_percentage || 0),
            price: Number(p.price),
          })),
        }
      })
    }
  }
})

const updateHeaderField = (field, value) => {
  if (field === 'name' && isReadyForNextItem.value) {
    isReadyForNextItem.value = false
  }
  clearBackendError(field)
  form[field] = value
}

const setItemType = (type) => {
  form.item_type = type
  if (type !== 'product') {
    form.is_composite = false
    form.components = []
    if (activeTab.value === 'components') {
      activeTab.value = 'general'
    }
  }
}

const toggleComposite = () => {
  form.is_composite = !form.is_composite
  if (!form.is_composite) {
    form.components = []
    if (activeTab.value === 'components') {
      activeTab.value = 'general'
    }
  } else {
    activeTab.value = 'components'
  }
}

const handleFormStateUpdate = (updatedState) => {
  Object.assign(form, updatedState)
}

const clearBackendError = (field) => {
  if (itemStore.validationErrors && itemStore.validationErrors[field]) {
    delete itemStore.validationErrors[field]
  }
}

/**
 * تصفية النموذج والتمرير السلس للأعلى مع التركيز وإظهار إشارة بصرية واضحة
 */
const resetForm = () => {
  const preservedCategoryId = form.category_id
  const preservedCategoryPath = form.category_path
  const preservedBaseUnitId = form.base_unit_id
  const preservedCurrencyId = form.purchase_currency_id

  const defaultPrices = itemStore.priceLists.map((pl) => ({
    price_list_id: pl.id,
    price_list_name: pl.name,
    discount_percentage: 0,
    price: 0,
  }))

  const freshState = getInitialFormState()
  freshState.category_id = preservedCategoryId
  freshState.category_path = preservedCategoryPath
  freshState.base_unit_id = preservedBaseUnitId
  freshState.purchase_currency_id = preservedCurrencyId

  if (preservedBaseUnitId) {
    freshState.units = [
      {
        unit_id: preservedBaseUnitId,
        conversion_factor: 1,
        cost: 0,
        foreign_cost: null,
        price: 0,
        barcodes: [],
        prices: defaultPrices,
      },
    ]
  }

  Object.assign(form, freshState)
  itemStore.validationErrors = null
  activeTab.value = 'general'
  isReadyForNextItem.value = true

  nextTick(() => {
    const nameInput = document.getElementById('item-name')
    if (nameInput) {
      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      nameInput.focus()
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })

  // إخفاء إشارة الصنف التالي تلقائياً بعد 6 ثوانٍ إن لم يبدأ المستخدم بالكتابة
  setTimeout(() => {
    isReadyForNextItem.value = false
  }, 6000)
}

const preparePayload = () => {
  return {
    name: form.name,
    item_type: form.item_type,
    profit_margin: Number(form.profit_margin || 0),
    purchase_currency_id: form.purchase_currency_id || null,
    pricing_policy: form.pricing_policy || 'manual',
    min_margin_percentage: Number(form.min_margin_percentage || 0),
    rounding_rule: form.rounding_rule || 'none',
    category_id: form.category_id,
    category_path: form.category_path,
    base_unit_id: form.base_unit_id,
    is_active: form.is_active ? 1 : 0,
    is_composite: form.is_composite ? 1 : 0,
    expiry_date: form.expiry_date || null,

    components: form.is_composite
      ? form.components.map((comp) => ({
          child_item_id: comp.child_item_id,
          quantity: Number(comp.quantity),
        }))
      : [],

    units: form.units.map((unit) => ({
      unit_id: unit.unit_id,
      conversion_factor: Number(unit.conversion_factor),
      cost: Number(unit.cost),
      foreign_cost:
        unit.foreign_cost !== null &&
        unit.foreign_cost !== '' &&
        unit.foreign_cost !== undefined &&
        !isNaN(unit.foreign_cost)
          ? Number(unit.foreign_cost)
          : null,
      price: Number(unit.price),
      barcodes: (unit.barcodes || []).map((b) =>
        typeof b === 'object' ? b.barcode : String(b).trim(),
      ),
      prices: (unit.prices || []).map((p) => ({
        price_list_id: p.price_list_id,
        discount_percentage: Number(p.discount_percentage || 0),
        price: Number(p.price),
      })),
    })),
  }
}

const submitForm = async () => {
  if (!form.name || !form.base_unit_id || form.units.length === 0) {
    toast.error('يرجى ملء اسم الصنف وتحديد الوحدة الأساسية على الأقل.')
    activeTab.value = 'general'
    return
  }

  if (form.is_composite && (!form.components || form.components.length === 0)) {
    toast.error('لقد قمت بتحديد أن الصنف تجميعي، يرجى إدراج مكون واحد على الأقل بجدول المكونات.')
    activeTab.value = 'components'
    return
  }

  const payload = preparePayload()

  try {
    if (isEditMode.value) {
      await itemStore.updateItem(route.params.id, payload)
      toast.success('تمت مزامنة بيانات الصنف وتحديث مصفوفته السعرية بنجاح.')
      goBack()
    } else {
      await itemStore.createItem(payload)
      toast.success('تم حفظ الصنف بنجاح، الشاشة جاهزة لإدخال الصنف التالي مباشرة.')
      resetForm()
    }
  } catch (err) {
    if (err.response?.status !== 422) {
      toast.error(itemStore.error || 'فشلت معالجة الطلب بسبب خطأ داخلي غير متوقع بالبيانات.')
    }
  }
}

const goBack = () => {
  itemStore.validationErrors = null
  router.push('/app/items')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-surface-border));
  border-radius: 10px;
}
</style>
