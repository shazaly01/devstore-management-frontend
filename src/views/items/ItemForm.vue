<!--src\views\items\ItemForm.vue---->
<template>
  <div class="max-w-5xl mx-auto pb-24 px-4 sm:px-6">
    <!-- ترويسة الصفحة -->
    <div class="mb-5 border-b border-surface-border pb-3">
      <h1 class="text-xl font-black text-text-primary">
        {{ isEditMode ? 'تعديل بيانات الصنف ومصفوفته السعرية' : 'إضافة صنف جديد' }}
      </h1>
      <p class="text-xs text-text-muted mt-1">
        نافذة الإدخال الفوري المتكامل للأصناف والباركودات وسياسات التسعير
      </p>
    </div>

    <div class="space-y-5">
      <!-- 1. كرت البيانات الأساسية للصنف وقسم التسعير القابل للطي -->
      <ItemBaseInfo
        :form-state="form"
        @update:form-state="handleFormStateUpdate"
        @clear-error="clearBackendError"
      />

      <!-- 2. مكون بناء وإدارة أسطر المكونات للأصناف التجميعية (يظهر عند تفعيل تجميعي فقط) -->
      <ItemComponentsSection
        :form-state="form"
        @update:form-state="handleFormStateUpdate"
        @clear-error="clearBackendError"
      />

      <!-- 3. كرت وحدات القياس ومصفوفة الأسعار والباركودات -->
      <ItemUnitsSplitLayout
        :form-state="form"
        @update:form-state="handleFormStateUpdate"
        @clear-error="clearBackendError"
      />

      <!-- 4. شريط الإجراءات والحفظ المثبت (Sticky Action Bar) لضمان ظهوره الدائم للمستخدم -->
      <div
        class="sticky bottom-4 z-20 mt-6 bg-surface-section/95 backdrop-blur-md border border-surface-border rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2 text-xs">
          <span
            class="w-2.5 h-2.5 rounded-full"
            :class="isEditMode ? 'bg-warning' : 'bg-primary'"
          ></span>
          <span class="font-bold text-text-secondary">
            {{ isEditMode ? 'وضع تعديل الصنف الحالي' : 'إضافة صنف جديد للمنظومة' }}
          </span>
          <span class="text-text-muted hidden sm:inline">
            | تأكد من مراجعة الوحدات والأسعار قبل الحفظ
          </span>
        </div>

        <div class="flex items-center gap-2">
          <AppButton type="button" variant="secondary" size="sm" @click="goBack">
            إلغاء التدوين
          </AppButton>
          <AppButton type="button" :disabled="loading" size="sm" @click="submitForm">
            {{
              loading
                ? 'جاري التثبيت والتدوين...'
                : isEditMode
                  ? 'تحديث وحفظ التعديلات'
                  : 'حفظ الصنف والمصفوفة كاملة'
            }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { useUnitStore } from '@/stores/unitStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import ItemBaseInfo from './components/ItemBaseInfo.vue'
import ItemComponentsSection from './components/ItemComponentsSection.vue'
import ItemUnitsSplitLayout from './components/ItemUnitsSplitLayout.vue'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const unitStore = useUnitStore()
const categoryStore = useCategoryStore()
const toast = useToast()

const isEditMode = computed(() => !!route.params.id)
const loading = computed(() => itemStore.loading)

// كائن الحالة الشجرية الكامل للصنف
const form = reactive({
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

onMounted(async () => {
  itemStore.validationErrors = null

  await unitStore.fetchUnits(1, { is_active: 1 })
  await itemStore.fetchPriceLists()

  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories(1)
  }

  // في حالة التعديل: قراءة الملف التاريخي للصنف وتعبئة الحالة
  if (isEditMode.value) {
    await itemStore.fetchItem(route.params.id)
    if (itemStore.currentItem) {
      const rawItem = itemStore.currentItem

      form.name = rawItem.name
      form.item_type = rawItem.item_type
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

const handleFormStateUpdate = (updatedState) => {
  Object.assign(form, updatedState)
}

const clearBackendError = (field) => {
  if (itemStore.validationErrors && itemStore.validationErrors[field]) {
    delete itemStore.validationErrors[field]
  }
}

/**
 * بناء وتجهيز حزمة البيانات الرقمية النهائية لمطابقتها مع قواعد تحقق الباك إند
 */
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
      barcodes: unit.barcodes.map((b) => (typeof b === 'object' ? b.barcode : String(b).trim())),
      prices: unit.prices.map((p) => ({
        price_list_id: p.price_list_id,
        discount_percentage: Number(p.discount_percentage || 0),
        price: Number(p.price),
      })),
    })),
  }
}

const submitForm = async () => {
  if (!form.name || !form.base_unit_id || form.units.length === 0) {
    toast.error('يرجى ملء كافة الحقول الإلزامية وتأمين وحدة قياس واحدة على الأقل بالجدول.')
    return
  }

  if (form.is_composite && (!form.components || form.components.length === 0)) {
    toast.error('لقد قمت بتحديد أن الصنف تجميعي، يرجى إدراج مكون واحد على الأقل بجدول المكونات.')
    return
  }

  const payload = preparePayload()

  try {
    if (isEditMode.value) {
      await itemStore.updateItem(route.params.id, payload)
      toast.success('تمت مزامنة بيانات الصنف وتحديث مصفوفته السعرية بنجاح.')
    } else {
      await itemStore.createItem(payload)
      toast.success('تم تسجيل الصنف الجديد ومواصفات تركيبته وأسعاره بنجاح.')
    }
    goBack()
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
