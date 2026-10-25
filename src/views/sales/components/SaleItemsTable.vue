<!--src/views/sales/components/SaleItemsTable.vue-->
<script setup>
import { ref, computed, watch, nextTick } from 'vue'
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

const searchGridRef = ref(null)
const tableWrapperRef = ref(null)

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

const handleUnitPriceInput = (row, value) => {
  row.unit_price = props.unformatNumber(value)
  row.is_price_overridden = true
}

const getMinAllowedPrice = (row) => {
  if (!row.available_units || !row.item_unit_id) return 0
  const matchedUnit = row.available_units.find((u) => u.id === row.item_unit_id)
  return matchedUnit && matchedUnit.min_allowed_price !== undefined
    ? Number(matchedUnit.min_allowed_price) || 0
    : 0
}

const isPriceBelowMin = (row) => {
  if (props.form?.invoice_type === 'return') return false
  const minPrice = getMinAllowedPrice(row)
  if (minPrice <= 0) return false
  const currentPrice = Number(row.unit_price) || 0
  return currentPrice < minPrice
}

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

const focusUnitPrice = (rowIndex) => {
  nextTick(() => {
    const selector = `input[data-row="${rowIndex}"][data-col="unit_price"]`
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

const onItemSelected = (selectedItem) => {
  props.handleGlobalItemSelect(selectedItem)

  nextTick(() => {
    const defaultUnitId = selectedItem.units?.[0]?.id || ''
    let targetIndex = props.items.findIndex((row) => {
      if (row.item_id !== selectedItem.id) return false
      if (defaultUnitId) return row.item_unit_id === defaultUnitId
      return true
    })

    if (targetIndex === -1) {
      targetIndex = props.items.length - 1
    }

    if (targetIndex >= 0) {
      focusQuantity(targetIndex)
    }
  })
}

const onQuantityEnter = () => {
  searchGridRef.value?.focus()
}

const onUnitPriceEnter = () => {
  searchGridRef.value?.focus()
}
</script>

<template>
  <div ref="tableWrapperRef" class="p-0 bg-transparent space-y-4">
    <!-- حاوية البحث الذكي -->
    <div
      class="w-full text-xs bg-primary p-1 rounded-xl shadow-md shadow-primary/20 border border-primary transition-all duration-200"
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
        placeholder="اكتب اسم المنتج أو رقم الصنف للمزامنة اللحظية الفورية للمبيعات..."
        @select="onItemSelected"
      />
    </div>

    <!-- رسائل التحقق -->
    <p
      v-if="getValidationError('items')"
      class="p-2.5 bg-danger/10 text-danger border border-danger/30 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ getValidationError('items') }}
    </p>

    <!-- جدول التفاصيل -->
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
            @keydown.arrow-left.prevent="focusUnitPrice(index)"
            class="w-full p-1 bg-transparent border-none text-text-primary font-bold text-xs focus:outline-none text-center font-mono transition-all focus:bg-surface-ground focus:rounded"
            placeholder="0"
          />
        </div>
      </template>

      <template #cell-unit_price="{ row, index }">
        <div class="w-full flex flex-col justify-center items-center">
          <input
            type="text"
            inputmode="decimal"
            :data-row="index"
            data-col="unit_price"
            :value="formatNumber(row.unit_price)"
            @input="handleUnitPriceInput(row, $event.target.value)"
            @keydown.enter.prevent="onUnitPriceEnter"
            @keydown.arrow-right.prevent="focusQuantity(index)"
            :class="[
              'w-full p-1 rounded transition-all text-xs text-center font-mono font-bold outline-none',
              isPriceBelowMin(row)
                ? 'bg-danger/10 text-danger border border-danger/40 focus:border-danger focus:ring-1 focus:ring-danger/40 shadow-sm'
                : 'bg-surface-ground border border-surface-border hover:border-primary/50 focus:border-primary focus:bg-surface-section text-text-primary focus:ring-1 focus:ring-primary/25',
            ]"
            placeholder="0"
          />
          <span
            v-if="isPriceBelowMin(row)"
            class="text-[9px] text-danger font-bold mt-0.5 whitespace-nowrap animate-pulse"
          >
            الأدنى: {{ formatNumber(getMinAllowedPrice(row)) }}
          </span>
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
</template>
