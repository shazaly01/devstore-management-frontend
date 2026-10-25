<!--src/views/purchases/PurchaseForm.vue-->
<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ isEdit ? 'تعديل مستند المشتريات' : 'فاتورة مشتريات جديدة' }}
        </h1>
      </div>
    </div>

    <div
      v-if="purchaseStore.error"
      class="p-3 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-bold shadow-sm"
    >
      {{ purchaseStore.error }}
    </div>

    <PurchaseHeader v-model="form" :validation-errors="purchaseStore.validationErrors" />

    <AppCard>
      <div ref="tableWrapperRef" class="space-y-4">
        <!-- شريط البحث مدمج مع حقل نسبة الربح العامة في نفس السطر -->
        <div class="flex flex-col md:flex-row items-center gap-3">
          <div
            class="flex-1 w-full text-xs bg-primary p-1 rounded-xl shadow-md shadow-primary/20 border border-primary transition-all duration-200"
          >
            <SmartSearchGrid
              ref="searchGridRef"
              :data="searchableItems"
              :columns="[
                { key: 'id_display', label: 'رقم الصنف', class: 'text-right' },
                { key: 'name', label: 'اسم الصنف التجاري المعتمد', class: 'text-right font-bold' },
                { key: 'price_display', label: 'السعر الافتراضي', class: 'text-center' },
                { key: 'stock_display', label: 'الكمية المتاحة حالياً', class: 'text-center' },
              ]"
              :search-keys="['id', 'name', 'code', 'all_barcodes']"
              placeholder="اكتب اسم المنتج أو رقم الصنف للمزامنة اللحظية الفورية..."
              @select="handleGlobalItemSelect"
            />
          </div>

          <!-- أداة نسبة الربح العامة المدمجة -->
          <div
            class="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 bg-surface-ground border border-surface-border hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 px-3 py-1.5 rounded-xl shadow-sm transition-all duration-200"
          >
            <div class="flex items-center gap-1.5 text-primary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span class="text-xs font-bold text-text-secondary whitespace-nowrap">
                نسبة الربح العامة:
              </span>
            </div>

            <div class="relative flex items-center">
              <input
                type="number"
                v-model.number="globalProfitMargin"
                @keyup.enter="applyGlobalProfitMargin"
                placeholder="0"
                min="0"
                step="0.5"
                class="w-16 p-1 bg-surface-section text-text-primary border border-surface-border focus:border-primary rounded-lg text-xs font-bold text-center font-mono outline-none transition-all"
              />
              <span class="mr-1 text-xs font-bold text-text-muted">%</span>
            </div>

            <button
              type="button"
              @click="applyGlobalProfitMargin"
              class="px-2.5 py-1 bg-primary hover:bg-primary-dark active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
              title="تطبيق النسبة على كل الأصناف الحالية"
            >
              تطبيق
            </button>
          </div>
        </div>

        <p
          v-if="getValidationError('items')"
          class="p-2.5 bg-danger/10 text-danger rounded-lg text-xs font-bold border border-danger/30 shadow-sm"
        >
          {{ getValidationError('items') }}
        </p>

        <InvoiceDetailTable
          :items="items"
          :schema="visibleTableSchema"
          @remove-row="removeRow"
          @add-row-request="triggerAddNewEmptyLine"
        >
          <template #cell-item_name="{ row }">
            <div class="w-full px-1 overflow-hidden" :title="row.item_name">
              <span class="block truncate text-xs font-bold text-text-primary cursor-default">
                {{ row.item_name || '-' }}
              </span>
            </div>
          </template>

          <template #cell-item_unit_id="{ row, index }">
            <div class="flex flex-col w-full">
              <select
                v-model="row.item_unit_id"
                @change="syncUnitCostPrice(row)"
                :disabled="!row.available_units || row.available_units.length === 0"
                class="w-full p-1 bg-transparent text-text-primary border border-transparent hover:border-surface-border focus:border-primary focus:bg-surface-ground rounded-md text-xs font-bold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-right appearance-none"
              >
                <option value="" class="bg-surface-section text-text-muted">اختر الوحدة...</option>
                <option
                  v-for="u in row.available_units"
                  :key="u.id"
                  :value="u.id"
                  class="bg-surface-section text-text-primary"
                >
                  {{ u.unit_name || 'وحدة مجهولة' }}
                </option>
              </select>
              <p
                v-if="getValidationError(`items.${index}.item_unit_id`)"
                class="text-danger text-[9px] font-bold mt-0.5"
              >
                الوحدة مطلوبة أو مكررة للسطر
              </p>
            </div>
          </template>

          <template #cell-quantity="{ row, index, col }">
            <div class="w-full flex justify-center items-center">
              <input
                type="text"
                v-model="row.quantity"
                :data-row="index"
                :data-col="col.key"
                @keydown.enter.prevent="onQuantityEnter"
                @keydown.arrow-left.prevent="onQuantityArrowLeft(index)"
                class="w-full p-1 bg-transparent border-none text-text-primary font-bold text-xs focus:outline-none text-center font-mono transition-all focus:bg-surface-ground focus:rounded"
                placeholder="0"
              />
            </div>
          </template>

          <template #cell-foreign_unit_cost="{ row, index }">
            <div class="w-full flex justify-center items-center">
              <input
                type="text"
                inputmode="decimal"
                :data-row="index"
                data-col="foreign_unit_cost"
                :value="formatNumber(row.foreign_unit_cost)"
                @input="handleForeignUnitCostInput(row, $event.target.value)"
                @keydown.enter.prevent="onFieldEnter"
                @keydown.arrow-left.prevent="focusField(index, 'unit_cost')"
                @keydown.arrow-right.prevent="focusQuantity(index)"
                class="w-full p-1 bg-surface-ground border border-surface-border hover:border-primary/50 focus:border-primary focus:bg-surface-section rounded transition-all text-xs text-center font-mono text-text-primary font-bold outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="0"
              />
            </div>
          </template>

          <template #cell-unit_cost="{ row, index }">
            <div class="w-full flex justify-center items-center">
              <input
                type="text"
                inputmode="decimal"
                :data-row="index"
                data-col="unit_cost"
                :value="formatNumber(row.unit_cost)"
                @input="handleUnitCostInput(row, $event.target.value)"
                @keydown.enter.prevent="onFieldEnter"
                @keydown.arrow-left.prevent="focusField(index, 'selling_price')"
                @keydown.arrow-right.prevent="
                  focusField(index, form.currency_id ? 'foreign_unit_cost' : 'quantity')
                "
                class="w-full p-1 bg-surface-ground border border-surface-border hover:border-primary/50 focus:border-primary focus:bg-surface-section rounded transition-all text-xs text-center font-mono text-text-primary font-bold outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="0"
              />
            </div>
          </template>

          <template #cell-selling_price="{ row, index }">
            <div class="w-full flex justify-center items-center">
              <input
                type="text"
                inputmode="decimal"
                :data-row="index"
                data-col="selling_price"
                :value="formatNumber(row.selling_price)"
                @input="handleSellingPriceInput(row, $event.target.value)"
                @keydown.enter.prevent="onFieldEnter"
                @keydown.arrow-right.prevent="focusField(index, 'unit_cost')"
                class="w-full p-1 bg-surface-ground border border-surface-border hover:border-primary/50 focus:border-primary focus:bg-surface-section rounded transition-all text-xs text-center font-mono text-text-primary font-bold outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="0"
              />
            </div>
          </template>

          <template #cell-grand_total="{ row }">
            <div class="w-full flex justify-center items-center">
              <input
                type="text"
                readonly
                :value="formatNumber(row.grand_total)"
                class="w-full p-1 bg-surface-ground border border-surface-border rounded text-xs text-center font-mono text-primary font-black cursor-default"
                placeholder="0"
              />
            </div>
          </template>
        </InvoiceDetailTable>
      </div>
    </AppCard>

    <PurchaseFooter
      v-model:notes="form.notes"
      v-model:discountAmount="form.discount_amount"
      v-model:taxAmount="form.tax_amount"
      :subtotal="headerSubtotal"
      :grand-total="headerGrandTotal"
      :validation-errors="purchaseStore.validationErrors"
    />

    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        مستند المشتريات والمدخلات المالية الحالية تخضع للمراقبة الجردية والتدقيق اللحظي للأرصدة
        وتكلفة الاستبدال.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>
        <AppButton type="button" size="sm" :disabled="purchaseStore.loading" @click="handleSubmit">
          <span v-if="purchaseStore.loading">جاري حفظ المستند الحالي...</span>
          <span v-else>{{
            isEdit ? 'تحديث ومزامنة الفاتورة' : 'ترحيل وحفظ الفاتورة النهائية'
          }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseStore } from '@/stores/purchaseStore'
import { useItemStore } from '@/stores/itemStore'
import { useAuthStore } from '@/stores/authStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import InvoiceDetailTable from '@/components/ui/dynamic-invoice/InvoiceDetailTable.vue'
import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'

import PurchaseHeader from './components/PurchaseHeader.vue'
import PurchaseFooter from './components/PurchaseFooter.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const purchaseStore = usePurchaseStore()
const itemStore = useItemStore()
const authStore = useAuthStore()

const searchGridRef = ref(null)
const tableWrapperRef = ref(null)

const isEdit = computed(() => !!route.params.id)
const isHydrating = ref(false)

const globalProfitMargin = ref(null)
let isRecalculating = false

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return ''
  const num = Number(value)
  if (isNaN(num)) return ''
  const options = {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  }
  return new Intl.NumberFormat('en-US', options).format(num)
}

const unformatNumber = (text) => {
  if (!text) return 0
  const cleaned = String(text).replace(/[^0-9.]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

const handleForeignUnitCostInput = (row, value) => {
  if (!value || String(value).trim() === '') {
    row.foreign_unit_cost = null
  } else {
    row.foreign_unit_cost = unformatNumber(value)
  }
}

const handleUnitCostInput = (row, value) => {
  row.unit_cost = unformatNumber(value)
}

const handleSellingPriceInput = (row, value) => {
  row.selling_price = unformatNumber(value)
}

const form = ref({
  invoice_type: 'purchase',
  parent_id: null,
  store_id: '',
  treasury_id: '',
  bank_id: '',
  supplier_id: '',
  currency_id: null,
  exchange_rate: 1,
  invoice_date: new Date().toISOString().substr(0, 10),
  payment_type: 'cash',
  discount_amount: 0,
  tax_amount: 0,
  notes: '',
})

const items = ref([])

const detailSchema = [
  {
    key: 'item_id_display',
    label: 'رقم الصنف',
    widthClass: 'w-[7%]',
    readonly: true,
    type: 'text',
    extractFromItem: (item) => (item.id ? `PRD-${item.id}` : ''),
  },
  {
    key: 'item_name',
    label: 'اسم الصنف التجاري المعتمد',
    widthClass: 'w-[18%]',
    readonly: true,
    type: 'text',
    extractFromItem: (item) => item.name || '',
  },
  {
    key: 'item_id',
    extractFromItem: (item) => item.id,
  },
  {
    key: 'available_units',
    defaultValue: [],
    extractFromItem: (item) => item.units || [],
  },
  {
    key: 'item_unit_id',
    label: 'وحدة التعبئة',
    slot: 'cell-item_unit_id',
    widthClass: 'w-[7%]',
    type: 'text',
    extractFromItem: (item) => item.units?.[0]?.id || '',
  },
  {
    key: 'base_stock',
    extractFromItem: (item) => parseFloat(item.current_stock) || 0,
  },
  {
    key: 'available_stock',
    label: 'المخزون الحالي',
    type: 'calculated',
    readonly: true,
    widthClass: 'w-[6%]',
    formula: (row) => {
      if (row.base_stock === null || row.base_stock === undefined) return 0
      const matchedUnit = row.available_units?.find(
        (u) => String(u.id) === String(row.item_unit_id),
      )
      const factor = matchedUnit ? parseFloat(matchedUnit.conversion_factor) || 1 : 1
      return parseFloat((row.base_stock / factor).toFixed(2))
    },
  },
  {
    key: 'quantity',
    label: 'الكمية',
    type: 'number',
    defaultValue: 1,
    widthClass: 'w-[6%]',
    slot: 'cell-quantity',
  },
  {
    key: 'foreign_unit_cost',
    label: 'التكلفة بالعملة الأجنبية',
    type: 'number',
    defaultValue: null,
    widthClass: 'w-[8%]',
    slot: 'cell-foreign_unit_cost',
    extractFromItem: (item) => {
      const foreignCost = item.units?.[0]?.foreign_cost
      return foreignCost !== null && foreignCost !== undefined ? parseFloat(foreignCost) : null
    },
  },
  {
    key: 'unit_cost',
    label: 'تكلفة الوحدة (محلي)',
    type: 'number',
    defaultValue: 0,
    widthClass: 'w-[11%]',
    slot: 'cell-unit_cost',
    extractFromItem: (item) => {
      const cost = item.units?.[0]?.cost || 0
      return parseFloat(cost) || 0
    },
  },
  {
    key: 'profit_margin',
    label: 'نسبة الربح %',
    type: 'number',
    defaultValue: 0,
    widthClass: 'w-[6%]',
    extractFromItem: (item) => {
      if (
        globalProfitMargin.value !== null &&
        globalProfitMargin.value !== '' &&
        parseFloat(globalProfitMargin.value) >= 0
      ) {
        return parseFloat(globalProfitMargin.value)
      }
      return parseFloat(item.profit_margin) || 0
    },
  },
  {
    key: 'selling_price',
    label: 'سعر البيع',
    type: 'number',
    defaultValue: 0,
    widthClass: 'w-[11%]',
    slot: 'cell-selling_price',
    extractFromItem: (item) => {
      const unitCost = item.units?.[0]?.cost || 0
      const margin =
        globalProfitMargin.value !== null &&
        globalProfitMargin.value !== '' &&
        parseFloat(globalProfitMargin.value) >= 0
          ? parseFloat(globalProfitMargin.value)
          : parseFloat(item.profit_margin) || 0

      if (unitCost > 0 && margin > 0) {
        return parseFloat((unitCost * (1 + margin / 100)).toFixed(4))
      }
      const unitPrice = item.units?.[0]?.price || 0
      if (unitPrice > 0) return unitPrice
      return 0
    },
  },
  {
    key: 'expiry_date',
    label: 'تاريخ الصلاحية',
    type: 'date',
    defaultValue: '',
    widthClass: 'w-[8%]',
    extractFromItem: (item) => (item.expiry_date ? String(item.expiry_date).substring(0, 10) : ''),
  },
  {
    key: 'grand_total',
    label: 'الاجمالى',
    type: 'calculated',
    readonly: true,
    summary: true,
    widthClass: 'w-[12%]',
    slot: 'cell-grand_total',
    formula: (row) => {
      const q = parseFloat(row.quantity) || 0
      const c = parseFloat(row.unit_cost) || 0
      return parseFloat((q * c).toFixed(4))
    },
  },
]

const applyGlobalProfitMargin = () => {
  const margin = parseFloat(globalProfitMargin.value)
  if (isNaN(margin) || margin < 0) {
    toast.warning('يرجى إدخال نسبة ربح صالحة.')
    return
  }

  if (items.value.length === 0) {
    toast.info('لا توجد أصناف حالياً في الجدول لتطبيق النسبة عليها.')
    return
  }

  isRecalculating = true
  items.value.forEach((row) => {
    row.profit_margin = margin
    const cost = parseFloat(row.unit_cost) || 0
    if (cost > 0) {
      const calculatedPrice = cost * (1 + margin / 100)
      row.selling_price = parseFloat(calculatedPrice.toFixed(4))
    }
  })

  setTimeout(() => {
    isRecalculating = false
  }, 50)

  toast.success(`تم تطبيق نسبة ربح ${margin}% على جميع الأصناف بنجاح.`)
}

watch(
  () => form.value.payment_type,
  (newType) => {
    if (newType === 'cash') {
      form.value.bank_id = ''
      form.value.treasury_id =
        isEdit.value && purchaseStore.currentPurchase?.treasury_id
          ? purchaseStore.currentPurchase.treasury_id
          : authStore.user?.treasury_id || ''
    } else if (newType === 'card') {
      form.value.treasury_id = ''
      form.value.bank_id =
        isEdit.value && purchaseStore.currentPurchase?.bank_id
          ? purchaseStore.currentPurchase.bank_id
          : authStore.user?.bank_id || ''
    } else if (newType === 'credit') {
      form.value.treasury_id = ''
      form.value.bank_id = ''
    }
  },
)

watch(
  () => form.value.exchange_rate,
  (newRate) => {
    const rate = parseFloat(newRate) || 1
    if (rate > 0 && form.value.currency_id) {
      isRecalculating = true
      items.value.forEach((row) => {
        if (
          row.foreign_unit_cost !== null &&
          row.foreign_unit_cost !== '' &&
          parseFloat(row.foreign_unit_cost) > 0
        ) {
          row.unit_cost = parseFloat((parseFloat(row.foreign_unit_cost) * rate).toFixed(4))
          const margin = parseFloat(row.profit_margin) || 0
          if (margin > 0) {
            row.selling_price = parseFloat((row.unit_cost * (1 + margin / 100)).toFixed(4))
          }
        }
      })
      setTimeout(() => {
        isRecalculating = false
      }, 50)
    }
  },
)

watch(
  () =>
    items.value.map((row) => ({
      foreign_cost: row.foreign_unit_cost,
      cost: row.unit_cost,
      margin: row.profit_margin,
      price: row.selling_price,
    })),
  (newVals, oldVals) => {
    if (isHydrating.value || isRecalculating) return

    newVals.forEach((val, index) => {
      const old = oldVals?.[index]
      const row = items.value[index]
      if (!row || !old) return

      const foreignChanged = val.foreign_cost !== old.foreign_cost
      const costChanged = val.cost !== old.cost
      const marginChanged = val.margin !== old.margin
      const priceChanged = val.price !== old.price

      const exchangeRate = parseFloat(form.value.exchange_rate) || 1
      const hasForeignCurrency = !!form.value.currency_id && exchangeRate > 0

      if (foreignChanged) {
        isRecalculating = true
        if (
          row.foreign_unit_cost !== null &&
          row.foreign_unit_cost !== '' &&
          parseFloat(row.foreign_unit_cost) > 0
        ) {
          row.unit_cost = parseFloat((parseFloat(row.foreign_unit_cost) * exchangeRate).toFixed(4))
        }
        const cost = parseFloat(row.unit_cost) || 0
        const margin = parseFloat(row.profit_margin) || 0
        if (cost > 0 && margin > 0) {
          row.selling_price = parseFloat((cost * (1 + margin / 100)).toFixed(4))
        }
        setTimeout(() => {
          isRecalculating = false
        }, 50)
        return
      }

      if (costChanged) {
        isRecalculating = true
        if (hasForeignCurrency) {
          const localCost = parseFloat(row.unit_cost) || 0
          row.foreign_unit_cost =
            localCost > 0 ? parseFloat((localCost / exchangeRate).toFixed(4)) : null
        }
        const cost = parseFloat(row.unit_cost) || 0
        const margin = parseFloat(row.profit_margin) || 0
        if (cost > 0 && margin > 0) {
          row.selling_price = parseFloat((cost * (1 + margin / 100)).toFixed(4))
        }
        setTimeout(() => {
          isRecalculating = false
        }, 50)
        return
      }

      const cost = parseFloat(row.unit_cost) || 0
      const margin = parseFloat(row.profit_margin) || 0
      const price = parseFloat(row.selling_price) || 0

      if (priceChanged && !marginChanged) {
        if (cost > 0) {
          isRecalculating = true
          const calculatedMargin = ((price - cost) / cost) * 100
          row.profit_margin = parseFloat(calculatedMargin.toFixed(2))
          setTimeout(() => {
            isRecalculating = false
          }, 50)
        }
      } else if (marginChanged && !priceChanged) {
        if (cost > 0) {
          isRecalculating = true
          const calculatedPrice = cost * (1 + margin / 100)
          row.selling_price = parseFloat(calculatedPrice.toFixed(4))
          setTimeout(() => {
            isRecalculating = false
          }, 50)
        }
      }
    })
  },
  { deep: true },
)

const searchableItems = computed(() => {
  if (!itemStore.items) return []
  return itemStore.items.map((item) => {
    const directBarcodes = Array.isArray(item.barcodes)
      ? item.barcodes.map((b) => (typeof b === 'object' ? b.barcode : b))
      : []

    const unitBarcodes = Array.isArray(item.units)
      ? item.units.flatMap((u) =>
          Array.isArray(u.barcodes)
            ? u.barcodes.map((b) => (typeof b === 'object' ? b.barcode : b))
            : [],
        )
      : []

    const allBarcodes = [...new Set([...directBarcodes, ...unitBarcodes])].filter(Boolean)

    return {
      ...item,
      id_display: `PRD-${item.id}`,
      name: item.name || '',
      price_display: item.units?.[0] ? `${parseFloat(item.units[0].price).toFixed(2)}` : '0.00',
      stock_display:
        item.current_stock !== undefined
          ? `${item.current_stock}`
          : item.stock !== undefined
            ? `${item.stock}`
            : '0',
      all_barcodes: allBarcodes,
    }
  })
})

const visibleTableSchema = computed(() => detailSchema.filter((col) => col.label))

const { createEmptyRow, handleItemSelected, removeRow } = useDynamicDetails(items, detailSchema, {
  uniqueKeys: ['item_id', 'item_unit_id'],
  mergeQtyKey: 'quantity',
})

watch(
  () => form.value.store_id,
  async (newStoreId) => {
    if (isHydrating.value) return
    if (!newStoreId) return

    await itemStore.fetchItems(1, { is_active: 1, store_id: newStoreId, all: true })

    const activeItemIds = items.value.map((row) => row.item_id).filter((id) => id)

    if (activeItemIds.length > 0) {
      try {
        const stockMap = await itemStore.refreshItemsStock({
          store_id: parseInt(newStoreId, 10),
          item_ids: activeItemIds,
        })

        items.value.forEach((row) => {
          if (row.item_id && stockMap[row.item_id] !== undefined) {
            row.base_stock = parseFloat(stockMap[row.item_id]) || 0
          } else if (row.item_id) {
            row.base_stock = 0
          }
        })
      } catch (err) {
        console.error('فشل في مزامنة أرصدة الأسطر مع المستودع الجديد:', err)
      }
    }
  },
)

const focusQuantity = (rowIndex) => {
  nextTick(() => {
    const selector = `input[data-row="${rowIndex}"][data-col="quantity"]`
    const inputEl =
      tableWrapperRef.value?.querySelector(selector) || document.querySelector(selector)
    if (inputEl) {
      inputEl.focus()
      if (typeof inputEl.select === 'function') {
        inputEl.select()
      }
    }
  })
}

const focusField = (rowIndex, colKey) => {
  nextTick(() => {
    const selector = `input[data-row="${rowIndex}"][data-col="${colKey}"]`
    const inputEl =
      tableWrapperRef.value?.querySelector(selector) || document.querySelector(selector)
    if (inputEl) {
      inputEl.focus()
      if (typeof inputEl.select === 'function') {
        inputEl.select()
      }
    }
  })
}

const onQuantityEnter = () => {
  searchGridRef.value?.focus()
}

const onQuantityArrowLeft = (rowIndex) => {
  const targetCol = form.value.currency_id ? 'foreign_unit_cost' : 'unit_cost'
  focusField(rowIndex, targetCol)
}

const onFieldEnter = () => {
  searchGridRef.value?.focus()
}

const handleGlobalItemSelect = (selectedItem) => {
  if (!selectedItem) return
  handleItemSelected(selectedItem)

  if (
    globalProfitMargin.value !== null &&
    globalProfitMargin.value !== '' &&
    parseFloat(globalProfitMargin.value) >= 0
  ) {
    const margin = parseFloat(globalProfitMargin.value)
    const targetRow = items.value.find((r) => r.item_id === selectedItem.id)
    if (targetRow) {
      targetRow.profit_margin = margin
      const cost = parseFloat(targetRow.unit_cost) || 0
      if (cost > 0) {
        targetRow.selling_price = parseFloat((cost * (1 + margin / 100)).toFixed(4))
      }
    }
  }

  nextTick(() => {
    const defaultUnitId = selectedItem.units?.[0]?.id || ''
    let targetIndex = items.value.findIndex((row) => {
      if (row.item_id !== selectedItem.id) return false
      if (defaultUnitId) return String(row.item_unit_id) === String(defaultUnitId)
      return true
    })

    if (targetIndex === -1) {
      targetIndex = items.value.length - 1
    }

    if (targetIndex >= 0) {
      focusQuantity(targetIndex)
    }
  })
}

const triggerAddNewEmptyLine = () => {
  const newRow = createEmptyRow()
  if (
    globalProfitMargin.value !== null &&
    globalProfitMargin.value !== '' &&
    parseFloat(globalProfitMargin.value) >= 0
  ) {
    newRow.profit_margin = parseFloat(globalProfitMargin.value)
  }
  items.value.push(newRow)
}

const syncUnitCostPrice = (row) => {
  const matchedUnit = row.available_units?.find((u) => String(u.id) === String(row.item_unit_id))
  if (matchedUnit) {
    row.unit_cost = parseFloat(matchedUnit.cost) || 0
    row.foreign_unit_cost =
      matchedUnit.foreign_cost !== null && matchedUnit.foreign_cost !== undefined
        ? parseFloat(matchedUnit.foreign_cost)
        : null
    row.selling_price = parseFloat(matchedUnit.price) || 0

    const exchangeRate = parseFloat(form.value.exchange_rate) || 1
    if (form.value.currency_id && exchangeRate > 0) {
      if (row.foreign_unit_cost && (!row.unit_cost || row.unit_cost === 0)) {
        row.unit_cost = parseFloat((row.foreign_unit_cost * exchangeRate).toFixed(4))
      }
    }

    if (
      globalProfitMargin.value !== null &&
      globalProfitMargin.value !== '' &&
      parseFloat(globalProfitMargin.value) >= 0
    ) {
      row.profit_margin = parseFloat(globalProfitMargin.value)
      if (row.unit_cost > 0) {
        row.selling_price = parseFloat(
          (row.unit_cost * (1 + parseFloat(row.profit_margin) / 100)).toFixed(4),
        )
      }
    } else if (row.unit_cost > 0 && row.selling_price > 0) {
      row.profit_margin = parseFloat(
        (((row.selling_price - row.unit_cost) / row.unit_cost) * 100).toFixed(2),
      )
    } else if (row.unit_cost > 0 && parseFloat(row.profit_margin) > 0) {
      row.selling_price = parseFloat(
        (row.unit_cost * (1 + parseFloat(row.profit_margin) / 100)).toFixed(4),
      )
    }
  }
}

const headerSubtotal = computed(() => {
  return items.value.reduce((sum, row) => sum + (parseFloat(row.grand_total) || 0), 0)
})

const headerGrandTotal = computed(() => {
  const sub = headerSubtotal.value
  const disc = parseFloat(form.value.discount_amount) || 0
  const tax = parseFloat(form.value.tax_amount) || 0
  return parseFloat(Math.max(0, sub - disc + tax).toFixed(4))
})

const getValidationError = (path) => {
  return purchaseStore.validationErrors?.[path]?.[0] || null
}

onMounted(async () => {
  if (isEdit.value) {
    isHydrating.value = true
    await purchaseStore.fetchPurchase(route.params.id)
    if (purchaseStore.currentPurchase) {
      const cur = purchaseStore.currentPurchase

      items.value = cur.items.map((it) => {
        const cost = parseFloat(it.unit_cost) || 0
        const price =
          it.selling_price !== null && it.selling_price !== undefined
            ? parseFloat(it.selling_price)
            : parseFloat(
                it.available_units?.find((u) => String(u.id) === String(it.item_unit_id))?.price,
              ) || 0

        const margin =
          it.profit_margin !== null && it.profit_margin !== undefined
            ? parseFloat(it.profit_margin)
            : cost > 0 && price > 0
              ? parseFloat((((price - cost) / cost) * 100).toFixed(2))
              : 0

        return {
          item_id_display: it.item_id ? `PRD-${it.item_id}` : '',
          item_name: it.item_name || '',
          item_id: it.item_id,
          item_unit_id: it.item_unit_id,
          quantity: it.quantity,
          unit_cost: cost,
          foreign_unit_cost:
            it.foreign_unit_cost !== null && it.foreign_unit_cost !== undefined
              ? parseFloat(it.foreign_unit_cost)
              : null,
          profit_margin: margin,
          selling_price: price,
          expiry_date: it.expiry_date ? String(it.expiry_date).substring(0, 10) : '',
          grand_total: it.grand_total,
          available_units: it.available_units || [],
          base_stock: parseFloat(it.current_stock) || 0,
          available_stock: 0,
          _flashing: false,
        }
      })

      form.value = {
        invoice_type: cur.invoice_type,
        parent_id: cur.parent_id,
        store_id: cur.store_id || '',
        treasury_id: cur.treasury_id || '',
        bank_id: cur.bank_id || '',
        supplier_id: cur.supplier_id,
        currency_id: cur.currency_id || null,
        exchange_rate: cur.exchange_rate ? parseFloat(cur.exchange_rate) : 1,
        invoice_date: cur.invoice_date.substr(0, 10),
        payment_type: cur.payment_type,
        discount_amount: cur.discount_amount || 0,
        tax_amount: cur.tax_amount || 0,
        notes: cur.notes || '',
      }

      if (cur.store_id) {
        await itemStore.fetchItems(1, { is_active: 1, store_id: cur.store_id, all: true })
      }
    }
    isHydrating.value = false
  } else {
    if (authStore.user) {
      form.value.store_id = authStore.user.store_id || ''
      form.value.treasury_id = authStore.user.treasury_id || ''
      form.value.bank_id = authStore.user.bank_id || ''
    }
  }
})

const handleSubmit = async () => {
  const dynamicItemsPayload = items.value
    .filter((row) => row.item_id && row.item_unit_id)
    .map((row) => ({
      item_id: row.item_id,
      item_unit_id: row.item_unit_id,
      quantity: parseFloat(row.quantity) || 0,
      unit_cost: parseFloat(row.unit_cost) || 0,
      foreign_unit_cost:
        row.foreign_unit_cost !== null && row.foreign_unit_cost !== ''
          ? parseFloat(row.foreign_unit_cost)
          : null,
      profit_margin: parseFloat(row.profit_margin) || 0,
      selling_price: parseFloat(row.selling_price) || 0,
      expiry_date: row.expiry_date ? row.expiry_date : null,
      subtotal: parseFloat(row.grand_total) || 0,
      discount_amount: 0,
      grand_total: parseFloat(row.grand_total) || 0,
    }))

  const finalPayload = {
    ...form.value,
    currency_id: form.value.currency_id || null,
    exchange_rate: form.value.exchange_rate ? parseFloat(form.value.exchange_rate) : null,
    subtotal: headerSubtotal.value,
    grand_total: headerGrandTotal.value,
    items: dynamicItemsPayload,
  }

  try {
    if (isEdit.value) {
      await purchaseStore.updatePurchase(route.params.id, finalPayload)
      toast.success('تم تحديث ومزامنة مستند المشتريات بنجاح.')
    } else {
      await purchaseStore.createPurchase(finalPayload)
      toast.success('تم ترحيل الفاتورة وضخ الأرصدة بالمستودعات بنجاح.')
    }
    router.push('/app/purchases')
  } catch {
    toast.error('فشلت عملية الحفظ، يرجى التحقق من أخطاء بنود الإدخال.')
  }
}

const handleCancel = () => {
  router.push('/app/purchases')
}
</script>

<style scoped>
:deep(.smart-search-grid th.text-right),
:deep(.smart-search-grid td.text-right),
:deep(.smart-search-dropdown .text-right),
:deep(table td:nth-child(2)) {
  text-align: right !important;
}
</style>
