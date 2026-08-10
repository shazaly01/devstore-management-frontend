<!--src\views\sales\components\SaleItemsTable.vue--->
<script setup>
import { computed, watch } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import { useCustomerStore } from '@/stores/customerStore'

import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'
import InvoiceDetailTable from '@/components/ui/dynamic-invoice/InvoiceDetailTable.vue'

const props = defineProps({
  items: { type: Array, required: true },
  form: { type: Object, required: true },
  visibleTableSchema: { type: Array, required: true },
  getValidationError: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  unformatNumber: { type: Function, required: true },
  removeRow: { type: Function, required: true },
  triggerAddNewEmptyLine: { type: Function, required: true },
  handleGlobalItemSelect: { type: Function, required: true },
  isFormLoaded: { type: Boolean, default: false },
})

const itemStore = useItemStore()
const customerStore = useCustomerStore()

const searchableItems = computed(() => {
  if (!itemStore.items) return []
  return itemStore.items.map((item) => {
    // تجميع واستخرج كافة الباركودات المرتبطة بالصنف المباشرة وتلك التابعة لوحداته
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

// مراقبة مستودع الفاتورة لجلب وتحديث المخزون بشكل لحظي لأسطر الجدول مع التفعيل الفوري عند التحميل الأول
watch(
  () => props.form.store_id,
  async (newStoreId) => {
    if (!newStoreId) {
      itemStore.items = []
      return
    }

    await itemStore.fetchItems(1, { is_active: 1, store_id: newStoreId, all: true })

    const activeItemIds = props.items.map((row) => row.item_id).filter((id) => id)

    if (activeItemIds.length > 0) {
      try {
        const stockMap = await itemStore.refreshItemsStock({
          store_id: newStoreId,
          item_ids: activeItemIds,
        })

        props.items.forEach((row) => {
          if (row.item_id && stockMap[row.item_id] !== undefined) {
            row.base_stock = parseFloat(stockMap[row.item_id]) || 0
          } else if (row.item_id) {
            row.base_stock = 0
          }
        })
      } catch (err) {
        console.error('فشل في مزامنة الأسطر الحالية مع جرد المستودع الجديد:', err)
      }
    }
  },
  { immediate: true },
)

// مراقبة تغيير العميل لإعادة حساب أسعار الأسطر الحالية وفقاً لفئته السعرية فوراً
watch(
  () => props.form.customer_id,
  () => {
    if (!props.isFormLoaded) return

    props.items?.forEach((row) => {
      if (row.item_id && row.item_unit_id) {
        syncUnitSalePrice(row)
      }
    })
  },
)

// تحديث دالة إدخال السعر اليدوي لتفعيل علم التجاوز
const handleUnitPriceInput = (row, value) => {
  row.unit_price = props.unformatNumber(value)
  row.is_price_overridden = true
}

// تحديث دالة حساب السعر لتعتمد على الفئة السعرية القياسية
const syncUnitSalePrice = (row) => {
  if (row.is_price_overridden) {
    return
  }

  const matchedUnit = row.available_units?.find((u) => u.id === row.item_unit_id)

  if (matchedUnit) {
    const currentCustomer = customerStore.customers?.find((c) => c.id === props.form.customer_id)
    const priceListId = currentCustomer ? currentCustomer.price_list_id : null

    const matchedPriceEntry =
      priceListId && matchedUnit.prices
        ? matchedUnit.prices.find((p) => p.price_list_id === priceListId)
        : null

    if (
      matchedPriceEntry &&
      matchedPriceEntry.price !== null &&
      matchedPriceEntry.price !== undefined
    ) {
      row.unit_price = matchedPriceEntry.price
    } else {
      row.unit_price = matchedUnit.price || 0
    }
  }
}
</script>

<template>
  <div class="p-0 bg-transparent space-y-4">
    <div
      class="w-full text-xs bg-[#e05e2b] p-1 rounded-lg shadow-[0_0_15px_rgba(224,94,43,0.25)] border border-[#e05e2b]"
    >
      <SmartSearchGrid
        :data="searchableItems"
        :columns="[
          { key: 'id_display', label: 'رقم الصنف', class: 'text-right' },
          { key: 'name', label: 'اسم الصنف التجاري المعتمد', class: 'text-right font-bold' },
          { key: 'price_display', label: 'السعر الافتراضي', class: 'text-center' },
          { key: 'stock_display', label: 'الكمية المتاحة حالياً', class: 'text-center' },
        ]"
        :search-keys="['id', 'name', 'code', 'all_barcodes']"
        placeholder="اكتب اسم المنتج أو رقم الصنف للمزامنة اللحظية الفورية للمبيعات..."
        @select="handleGlobalItemSelect"
      />
    </div>

    <p
      v-if="getValidationError('items')"
      class="p-2 bg-rose-950/40 text-rose-400 rounded-lg text-xs font-bold border border-rose-900/50"
    >
      {{ getValidationError('items') }}
    </p>

    <InvoiceDetailTable
      :items="items"
      :schema="visibleTableSchema"
      @remove-row="removeRow"
      @add-row-request="triggerAddNewEmptyLine"
    >
      <template #cell-item_unit_id="{ row, index }">
        <div class="flex flex-col w-full">
          <select
            v-model="row.item_unit_id"
            @change="syncUnitSalePrice(row)"
            :disabled="!row.available_units || row.available_units.length === 0"
            style="color-scheme: dark"
            class="w-full p-1 bg-transparent text-white border border-transparent hover:border-gray-500 focus:border-[#e05e2b] rounded-md text-xs font-bold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-right appearance-none"
          >
            <option value="" class="bg-[#16171b] text-gray-400">اختر الوحدة...</option>
            <option
              v-for="u in row.available_units"
              :key="u.id"
              :value="u.id"
              class="bg-[#16171b] text-white"
            >
              {{ u.unit_name || 'وحدة مجهولة' }}
            </option>
          </select>
          <p
            v-if="getValidationError(`items.${index}.item_unit_id`)"
            class="text-rose-500 text-[9px] font-bold mt-0.5"
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
            class="w-full p-1 bg-transparent border-none text-white font-bold text-xs focus:outline-none text-center font-mono transition-all focus:bg-[#16171b]/40 focus:rounded"
            placeholder="0"
          />
        </div>
      </template>

      <template #cell-unit_price="{ row }">
        <div class="w-full flex justify-center items-center">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.unit_price)"
            @input="handleUnitPriceInput(row, $event.target.value)"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded transition-all text-xs text-center font-mono text-white font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
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
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] rounded text-xs text-center font-mono text-white font-bold opacity-90 cursor-default"
            placeholder="0"
          />
        </div>
      </template>
    </InvoiceDetailTable>
  </div>
</template>
