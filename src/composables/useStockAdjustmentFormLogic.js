// src/composables/useStockAdjustmentFormLogic.js
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStockAdjustmentStore } from '@/stores/stockAdjustmentStore'
import { useStoreStore } from '@/stores/storeStore'
import { useItemStore } from '@/stores/itemStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
import { useToast } from 'vue-toastification'

export function useStockAdjustmentFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const stockAdjustmentStore = useStockAdjustmentStore()
  const storeStore = useStoreStore()
  const itemStore = useItemStore()

  const isEdit = computed(() => !!route.params.id)
  const isHydrating = ref(false)
  const isFormLoaded = ref(false)

  const form = ref({
    store_id: '',
    adjustment_date: new Date().toISOString().substr(0, 10),
    notes: '',
  })

  const items = ref([])

  const detailSchema = [
    {
      key: 'item_id_display',
      label: 'رقم الصنف',
      widthClass: 'w-1/12',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => (item.id ? `PRD-${item.id}` : ''),
    },
    {
      key: 'item_name',
      label: 'اسم الصنف التجاري المعتمد',
      widthClass: 'w-1/4',
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
      label: 'وحدة الجرد',
      slot: 'cell-item_unit_id',
      widthClass: 'w-1/6',
      type: 'text',
      extractFromItem: (item) => item.units?.[0]?.id || '',
    },
    {
      key: 'base_stock',
      extractFromItem: (item) => parseFloat(item.current_stock) || 0,
    },
    {
      key: 'book_quantity',
      label: 'الكمية الدفترية',
      type: 'calculated',
      readonly: true,
      widthClass: 'w-1/12',
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
      key: 'physical_quantity',
      label: 'الكمية الفعلية الجردية',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-1/12',
    },
    {
      key: 'quantity_difference',
      label: 'الفارق الجردي الكمي',
      type: 'calculated',
      readonly: true,
      summary: false,
      slot: 'cell-quantity_difference',
      widthClass: 'w-1/6',
      formula: (row) => {
        const physical = parseFloat(row.physical_quantity) || 0
        const book = parseFloat(row.book_quantity) || 0
        return parseFloat((physical - book).toFixed(2))
      },
    },
    {
      key: 'unit_cost',
      label: 'تكلفة الوحدة',
      type: 'number',
      readonly: true,
      widthClass: 'w-1/12',
      extractFromItem: (item) => item.units?.[0]?.cost || 0,
    },
  ]

  const visibleTableSchema = computed(() => detailSchema.filter((col) => col.label))

  const { createEmptyRow, handleItemSelected, removeRow } = useDynamicDetails(items, detailSchema, {
    uniqueKeys: ['item_id', 'item_unit_id'],
    mergeQtyKey: null,
  })

  const totalShortageValue = computed(() => {
    return items.value.reduce((sum, row) => {
      const diff = parseFloat(row.quantity_difference) || 0
      const cost = parseFloat(row.unit_cost) || 0
      return diff < 0 ? sum + Math.abs(diff * cost) : sum
    }, 0)
  })

  const totalSurplusValue = computed(() => {
    return items.value.reduce((sum, row) => {
      const diff = parseFloat(row.quantity_difference) || 0
      const cost = parseFloat(row.unit_cost) || 0
      return diff > 0 ? sum + diff * cost : sum
    }, 0)
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
          console.error('فشل في إعادة توازن الأرصدة الدفترية اللحظية للمستودع الجديد:', err)
        }
      }
    },
  )

  const handleGlobalItemSelect = (selectedItem) => {
    if (!selectedItem) return
    if (!form.value.store_id) {
      toast.warning('عفواً، يجب تحديد مستودع الجرد والتسوية أولاً لشحن الأرصدة الدفترية.')
      return
    }
    handleItemSelected(selectedItem)
  }

  const triggerAddNewEmptyLine = () => {
    items.value.push(createEmptyRow())
  }

  const syncUnitCostAndFields = (row) => {
    const matchedUnit = row.available_units?.find((u) => String(u.id) === String(row.item_unit_id))
    if (matchedUnit) {
      row.unit_cost = matchedUnit.cost || 0
    }
  }

  const getValidationError = (path) => {
    return stockAdjustmentStore.validationErrors?.[path]?.[0] || null
  }

  onMounted(async () => {
    if (isEdit.value) {
      isHydrating.value = true
      await stockAdjustmentStore.fetchStockAdjustment(route.params.id)
      if (stockAdjustmentStore.currentStockAdjustment) {
        const cur = stockAdjustmentStore.currentStockAdjustment

        items.value = cur.items.map((it) => ({
          item_id_display: it.item_id ? `PRD-${it.item_id}` : '',
          item_name: it.item_name || '',
          item_id: it.item_id,
          item_unit_id: it.item_unit_id,
          book_quantity: parseFloat(it.book_quantity) || 0,
          physical_quantity: parseFloat(it.physical_quantity) || 0,
          quantity_difference: parseFloat(it.quantity_difference) || 0,
          unit_cost: parseFloat(it.unit_cost) || 0,
          available_units: it.available_units || [],
          base_stock: parseFloat(it.current_stock) || 0,
          available_stock: 0,
          _flashing: false,
        }))

        form.value = {
          store_id: cur.store_id,
          adjustment_date: cur.adjustment_date.substr(0, 10),
          notes: cur.notes || '',
        }

        if (cur.store_id) {
          await itemStore.fetchItems(1, { is_active: 1, store_id: cur.store_id, all: true })
        }
      }
      isHydrating.value = false
    } else {
      if (items.value.length === 0) {
        triggerAddNewEmptyLine()
      }
    }

    isFormLoaded.value = true
  })

  const handleSubmit = async () => {
    const dynamicItemsPayload = items.value
      .filter((row) => row.item_id && row.item_unit_id)
      .map((row) => ({
        item_id: row.item_id,
        item_unit_id: row.item_unit_id,
        book_quantity: parseFloat(row.book_quantity) || 0,
        physical_quantity: parseFloat(row.physical_quantity) || 0,
        quantity_difference: parseFloat(row.quantity_difference) || 0,
        unit_cost: parseFloat(row.unit_cost) || 0,
      }))

    const finalPayload = {
      ...form.value,
      items: dynamicItemsPayload,
    }

    try {
      if (isEdit.value) {
        await stockAdjustmentStore.updateStockAdjustment(route.params.id, finalPayload)
        toast.success('تم تحديث ومزامنة الفروقات والمستند الجردي بنجاح.')
      } else {
        await stockAdjustmentStore.createStockAdjustment(finalPayload)
        toast.success('تم ترحيل مستند التسوية الجردية وتحديث أرصدة الحسابات بنجاح.')
      }
      router.push('/app/stock-adjustments')
    } catch {
      toast.error('فشلت عملية ترحيل التسوية، يرجى مراجعة قيم بنود الفحص.')
    }
  }

  const handleCancel = () => {
    router.push('/app/stock-adjustments')
  }

  return {
    isEdit,
    isHydrating,
    isFormLoaded,
    form,
    items,
    detailSchema,
    visibleTableSchema,
    totalShortageValue,
    totalSurplusValue,
    getValidationError,
    handleSubmit,
    handleCancel,
    removeRow,
    triggerAddNewEmptyLine,
    handleGlobalItemSelect,
    syncUnitCostAndFields,
    stockAdjustmentStore,
    storeStore,
    itemStore,
  }
}
