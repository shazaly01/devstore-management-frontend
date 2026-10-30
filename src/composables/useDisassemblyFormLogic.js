import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisassemblyStore } from '@/stores/disassemblyStore'
import { useItemStore } from '@/stores/itemStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

export function useDisassemblyFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const disassemblyStore = useDisassemblyStore()
  const itemStore = useItemStore()
  const authStore = useAuthStore()

  const isEdit = computed(() => Boolean(route.params.id))
  const isFormLoaded = ref(false)

  // رأس مستند التفكيك
  const form = ref({
    disassembly_date: new Date().toISOString().substring(0, 10),
    store_id: '',
    source_item_id: '',
    source_item_unit_id: '',
    source_quantity: 0,
    source_unit_cost: 0,
    source_total_cost: 0,
    waste_quantity: 0,
    notes: '',
  })

  // أسطر الأجزاء الناتجة
  const items = ref([])

  // إنشاء هيكل سطر ناتج فارغ
  const createEmptyRow = () => ({
    item_id: null,
    item_name: '',
    item_unit_id: null,
    available_units: [],
    quantity: 1,
    expected_unit_price: 0,
    cost_percentage: 0,
    unit_cost: 0,
    total_cost: 0,
    notes: '',
  })

  // استخراج معامل تحويل الوحدة
  const getUnitFactor = (units, unitId) => {
    if (!units || !unitId) return 1
    const matched = units.find((u) => u.id === unitId)
    return Number(matched?.conversion_factor) || 1
  }

  // مراقبة تغيير المستودع لجلب الأصناف ومزامنة الأرصدة اللحظية
  watch(
    () => form.value.store_id,
    async (newStoreId) => {
      if (!newStoreId) {
        itemStore.items = []
        return
      }

      await itemStore.fetchItems(1, { is_active: 1, store_id: newStoreId, all: true })

      if (form.value.source_item_id) {
        syncSourceItemDetails()
      }

      items.value.forEach((row) => {
        if (row.item_id) {
          const matchedItem = itemStore.items?.find((it) => it.id === row.item_id)
          if (matchedItem) {
            row.available_units = matchedItem.units || []
          }
        }
      })
    },
    { immediate: true },
  )

  // مزامنة تكلفة ووحدات الصنف الخام المصروف
  const syncSourceItemDetails = () => {
    if (!form.value.source_item_id || !itemStore.items) {
      form.value.source_unit_cost = 0
      form.value.source_total_cost = 0
      return
    }

    const matchedSourceItem = itemStore.items.find((it) => it.id === form.value.source_item_id)
    if (!matchedSourceItem) return

    if (!form.value.source_item_unit_id && matchedSourceItem.units?.length > 0) {
      form.value.source_item_unit_id = matchedSourceItem.units[0].id
    }

    const matchedUnit = matchedSourceItem.units?.find(
      (u) => u.id === form.value.source_item_unit_id,
    )

    const baseUnitRow = matchedSourceItem.units?.find(
      (u) => u.unit_id === matchedSourceItem.base_unit_id,
    )
    const baseCost = baseUnitRow ? Number(baseUnitRow.cost) || 0 : Number(matchedUnit?.cost) || 0
    const factor = matchedUnit ? Number(matchedUnit.conversion_factor) || 1 : 1

    form.value.source_unit_cost = Number((baseCost * factor).toFixed(4))
    calculateSourceTotalCost()
  }

  const calculateSourceTotalCost = () => {
    const qty = Number(form.value.source_quantity) || 0
    const cost = Number(form.value.source_unit_cost) || 0
    form.value.source_total_cost = Number((qty * cost).toFixed(4))
    recalculateOutputCosts()
  }

  watch(
    () => form.value.source_item_id,
    () => {
      syncSourceItemDetails()
    },
  )

  watch(
    () => form.value.source_item_unit_id,
    () => {
      syncSourceItemDetails()
    },
  )

  watch(
    () => form.value.source_quantity,
    () => {
      calculateSourceTotalCost()
    },
  )

  watch(
    () => form.value.source_unit_cost,
    () => {
      calculateSourceTotalCost()
    },
  )

  // قائمة وحدات الصنف الخام المتاحة
  const sourceAvailableUnits = computed(() => {
    if (!form.value.source_item_id || !itemStore.items) return []
    const matched = itemStore.items.find((it) => it.id === form.value.source_item_id)
    return matched?.units || []
  })

  // رصيد الصنف الخام المتاح في المستودع بالوحدة المختارة
  const sourceAvailableStock = computed(() => {
    if (!form.value.source_item_id || !itemStore.items) return 0
    const matched = itemStore.items.find((it) => it.id === form.value.source_item_id)
    if (!matched) return 0
    const baseStock = Number(matched.current_stock ?? matched.stock ?? 0)
    const factor = getUnitFactor(sourceAvailableUnits.value, form.value.source_item_unit_id)
    return Number((baseStock / factor).toFixed(2))
  })

  // كمية الخام المحولة لوحدة الأساس لضبط ميزان الأوزان
  const sourceBaseQuantity = computed(() => {
    const qty = Number(form.value.source_quantity) || 0
    const factor = getUnitFactor(sourceAvailableUnits.value, form.value.source_item_unit_id)
    return Number((qty * factor).toFixed(4))
  })

  // ميزان الأوزان الإحصائي الموحد
  const totalOutputsWeight = computed(() => {
    return Number(
      items.value
        .reduce((sum, row) => {
          if (!row.item_id) return sum
          const q = Number(row.quantity) || 0
          const factor = getUnitFactor(row.available_units, row.item_unit_id)
          return sum + q * factor
        }, 0)
        .toFixed(4),
    )
  })

  const totalConsumedWeight = computed(() => {
    return Number((totalOutputsWeight.value + (Number(form.value.waste_quantity) || 0)).toFixed(4))
  })

  const weightDifference = computed(() => {
    return Number((sourceBaseQuantity.value - totalConsumedWeight.value).toFixed(4))
  })

  // محرك التوزيع الرياضي لتكاليف الأجزاء الناتجة لحظة بلحظة
  const recalculateOutputCosts = () => {
    const validRows = items.value.filter((r) => r.item_id && Number(r.quantity) > 0)
    if (validRows.length === 0) {
      items.value.forEach((r) => {
        r.cost_percentage = 0
        r.unit_cost = 0
        r.total_cost = 0
      })
      return
    }

    const sourceTotalCost = Number(form.value.source_total_cost) || 0

    let totalSalesValue = 0
    let totalOutputQty = 0

    validRows.forEach((row) => {
      const q = Number(row.quantity) || 0
      const p = Number(row.expected_unit_price) || 0
      totalSalesValue += q * p
      totalOutputQty += q
    })

    let accumulatedAllocatedCost = 0
    const count = validRows.length

    validRows.forEach((row, index) => {
      const q = Number(row.quantity) || 0
      const p = Number(row.expected_unit_price) || 0
      let percentage = 0

      if (totalSalesValue > 0) {
        percentage = ((q * p) / totalSalesValue) * 100
      } else if (totalOutputQty > 0) {
        percentage = (q / totalOutputQty) * 100
      } else {
        percentage = 100 / count
      }

      row.cost_percentage = Number(percentage.toFixed(4))

      let lineTotalCost = 0
      let unitCost = 0

      if (index < count - 1) {
        lineTotalCost = Number(((percentage / 100) * sourceTotalCost).toFixed(4))
        unitCost = q > 0 ? Number((lineTotalCost / q).toFixed(4)) : 0
        accumulatedAllocatedCost += lineTotalCost
      } else {
        lineTotalCost = Number(Math.max(0, sourceTotalCost - accumulatedAllocatedCost).toFixed(4))
        unitCost = q > 0 ? Number((lineTotalCost / q).toFixed(4)) : 0
      }

      row.total_cost = lineTotalCost
      row.unit_cost = unitCost
    })
  }

  // تسكين صنف مختار داخل سطر محدد في الجدول (سواء من البحث المباشر أو الباركود)
  const selectItemForRow = (row, selectedItem, currentRowIndex = null) => {
    if (!selectedItem) return false

    if (selectedItem.id === form.value.source_item_id) {
      toast.warning('لا يمكن اختيار الصنف الخام نفسه كأحد الأجزاء الناتجة.')
      return false
    }

    const existingIndex = items.value.findIndex(
      (it, idx) =>
        it.item_id === selectedItem.id &&
        (currentRowIndex !== null ? idx !== currentRowIndex : it !== row),
    )

    if (existingIndex !== -1) {
      toast.warning(`الصنف "${selectedItem.name}" مضاف مسبقاً في السطر رقم (${existingIndex + 1}).`)
      return false
    }

    const defaultUnit = selectedItem.units?.[0] || null
    const defaultPrice = defaultUnit ? Number(defaultUnit.price) || 0 : 0

    row.item_id = selectedItem.id
    row.item_name = selectedItem.name || ''
    row.available_units = selectedItem.units || []
    row.item_unit_id = defaultUnit?.id || null
    row.expected_unit_price = defaultPrice

    if (!row.quantity || Number(row.quantity) <= 0) {
      row.quantity = 1
    }

    recalculateOutputCosts()
    return true
  }

  // إضافة سطر جديد فارغ
  const addEmptyRow = () => {
    items.value.push(createEmptyRow())
  }

  // حذف سطر محدد
  const removeRow = (index) => {
    if (items.value.length === 1) {
      items.value[0] = createEmptyRow()
    } else {
      items.value.splice(index, 1)
    }
    recalculateOutputCosts()
  }

  // اختيار صنف من محرك البحث الشبكي العلوي (SmartSearchGrid)
  const handleItemSelect = (selectedItem) => {
    if (!selectedItem) return

    let targetRow = items.value[items.value.length - 1]
    if (!targetRow || targetRow.item_id) {
      targetRow = createEmptyRow()
      items.value.push(targetRow)
    }

    const targetIndex = items.value.indexOf(targetRow)
    selectItemForRow(targetRow, selectedItem, targetIndex)
  }

  // عند تغيير وحدة الصنف الناتج
  const handleOutputUnitChange = (row) => {
    const matchedUnit = row.available_units?.find((u) => u.id === row.item_unit_id)
    if (matchedUnit) {
      row.expected_unit_price = Number(matchedUnit.price) || 0
      recalculateOutputCosts()
    }
  }

  // ميزان التكاليف الإحصائي
  const totalAllocatedCost = computed(() => {
    return Number(
      items.value.reduce((sum, row) => sum + (Number(row.total_cost) || 0), 0).toFixed(4),
    )
  })

  const costDifference = computed(() => {
    const srcCost = Number(form.value.source_total_cost) || 0
    return Number((srcCost - totalAllocatedCost.value).toFixed(4))
  })

  // تحميل البيانات الأولية أو بيانات إذن قائم للتعديل
  onMounted(async () => {
    if (isEdit.value) {
      await disassemblyStore.fetchDisassembly(route.params.id)
      if (disassemblyStore.currentDisassembly) {
        const cur = disassemblyStore.currentDisassembly

        form.value = {
          disassembly_date: cur.disassembly_date,
          store_id: cur.store_id,
          source_item_id: cur.source_item_id,
          source_item_unit_id: cur.source_item_unit_id,
          source_quantity: Number(cur.source_quantity),
          source_unit_cost: Number(cur.source_unit_cost),
          source_total_cost: Number(cur.source_total_cost),
          waste_quantity: Number(cur.waste_quantity || 0),
          notes: cur.notes || '',
        }

        if (cur.store_id) {
          await itemStore.fetchItems(1, { is_active: 1, store_id: cur.store_id, all: true })
        }

        items.value = (cur.items || []).map((it) => {
          const matchedItem = itemStore.items?.find((item) => item.id === it.item_id)
          return {
            item_id: it.item_id,
            item_name: it.item_name || matchedItem?.name || '',
            item_unit_id: it.item_unit_id,
            available_units: matchedItem?.units || [],
            quantity: Number(it.quantity),
            expected_unit_price: Number(it.expected_unit_price),
            cost_percentage: Number(it.cost_percentage),
            unit_cost: Number(it.unit_cost),
            total_cost: Number(it.total_cost),
            notes: it.notes || '',
          }
        })

        if (items.value.length === 0) {
          items.value = [createEmptyRow()]
        }
      }
    } else {
      if (authStore.user?.store_id) {
        form.value.store_id = authStore.user.store_id
      }
      items.value = [createEmptyRow()]
    }

    isFormLoaded.value = true
  })

  // اعتماد وحفظ النموذج
  const handleSubmit = async () => {
    if (!form.value.store_id) {
      toast.error('يرجى اختيار المستودع أولاً.')
      return
    }

    if (!form.value.source_item_id || !form.value.source_item_unit_id) {
      toast.error('يرجى اختيار الصنف الخام المصروف ووحدته.')
      return
    }

    if (Number(form.value.source_quantity) <= 0) {
      toast.error('يرجى إدخال كمية موجبة للصنف الخام.')
      return
    }

    const validItems = items.value.filter(
      (r) => r.item_id && r.item_unit_id && Number(r.quantity) > 0,
    )

    if (validItems.length === 0) {
      toast.error('يجب إضافة صنف ناتج واحد على الأقل مع تحديد وزنه ووحدته.')
      return
    }

    const payload = {
      ...form.value,
      source_quantity: Number(form.value.source_quantity),
      source_unit_cost: Number(form.value.source_unit_cost || 0),
      source_total_cost: Number(form.value.source_total_cost || 0),
      waste_quantity: Number(form.value.waste_quantity || 0),
      items: validItems.map((r) => ({
        item_id: r.item_id,
        item_unit_id: r.item_unit_id,
        quantity: Number(r.quantity),
        expected_unit_price: Number(r.expected_unit_price || 0),
        unit_cost: Number(r.unit_cost || 0),
        notes: r.notes || null,
      })),
    }

    try {
      if (isEdit.value) {
        await disassemblyStore.updateDisassembly(route.params.id, payload)
        toast.success('تم تعديل إذن التفكيك وإعادة توازن المخازن والتكاليف بنجاح.')
      } else {
        await disassemblyStore.createDisassembly(payload)
        toast.success('تم ترحيل إذن التفكيك وصرف الخام وتوريد الأجزاء الناتجة بنجاح.')
      }
      router.push('/app/disassemblies')
    } catch {
      const errorMsg = disassemblyStore.error || 'فشلت عملية الحفظ، تحقق من صحة المدخلات والأرصدة.'
      toast.error(errorMsg)
    }
  }

  const handleCancel = () => {
    router.push('/app/disassemblies')
  }

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0.00'
    const num = Number(value)
    if (isNaN(num)) return '0.00'
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num)
  }

  const getValidationError = (path) => {
    return disassemblyStore.validationErrors?.[path]?.[0] || null
  }

  return {
    isEdit,
    isFormLoaded,
    form,
    items,
    sourceAvailableUnits,
    sourceAvailableStock,
    sourceBaseQuantity,
    totalOutputsWeight,
    totalConsumedWeight,
    weightDifference,
    totalAllocatedCost,
    costDifference,
    disassemblyStore,
    itemStore,
    createEmptyRow,
    addEmptyRow,
    removeRow,
    selectItemForRow,
    handleItemSelect,
    handleOutputUnitChange,
    recalculateOutputCosts,
    handleSubmit,
    handleCancel,
    formatNumber,
    getValidationError,
  }
}
