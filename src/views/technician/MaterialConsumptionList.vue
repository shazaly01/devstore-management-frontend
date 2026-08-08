<template>
  <div class="p-4 bg-[#1a1c23] min-h-screen text-white rounded-xl">
    <!-- رأس الشاشة -->
    <div class="flex justify-between items-center mb-6 border-b border-[#2d3039] pb-4">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <span class="w-2 h-6 bg-orange-500 rounded-full"></span>
          استهلاك الخامات الفردية بالورشة
        </h1>
        <p class="text-xs text-gray-400 mt-1">
          تسجيل سحب المواد الخام اللحظي وخصمها من الرفوف والقيود تلقائياً
        </p>
      </div>
      <div
        class="text-sm bg-[#25272e] px-4 py-2 rounded-lg border border-[#383b45] font-mono text-gray-300"
      >
        المستخدم الحالي: {{ authStore.user?.name || 'فني الورشة' }}
      </div>
    </div>

    <!-- قسم الإدخال السريع (الفورم الثابت دائماً بنمط صالة البيع والورشة الداكن) -->
    <div class="bg-[#21232b] rounded-xl border border-[#2d3039] p-6 shadow-xl mb-6">
      <h2 class="text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        إدخال حركة سحب جديدة
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- الصف الأول: ضبط المحاذاة والارتفاعات هندسياً تلافياً للخلل البصري -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 1. حقل اختيار المخزن -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">المخزن / المستودع *</label>
            <select
              v-model="form.store_id"
              required
              class="block w-full rounded-md shadow-sm px-3 bg-[#25272e] border border-[#383b45] text-white text-sm focus:outline-none focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b] h-[38px]"
            >
              <option value="" disabled>اختر المخزن المستهدف...</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
            <span
              v-if="consumptionStore.validationErrors?.store_id"
              class="text-rose-500 text-xs mt-1 block"
            >
              {{ consumptionStore.validationErrors.store_id[0] }}
            </span>
          </div>

          <!-- 2. حقل اختيار الخامة المطور بدون تكرار التلميح ومع مساحة علوية للمحاذاة الميكانيكية -->
          <div class="md:col-span-2">
            <!-- حجز مساحة علوية شفافة مطابقة تماماً للـ label المقابل لضمان استواء الخط الأفقي -->
            <label class="block text-sm font-medium opacity-0 mb-1 select-none" aria-hidden="true"
              >&nbsp;</label
            >

            <!-- إجبار الحاوية على الارتفاع h-[38px] مع استخدام flex items-center لاحتضان AppDropdown بشكل متناسق -->
            <div
              :class="[
                'rounded-md px-3 transition-all duration-200 bg-[#25272e] border h-[38px] flex items-center',
                form.store_id
                  ? 'border-[#383b45] focus-within:border-[#e05e2b]'
                  : 'border-[#2d3039] opacity-50',
              ]"
            >
              <AppDropdown
                id="item_id"
                :model-value="form.item_id"
                @update:model-value="handleDirectItemSelect"
                :options="searchableItems"
                option-label="dropdown_label"
                option-value="id"
                :loading="itemStore.loading"
                :disabled="!form.store_id || searchableItems.length === 0"
                placeholder="اضغط لاستعراض الخامات أو اكتب اسم الخامة للفلترة الفورية داخل القائمة..."
                variant="sales"
              />
            </div>

            <span
              v-if="consumptionStore.validationErrors?.item_id"
              class="text-rose-500 text-xs mt-1 block"
            >
              {{ consumptionStore.validationErrors.item_id[0] }}
            </span>
          </div>
        </div>

        <!-- الصف الثاني: الكمية والملاحظات -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <!-- 3. حقل الكمية المستهلكة -->
          <div>
            <AppInput
              id="quantity"
              type="text"
              inputmode="decimal"
              v-model="form.quantity"
              label="الكمية المستهلكة *"
              placeholder="0.00"
              required
              variant="sales"
              inputClass="font-mono text-base font-bold h-[38px]"
            >
              <!-- حقن وحدة السحب بشكل ديناميكي فوق الحقل بناءً على اختيار الصنف -->
              <template #label-append>
                <span
                  v-if="selectedItemUnitName"
                  class="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded text-xs font-bold border border-orange-500/20"
                >
                  وحدة القياس: {{ selectedItemUnitName }}
                </span>
              </template>
            </AppInput>
            <span
              v-if="consumptionStore.validationErrors?.quantity"
              class="text-rose-500 text-xs mt-1 block"
            >
              {{ consumptionStore.validationErrors.quantity[0] }}
            </span>
          </div>

          <!-- 4. حقل الملاحظات والبيان الحر للورشة -->
          <div class="md:col-span-2">
            <AppInput
              id="notes"
              type="text"
              v-model="form.notes"
              label="البيان الحر / ملاحظات أمر التشغيل (اختياري)"
              placeholder="اكتب اسم العميل، رقم اللوحة، أو سبب السحب الفني للورشة..."
              variant="sales"
              inputClass="h-[38px]"
            />
            <span
              v-if="consumptionStore.validationErrors?.notes"
              class="text-rose-500 text-xs mt-1 block"
            >
              {{ consumptionStore.validationErrors.notes[0] }}
            </span>
          </div>
        </div>

        <!-- زر الحفظ العريض والمميز بنمط النظام الداكن -->
        <div class="flex justify-end pt-4 border-t border-[#2d3039] mt-2">
          <button
            type="submit"
            :disabled="consumptionStore.loading || !selectedItem"
            class="w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-400 font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 text-white disabled:cursor-not-allowed"
          >
            <span v-if="consumptionStore.loading">جاري قفل الحسابات وحظر المخزن...</span>
            <template v-else>
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              تأكيد السحب الفوري وخصم الرف
            </template>
          </button>
        </div>
      </form>
    </div>

    <!-- قسم السحوبات الأخيرة (جدول الطمأنينة والتراجع الفوري للفني) -->
    <div class="bg-[#21232b] rounded-xl border border-[#2d3039] p-6 shadow-xl">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-base font-bold text-gray-200 flex items-center gap-2">
          <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          آخر السحوبات الفنية التي قمت بها اليوم
        </h2>
        <button
          @click="refreshTableOnly"
          class="p-1.5 text-gray-400 hover:text-white hover:bg-[#2d3039] rounded-lg transition-colors"
          title="تحديث الجدول دفترياً"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"
            />
          </svg>
        </button>
      </div>

      <div class="overflow-x-auto rounded-lg border border-[#2d3039]">
        <AppTable
          :headers="tableHeaders"
          :items="consumptionStore.consumptions"
          :is-loading="consumptionStore.loading"
          :row-clickable="false"
          class="text-right w-full text-sm"
        >
          <template #cell-id="{ item }">
            <span class="font-mono text-gray-400 text-xs"
              >CON-{{ String(item.id).padStart(5, '0') }}</span
            >
          </template>

          <template #cell-item_info="{ item }">
            <div class="flex flex-col py-1">
              <span class="font-bold text-gray-200 text-sm">{{
                item.item?.name || 'صنف غير معرف'
              }}</span>
              <span class="text-[11px] text-gray-400 font-mono mt-0.5"
                >كود الصنف: {{ item.item?.code || '-' }}</span
              >
            </div>
          </template>

          <template #cell-quantity_info="{ item }">
            <span class="font-bold text-amber-400 font-mono text-sm">
              {{ item.quantity }} {{ item.item_unit?.unit?.name || '' }}
            </span>
          </template>

          <template #cell-store_info="{ item }">
            <span
              class="text-gray-300 font-medium text-xs bg-[#2d3039] px-2 py-1 rounded border border-[#383b45]"
            >
              {{ item.store?.name || '-' }}
            </span>
          </template>

          <template #cell-time_info="{ item }">
            <span class="text-xs text-gray-400 font-mono">{{ formatTime(item.created_at) }}</span>
          </template>

          <template #cell-notes_info="{ item }">
            <span class="text-xs text-gray-300 max-w-[200px] block truncate" :title="item.notes">
              {{ item.notes || '---' }}
            </span>
          </template>

          <template #cell-actions="{ item }">
            <div class="flex items-center justify-end">
              <button
                v-if="authStore.can('sale.swap_raw_materials')"
                @click.stop="openDeleteDialog(item)"
                class="px-2.5 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-md text-xs font-bold transition-all flex items-center gap-1 border border-rose-500/20"
                title="التراجع عن هذا السحب وعكس القيود والمخزن"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                تراجع
              </button>
            </div>
          </template>
        </AppTable>
      </div>

      <div class="mt-4 bg-[#25272e] p-2 rounded-lg border border-[#383b45]">
        <AppPagination :meta="consumptionStore.pagination" @page-change="handlePageChange" />
      </div>
    </div>

    <!-- دايلوج التأكيد المحمي للتراجع الفوري والآمن عن الحركات الخاطئة -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد التراجع عن حظر صرف الخامة"
      :message="`هل أنت متأكد تماماً من رغبتك في إعدام حركة صرف '${itemToDelete?.item?.name}' بكمية (${itemToDelete?.quantity})؟ سيقوم النظام فوراً بإعادة الرصيد إلى الرف دفترياً وإبادة القيد المحاسبي المولد.`"
      @confirmed="deleteSelectedConsumption"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useMaterialConsumptionStore } from '@/stores/materialConsumptionStore'
import { useItemStore } from '@/stores/itemStore'
import { useStoreStore } from '@/stores/storeStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

// استيراد المكونات المشتركة لنظامك
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// إدارة مخازن البيانات المركزية (Pinia Stores)
const consumptionStore = useMaterialConsumptionStore()
const itemStore = useItemStore()
const storeStore = useStoreStore()
const authStore = useAuthStore()
const toast = useToast()

const form = ref({
  store_id: '',
  item_id: '',
  item_unit_id: '',
  quantity: '',
  notes: '',
})

const selectedItem = ref(null)
const isDeleteDialogOpen = ref(false)
const itemToDelete = ref(null)

const stores = computed(() => storeStore.stores)

// استبعاد الأصناف التجميعية (is_composite) وحصرها على المنتجات المادية البسيطة (product) لضمان جلب الخامات فقط
const searchableItems = computed(() => {
  if (!itemStore.items) return []
  return itemStore.items
    .filter((item) => item.is_composite === false && item.item_type === 'product')
    .map((item) => {
      const stock =
        item.current_stock !== undefined
          ? item.current_stock
          : item.stock !== undefined
            ? item.stock
            : 0
      return {
        ...item,
        id_display: `PRD-${item.id}`,
        name: item.name || '',
        stock_display: String(stock),
        dropdown_label: `${item.name} ——— [ المتاح بالمخزن: ${stock} ]`,
      }
    })
})

// مراقبة تغيير المستودع ومزامنة الحصر التلقائي مع السيرفر لفلترة المنتجات البسيطة فقط
watch(
  () => form.value.store_id,
  async (newStoreId) => {
    selectedItem.value = null
    form.value.item_id = ''
    form.value.item_unit_id = ''

    if (!newStoreId) {
      itemStore.items = []
      return
    }

    try {
      // تمرير 'item_type' للسيرفر لجلب المنتجات فقط دفعة واحدة (all: true) لتخفيف حجم البيانات التاريخية المتبادلة
      await itemStore.fetchItems(1, {
        is_active: 1,
        store_id: newStoreId,
        all: true,
        item_type: 'product',
      })
    } catch {
      toast.error('حدث خطأ أثناء مزامنة مواد المخزن المختار من الخادم.')
    }
  },
)

const selectedItemUnitName = computed(() => {
  if (!selectedItem.value) return ''
  const matchedUnit = selectedItem.value.units?.[0] || selectedItem.value.item_units?.[0]
  return matchedUnit ? matchedUnit.unit_name || matchedUnit.unit?.name : 'حبة'
})

const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'item_info', label: 'المادة الخام المنصرفة' },
    { key: 'quantity_info', label: 'الكمية الفردية' },
    { key: 'store_info', label: 'المستودع' },
    { key: 'time_info', label: 'وقت الصرف اللحظي' },
    { key: 'notes_info', label: 'البيان الحر للمستند' },
  ]
  if (authStore.can('sale.swap_raw_materials')) {
    headers.push({ key: 'actions', label: 'إلغاء وعكس', class: 'text-left' })
  }
  return headers
})

onMounted(async () => {
  try {
    await storeStore.fetchStores(1, { per_page: 100 })
    await consumptionStore.fetchConsumptions(1)

    // تفعيل الاختيار التلقائي لأول مستودع متاح لتغذية الدرج فوراً تلافياً للخطوات الزائدة للفنيين
    if (stores.value.length > 0) {
      form.value.store_id = stores.value[0].id
    }
  } catch {
    toast.error('فشل جلب الإعدادات المخزنية الأولية من النظام.')
  }
})

const refreshTableOnly = () => {
  consumptionStore.fetchConsumptions(consumptionStore.pagination?.current_page || 1)
}

const handleDirectItemSelect = (val) => {
  form.value.item_id = val
  const item = itemStore.items.find((i) => i.id === val)
  if (!item) {
    selectedItem.value = null
    form.value.item_unit_id = ''
    return
  }

  selectedItem.value = item

  const matchedUnit = item.units?.[0] || item.item_units?.[0]
  form.value.item_unit_id = matchedUnit ? matchedUnit.id : item.base_unit_id || ''
}

const handlePageChange = (page) => {
  consumptionStore.fetchConsumptions(page)
}

const handleSubmit = async () => {
  if (!authStore.can('sale.swap_raw_materials')) {
    toast.error('حظر تشغيلي: لا تملك صلاحية سحب مواد خام فنية.')
    return
  }

  try {
    await consumptionStore.createConsumption(form.value)
    toast.success('تمت الحركة، وجرى تحديث الأرصدة وعكس القيود التلقائية دفترياً.')

    const currentStoreId = form.value.store_id
    form.value = {
      store_id: currentStoreId,
      item_id: '',
      item_unit_id: '',
      quantity: '',
      notes: '',
    }
    selectedItem.value = null

    await itemStore.fetchItems(1, {
      is_active: 1,
      store_id: currentStoreId,
      all: true,
      item_type: 'product',
    })
    consumptionStore.fetchConsumptions(1)
  } catch {
    toast.error(consumptionStore.error || 'فشلت معالجة الطلب، راجع سلامة رصيد الصنف وتكلفته.')
  }
}

const openDeleteDialog = (item) => {
  itemToDelete.value = item
  isDeleteDialogOpen.value = true
}

const deleteSelectedConsumption = async () => {
  if (!itemToDelete.value) return

  try {
    const currentStoreId = form.value.store_id
    await consumptionStore.deleteConsumption(itemToDelete.value.id)
    toast.success('تم إعدام المستند وعكس حركات المخزن وتدخل الدفاتر بنجاح.')

    if (currentStoreId) {
      await itemStore.fetchItems(1, {
        is_active: 1,
        store_id: currentStoreId,
        all: true,
        item_type: 'product',
      })
    }

    if (
      consumptionStore.consumptions.length === 1 &&
      consumptionStore.pagination?.current_page > 1
    ) {
      await handlePageChange(consumptionStore.pagination.current_page - 1)
    } else {
      await handlePageChange(consumptionStore.pagination?.current_page || 1)
    }
  } catch {
    toast.error(consumptionStore.error || 'فشل التراجع عن حركة الاستهلاك لدواعي محاسبية حيوية.')
  } finally {
    isDeleteDialogOpen.value = false
    itemToDelete.value = null
  }
}

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  return date.toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<style scoped>
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
  background-repeat: no-repeat;
  background-position: left 0.75rem center;
  background-size: 1em;
  padding-left: 2rem;
}
</style>
