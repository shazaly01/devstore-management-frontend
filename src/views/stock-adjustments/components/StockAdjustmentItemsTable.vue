<!--src/views/stock-adjustments/components/StockAdjustmentItemsTable.vue-->
<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import { useToast } from 'vue-toastification'

const props = defineProps({
  items: { type: Array, required: true },
  form: { type: Object, required: true },
  visibleTableSchema: { type: Array, default: () => [] },
  getValidationError: { type: Function, required: true },
  removeRow: { type: Function, required: true },
  triggerAddNewEmptyLine: { type: Function, required: true },
  handleGlobalItemSelect: { type: Function, default: () => {} },
  syncUnitCostAndFields: { type: Function, required: true },
})

const itemStore = useItemStore()
const toast = useToast()

const tableWrapperRef = ref(null)

// ----------------------------------------------------
// 1. تجهيز بيانات الأصناف للبحث والمسح الفوري
// ----------------------------------------------------
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
      stock_display: item.current_stock !== undefined ? `${item.current_stock}` : '0',
      all_barcodes: allBarcodes,
    }
  })
})

const formatSmartNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  }).format(num)
}

const getRowBookQty = (row) => {
  if (row.base_stock === null || row.base_stock === undefined) return 0
  const matchedUnit = row.available_units?.find((u) => String(u.id) === String(row.item_unit_id))
  const factor = matchedUnit ? parseFloat(matchedUnit.conversion_factor) || 1 : 1
  return parseFloat((row.base_stock / factor).toFixed(2))
}

const updateRowDifferences = (row) => {
  row.book_quantity = getRowBookQty(row)
  const physical = parseFloat(row.physical_quantity) || 0
  const book = parseFloat(row.book_quantity) || 0
  row.quantity_difference = parseFloat((physical - book).toFixed(2))
}

// ----------------------------------------------------
// 2. دوال وإجراءات البحث السطري والباركود السريع
// ----------------------------------------------------
const cellRefs = ref({})
const dropdownItemRefs = ref([])
const modernColumnsOrder = ['name', 'unit', 'qty']
const activeTargetInput = ref(null)
const activeQtyIndex = ref(null)
const activeMultiplier = ref(1)
const isDropdownManuallyNavigated = ref(false)

const parseMultiplierQuery = (input) => {
  if (!input) return { multiplier: 1, cleanQuery: '' }
  const match = input.trim().match(/^(\d+(\.\d+)?)\s*[*xX×]\s*(.*)$/)
  if (match) {
    return {
      multiplier: parseFloat(match[1]) || 1,
      cleanQuery: match[3]?.trim() || '',
    }
  }
  return { multiplier: 1, cleanQuery: input.trim() }
}

const setCellRef = (el, rowIndex, colKey) => {
  if (!cellRefs.value[rowIndex]) {
    cellRefs.value[rowIndex] = {}
  }
  if (el) {
    cellRefs.value[rowIndex][colKey] = el
  }
}

const setDropdownItemRef = (el, index) => {
  if (el) {
    dropdownItemRefs.value[index] = el
  }
}

const focusModernCell = (rowIndex, colKey, shouldScroll = true) => {
  nextTick(() => {
    const target = cellRefs.value[rowIndex]?.[colKey]
    if (target) {
      target.focus()
      nextTick(() => {
        if (typeof target.select === 'function') {
          target.select()
        }
      })
      if (shouldScroll && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      }
    }
  })
}

const handleFieldFocus = (event) => {
  const el = event.target
  if (el) {
    if (typeof el.select === 'function') {
      el.select()
    }
    if (typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  }
}

const onNameInputFocus = (index, event) => {
  handleFieldFocus(event)
  openSearchDropdown(index, event)
}

const onModernQtyFocus = (index, event) => {
  activeQtyIndex.value = index
  nextTick(() => {
    handleFieldFocus(event)
  })
}

const getQtyDisplayValue = (row, index) => {
  if (activeQtyIndex.value === index) {
    return row.physical_quantity === null || row.physical_quantity === undefined
      ? ''
      : row.physical_quantity
  }
  return formatSmartNumber(row.physical_quantity)
}

const onModernQuantityChange = (row, event) => {
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.physical_quantity = val === '' ? 0 : Number(val)
  updateRowDifferences(row)
}

const isCursorAtStart = (el) => {
  if (!el || el.selectionStart === undefined) return true
  return el.selectionStart === 0
}

const isCursorAtEnd = (el) => {
  if (!el || el.selectionEnd === undefined) return true
  return el.selectionEnd >= el.value.length
}

const isTextFullySelected = (el) => {
  if (!el || el.selectionStart === undefined) return false
  return el.selectionStart === 0 && el.selectionEnd === el.value.length
}

const navigateModernHorizontal = (rowIndex, currentColKey, direction) => {
  const currentRow = props.items[rowIndex]
  if (currentRow && !currentRow.item_id && currentColKey === 'name') {
    if (direction < 0 && rowIndex > 0) {
      const prevRow = props.items[rowIndex - 1]
      focusModernCell(rowIndex - 1, prevRow?.item_id ? 'qty' : 'name', true)
    }
    return
  }

  const currentIdx = modernColumnsOrder.indexOf(currentColKey)
  const targetIdx = currentIdx + direction

  if (targetIdx >= 0 && targetIdx < modernColumnsOrder.length) {
    focusModernCell(rowIndex, modernColumnsOrder[targetIdx], true)
  } else if (targetIdx >= modernColumnsOrder.length) {
    if (rowIndex === props.items.length - 1) {
      handleAddNewLineWithFocus()
    } else {
      focusModernCell(rowIndex + 1, 'name', true)
    }
  } else if (targetIdx < 0 && rowIndex > 0) {
    const prevRow = props.items[rowIndex - 1]
    focusModernCell(rowIndex - 1, prevRow?.item_id ? 'qty' : 'name', true)
  }
}

const handleAddNewLineWithFocus = async () => {
  props.triggerAddNewEmptyLine()
  await nextTick()
  const newIndex = props.items.length - 1
  focusModernCell(newIndex, 'name', true)
}

const handleRemoveRowWithFocus = async (index) => {
  props.removeRow(index)
  await nextTick()
  const targetIndex = Math.max(0, Math.min(index, props.items.length - 1))
  focusModernCell(targetIndex, 'name', true)
}

const checkModernShortcuts = (event, index) => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    handleAddNewLineWithFocus()
    return true
  }

  if (
    (event.altKey && event.key === 'Delete') ||
    (event.ctrlKey && (event.key === 'Delete' || event.key === 'Backspace'))
  ) {
    event.preventDefault()
    handleRemoveRowWithFocus(index)
    return true
  }

  return false
}

// قائمة المقترحات الطافية الذكية
const activeDropdownIndex = ref(null)
const highlightedProductIndex = ref(0)
const searchResults = ref([])

const dropdownStyle = ref({
  top: 'auto',
  bottom: 'auto',
  right: '0px',
  width: '520px',
})

const updateDropdownPosition = (targetElement) => {
  if (!targetElement) return
  activeTargetInput.value = targetElement
  const rect = targetElement.getBoundingClientRect()
  const dropdownEstimatedHeight = 260
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  const shouldOpenUpwards = spaceBelow < dropdownEstimatedHeight && spaceAbove > spaceBelow

  const preferredWidth = Math.max(rect.width, 520)
  const maxWidth = Math.min(preferredWidth, window.innerWidth - 20)
  const rightOffset = Math.max(10, window.innerWidth - rect.right)

  if (shouldOpenUpwards) {
    dropdownStyle.value = {
      top: 'auto',
      bottom: `${window.innerHeight - rect.top + 4}px`,
      right: `${rightOffset}px`,
      width: `${maxWidth}px`,
    }
  } else {
    dropdownStyle.value = {
      top: `${rect.bottom + 4}px`,
      bottom: 'auto',
      right: `${rightOffset}px`,
      width: `${maxWidth}px`,
    }
  }
}

const scrollHighlightedDropdownItemIntoView = () => {
  nextTick(() => {
    const el = dropdownItemRefs.value[highlightedProductIndex.value]
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' })
    }
  })
}

const onDropdownItemHover = (pIndex) => {
  highlightedProductIndex.value = pIndex
  isDropdownManuallyNavigated.value = true
}

const executeFastSearch = (queryText, rowIndex, immediate = false) => {
  isDropdownManuallyNavigated.value = false
  const { multiplier, cleanQuery } = parseMultiplierQuery(queryText)
  activeMultiplier.value = multiplier
  const clean = cleanQuery ? cleanQuery.toLowerCase() : ''

  if (!clean) {
    searchResults.value = []
    return
  }

  const results = []
  for (const it of searchableItems.value) {
    const matchedBarcode = it.all_barcodes?.find((b) => b && b.toLowerCase() === clean)
    const isNameMatch = it.name && it.name.toLowerCase().includes(clean)
    const isIdMatch = `prd-${it.id}`.includes(clean) || String(it.id) === clean
    const isCodeMatch = it.code && it.code.toLowerCase().includes(clean)

    if (matchedBarcode) {
      results.unshift({ ...it, matched_barcode: matchedBarcode })
    } else if (isNameMatch || isIdMatch || isCodeMatch) {
      results.push(it)
    }

    if (results.length >= 10) break
  }

  const exactBarcodeMatch = results.find((r) => r.matched_barcode)
  if (immediate) {
    if (exactBarcodeMatch) {
      onSelectModernProduct(props.items[rowIndex], exactBarcodeMatch, rowIndex, multiplier, true)
      return
    }
    if (results.length === 1) {
      const isBarcodeMatch = Boolean(results[0].matched_barcode)
      onSelectModernProduct(props.items[rowIndex], results[0], rowIndex, multiplier, isBarcodeMatch)
      return
    }
  }

  searchResults.value = results
  highlightedProductIndex.value = 0
  dropdownItemRefs.value = []

  if (activeTargetInput.value) {
    updateDropdownPosition(activeTargetInput.value)
  }
}

const openSearchDropdown = (index, event) => {
  isDropdownManuallyNavigated.value = false
  activeDropdownIndex.value = index
  updateDropdownPosition(event.target)
  executeFastSearch(props.items[index]?.item_name || '', index, false)
}

const onItemNameInput = (row, index, event) => {
  isDropdownManuallyNavigated.value = false
  if (row.item_id) {
    row.item_id = null
    row.item_unit_id = null
    row.available_units = []
    row.book_quantity = 0
    row.physical_quantity = 0
    row.quantity_difference = 0
    row.unit_cost = 0
  }
  activeDropdownIndex.value = index
  updateDropdownPosition(event.target)
  executeFastSearch(row.item_name, index, false)
}

const closeSearchDropdownDelayed = () => {
  setTimeout(() => {
    activeDropdownIndex.value = null
    activeTargetInput.value = null
    searchResults.value = []
    isDropdownManuallyNavigated.value = false
  }, 200)
}

const triggerRowFeedback = (targetRow, withFlash = true) => {
  if (withFlash) {
    targetRow._flashing = false
    nextTick(() => {
      targetRow._flashing = true
    })
    setTimeout(() => {
      targetRow._flashing = false
    }, 800)
  }

  targetRow._popping = false
  nextTick(() => {
    targetRow._popping = true
  })
  setTimeout(() => {
    targetRow._popping = false
  }, 400)
}

const onSelectModernProduct = async (row, product, index, initialQty = 1, isBarcode = false) => {
  if (!row || props.items[index] !== row) return

  if (!props.form.store_id) {
    toast.warning('عفواً، يجب تحديد مستودع الجرد والتسوية أولاً لشحن الأرصدة الدفترية.')
    return
  }

  const defaultUnit = product.units?.[0] || null
  const defaultUnitId = defaultUnit?.id || ''
  const addQty = Number(initialQty) > 0 ? Number(initialQty) : 1

  // فحص ما إذا كان الصنف مضافاً مسبقاً بنفس الوحدة (زيادة الكمية الفعلية مع الوميض)
  const existingIndex = props.items.findIndex(
    (it, idx) =>
      idx !== index &&
      it.item_id === product.id &&
      String(it.item_unit_id) === String(defaultUnitId),
  )

  if (existingIndex !== -1) {
    const existingRow = props.items[existingIndex]
    existingRow.physical_quantity = (parseFloat(existingRow.physical_quantity) || 0) + addQty
    updateRowDifferences(existingRow)
    triggerRowFeedback(existingRow, true)

    // تصفير السطر الحالي ليبقى جاهزاً لقراءة الصنف التالي
    row.item_id = null
    row.item_id_display = ''
    row.item_name = ''
    row.available_units = []
    row.item_unit_id = null
    row.book_quantity = 0
    row.physical_quantity = 0
    row.quantity_difference = 0
    row.unit_cost = 0

    activeDropdownIndex.value = null
    activeTargetInput.value = null
    searchResults.value = []
    dropdownItemRefs.value = []
    activeMultiplier.value = 1
    isDropdownManuallyNavigated.value = false

    focusModernCell(index, 'name', true)
    return
  }

  // تسكين صنف جديد
  row.item_id = product.id
  row.item_id_display = `PRD-${product.id}`
  row.item_name = product.name || ''
  row.available_units = product.units || []
  row.item_unit_id = defaultUnitId
  row.base_stock = parseFloat(
    product.current_stock !== undefined
      ? product.current_stock
      : product.stock !== undefined
        ? product.stock
        : 0,
  )
  row.unit_cost = defaultUnit?.cost || 0
  row.physical_quantity = addQty
  updateRowDifferences(row)
  triggerRowFeedback(row, false)

  activeDropdownIndex.value = null
  activeTargetInput.value = null
  searchResults.value = []
  dropdownItemRefs.value = []
  activeMultiplier.value = 1
  isDropdownManuallyNavigated.value = false

  if (isBarcode) {
    const nextEmptyIndex = props.items.findIndex((r, idx) => idx > index && !r.item_id)
    if (nextEmptyIndex !== -1) {
      focusModernCell(nextEmptyIndex, 'name', true)
    } else {
      await handleAddNewLineWithFocus()
    }
  } else {
    focusModernCell(index, 'qty', true)
  }
}

const onModernUnitSelectChange = (row) => {
  props.syncUnitCostAndFields(row)
  updateRowDifferences(row)
}

// معالجات لوحة المفاتيح والأسهم
const handleModernNameKeydown = async (event, row, index) => {
  if (checkModernShortcuts(event, index)) return

  const isDropdownOpen = activeDropdownIndex.value === index && searchResults.value.length > 0

  if (isDropdownOpen) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      isDropdownManuallyNavigated.value = true
      highlightedProductIndex.value =
        (highlightedProductIndex.value + 1) % searchResults.value.length
      scrollHighlightedDropdownItemIntoView()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      isDropdownManuallyNavigated.value = true
      highlightedProductIndex.value =
        (highlightedProductIndex.value - 1 + searchResults.value.length) %
        searchResults.value.length
      scrollHighlightedDropdownItemIntoView()
      return
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      const selected = searchResults.value[highlightedProductIndex.value]
      if (selected) {
        const isBarcode = Boolean(selected.matched_barcode && !isDropdownManuallyNavigated.value)
        await onSelectModernProduct(row, selected, index, activeMultiplier.value, isBarcode)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      activeDropdownIndex.value = null
      searchResults.value = []
      isDropdownManuallyNavigated.value = false
      return
    }
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (!row.item_id && row.item_name && row.item_name.trim().length > 0) {
      executeFastSearch(row.item_name, index, true)
      return
    }
    activeDropdownIndex.value = null
    if (row.item_id) {
      focusModernCell(index, 'qty', true)
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeDropdownIndex.value = null
    if (index < props.items.length - 1) {
      focusModernCell(index + 1, 'name', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      activeDropdownIndex.value = null
      if (!row.item_name || row.item_name.trim() === '') {
        const prevRow = props.items[index - 1]
        focusModernCell(index - 1, prevRow?.item_id ? 'qty' : 'name', true)
      } else {
        focusModernCell(index - 1, 'name', true)
      }
    }
    return
  }

  if (event.key === 'ArrowLeft') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtEnd(el) || !row.item_name) {
      event.preventDefault()
      activeDropdownIndex.value = null
      navigateModernHorizontal(index, 'name', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      if (index > 0) {
        event.preventDefault()
        activeDropdownIndex.value = null
        navigateModernHorizontal(index, 'name', -1)
      }
    }
  }
}

const handleModernGenericKeydown = (event, row, index, colKey) => {
  if (checkModernShortcuts(event, index)) return

  if (event.key === 'Enter') {
    event.preventDefault()
    const currentIdx = modernColumnsOrder.indexOf(colKey)
    if (currentIdx < modernColumnsOrder.length - 1) {
      focusModernCell(index, modernColumnsOrder[currentIdx + 1], true)
    } else {
      if (index < props.items.length - 1) {
        focusModernCell(index + 1, 'name', true)
      } else {
        handleAddNewLineWithFocus()
      }
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      const nextRow = props.items[index + 1]
      focusModernCell(index + 1, nextRow?.item_id ? colKey : 'name', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      const prevRow = props.items[index - 1]
      focusModernCell(index - 1, prevRow?.item_id ? colKey : 'name', true)
    }
    return
  }

  const el = event.target
  if (event.key === 'ArrowLeft') {
    if (isTextFullySelected(el) || isCursorAtEnd(el) || el.tagName === 'SELECT') {
      event.preventDefault()
      navigateModernHorizontal(index, colKey, 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    if (isTextFullySelected(el) || isCursorAtStart(el) || el.tagName === 'SELECT') {
      event.preventDefault()
      navigateModernHorizontal(index, colKey, -1)
    }
  }
}

const handleScrollOrResize = () => {
  if (activeDropdownIndex.value !== null && activeTargetInput.value) {
    updateDropdownPosition(activeTargetInput.value)
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)

  if (props.items.length === 0) {
    props.triggerAddNewEmptyLine()
  }
  nextTick(() => {
    focusModernCell(0, 'name', true)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>

<template>
  <div ref="tableWrapperRef" class="p-0 bg-transparent space-y-2.5 font-sans text-right" dir="rtl">
    <!-- رسائل التحقق العامة للأصناف -->
    <p
      v-if="getValidationError('items')"
      class="p-2.5 bg-danger/10 text-danger rounded-lg text-xs font-bold border border-danger/30 shadow-sm"
    >
      {{ getValidationError('items') }}
    </p>

    <!-- منصة جدول الأصناف المجسّمة (3D Elevated Stage) -->
    <div
      class="invoice-stage-3d rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200"
    >
      <!-- مساحة الجدول بارتفاع متوازن يبرز الأصناف دون فراغ زائد -->
      <div class="overflow-x-auto min-h-[195px] flex flex-col justify-between">
        <table class="w-full border-collapse text-right text-xs">
          <thead class="invoice-thead-3d select-none h-11 tracking-tight">
            <tr>
              <th class="px-3 py-2.5 w-16 text-center text-slate-400 dark:text-slate-600 font-mono">
                #
              </th>
              <th
                class="px-3 py-2.5 min-w-[280px] text-right font-black text-white dark:text-slate-900 text-[13px]"
              >
                <span class="inline-flex items-center gap-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/25 inline-block"
                  ></span>
                  بيان الصنف أو مسح الباركود
                </span>
              </th>
              <th
                class="px-3 py-2.5 min-w-[130px] w-36 text-center font-bold text-slate-200 dark:text-slate-800"
              >
                وحدة الجرد
              </th>
              <th
                class="px-3 py-2.5 min-w-[115px] w-32 text-center font-bold text-slate-200 dark:text-slate-800"
              >
                الكمية الدفترية
              </th>
              <th
                class="px-3 py-2.5 min-w-[120px] w-32 text-center font-bold text-slate-200 dark:text-slate-800"
              >
                الكمية الفعلية
              </th>
              <th
                class="px-3 py-2.5 min-w-[140px] w-36 text-center font-black text-primary-light dark:text-primary-dark text-[13px]"
              >
                الفارق الجردي
              </th>
              <th
                class="px-3 py-2.5 min-w-[110px] w-28 text-center font-bold text-slate-300 dark:text-slate-700"
              >
                تكلفة الوحدة
              </th>
              <th class="px-3 py-2.5 w-14 text-center font-bold text-slate-400 dark:text-slate-600">
                إجراء
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-surface-border/70">
            <tr
              v-for="(row, index) in items"
              :key="index"
              class="invoice-row-3d animate-row-enter h-13"
              :class="[
                row.item_id ? 'invoice-row-filled' : 'invoice-row-empty',
                { 'animate-flash-merge': row._flashing },
              ]"
            >
              <!-- 1. التسلسل والشارة -->
              <td class="px-3 py-2 text-center font-mono align-middle">
                <div class="flex items-center justify-center gap-1.5">
                  <span
                    class="w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px]"
                    :class="
                      row.item_id
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-surface-ground text-text-muted border border-surface-border'
                    "
                  >
                    {{ index + 1 }}
                  </span>
                  <span
                    v-if="row.item_id"
                    class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-primary/10 text-primary border border-primary/25 whitespace-nowrap"
                  >
                    PRD-{{ row.item_id }}
                  </span>
                  <span
                    v-else
                    class="text-[9px] px-1.5 py-0.5 rounded font-sans font-bold bg-warning/15 text-warning border border-warning/30 whitespace-nowrap"
                  >
                    مسح
                  </span>
                </div>
              </td>

              <!-- 2. بيان الصنف ومسح الباركود المباشر -->
              <td class="px-3 py-2 align-middle">
                <div class="relative w-full h-10 flex items-center">
                  <input
                    :ref="(el) => setCellRef(el, index, 'name')"
                    type="text"
                    v-model="row.item_name"
                    @focus="onNameInputFocus(index, $event)"
                    @input="onItemNameInput(row, index, $event)"
                    @blur="closeSearchDropdownDelayed"
                    @keydown="handleModernNameKeydown($event, row, index)"
                    placeholder="امسح الباركود أو اكتب اسم الصنف..."
                    :class="[
                      'w-full h-10 pl-3 rounded-xl text-text-primary outline-none transition-all placeholder:text-text-muted placeholder:font-normal',
                      row.item_id
                        ? 'invoice-input-seamless pr-3.5 border text-sm font-black'
                        : 'invoice-cell-input-3d pr-9 bg-surface-card border border-primary/45 hover:border-primary focus:border-primary text-[13px] font-bold',
                    ]"
                  />

                  <span
                    v-if="!row.item_id"
                    class="absolute right-3 inset-y-0 flex items-center text-primary/80 pointer-events-none"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </span>
                </div>

                <p
                  v-if="getValidationError(`items.${index}.item_id`)"
                  class="text-danger text-[10px] font-bold mt-1 pr-1"
                >
                  {{ getValidationError(`items.${index}.item_id`) }}
                </p>
              </td>

              <!-- 3. وحدة الجرد -->
              <td class="px-3 py-2 text-center align-middle">
                <template v-if="row.item_id">
                  <div class="relative inline-flex items-center justify-center h-9 max-w-full">
                    <select
                      :ref="(el) => setCellRef(el, index, 'unit')"
                      v-model="row.item_unit_id"
                      @focus="handleFieldFocus($event)"
                      @change="onModernUnitSelectChange(row)"
                      @keydown="handleModernGenericKeydown($event, row, index, 'unit')"
                      :disabled="!row.available_units || row.available_units.length === 0"
                      class="invoice-pill-editable h-9 min-w-[92px] max-w-[136px] pr-3 pl-6 border rounded-xl text-text-secondary text-xs font-bold outline-none appearance-none cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-all"
                    >
                      <option value="" class="bg-surface-section text-text-muted">
                        اختر الوحدة...
                      </option>
                      <option
                        v-for="u in row.available_units"
                        :key="u.id"
                        :value="u.id"
                        class="bg-surface-section text-text-primary font-bold"
                      >
                        {{ u.unit_name || u.unit?.name || 'وحدة' }}
                      </option>
                    </select>
                    <span
                      class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none text-[8px]"
                    >
                      ▼
                    </span>
                  </div>

                  <p
                    v-if="getValidationError(`items.${index}.item_unit_id`)"
                    class="text-danger text-[10px] font-bold mt-1"
                  >
                    الوحدة مطلوبة
                  </p>
                </template>
                <span v-else class="text-text-muted/35 font-mono select-none">—</span>
              </td>

              <!-- 4. الكمية الدفترية -->
              <td class="px-3 py-2 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <span
                    v-if="row.item_id"
                    class="font-mono font-bold text-xs px-2.5 py-1 rounded-lg text-text-secondary bg-surface-ground/80 min-w-[72px]"
                  >
                    {{ formatSmartNumber(row.book_quantity) }}
                  </span>
                  <span v-else class="text-text-muted/35 font-mono">—</span>
                </div>
              </td>

              <!-- 5. الكمية الفعلية الجردية -->
              <td class="px-3 py-2 align-middle">
                <template v-if="row.item_id">
                  <div class="h-9 flex items-center justify-center">
                    <input
                      :ref="(el) => setCellRef(el, index, 'qty')"
                      type="text"
                      inputmode="decimal"
                      :value="getQtyDisplayValue(row, index)"
                      @focus="onModernQtyFocus(index, $event)"
                      @blur="activeQtyIndex = null"
                      @input="onModernQuantityChange(row, $event)"
                      @keydown="handleModernGenericKeydown($event, row, index, 'qty')"
                      placeholder="0"
                      :class="[
                        'invoice-pill-editable w-full h-9 px-2 text-center font-mono font-black text-sm border rounded-xl text-text-primary outline-none transition-all',
                        { 'animate-qty-pop !border-primary !text-primary': row._popping },
                      ]"
                    />
                  </div>

                  <p
                    v-if="getValidationError(`items.${index}.physical_quantity`)"
                    class="text-danger text-[10px] font-bold mt-1 text-center"
                  >
                    {{ getValidationError(`items.${index}.physical_quantity`) }}
                  </p>
                </template>
                <div
                  v-else
                  class="h-9 flex items-center justify-center text-text-muted/35 font-mono select-none"
                >
                  —
                </div>
              </td>

              <!-- 6. الفارق الجردي (فائض / عجز) -->
              <td class="px-3 py-2 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <template v-if="row.item_id">
                    <span
                      v-if="row.quantity_difference > 0"
                      :class="[
                        'inline-flex items-center justify-center min-w-[92px] h-9 px-3 rounded-xl font-mono font-black text-xs bg-success/12 text-success border border-success/35 shadow-2xs transition-all',
                        { 'animate-qty-pop': row._popping },
                      ]"
                    >
                      +{{ formatSmartNumber(row.quantity_difference) }} (فائض)
                    </span>
                    <span
                      v-else-if="row.quantity_difference < 0"
                      :class="[
                        'inline-flex items-center justify-center min-w-[92px] h-9 px-3 rounded-xl font-mono font-black text-xs bg-danger/12 text-danger border border-danger/35 shadow-2xs transition-all',
                        { 'animate-qty-pop': row._popping },
                      ]"
                    >
                      {{ formatSmartNumber(row.quantity_difference) }} (عجز)
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center justify-center min-w-[92px] h-9 px-3 rounded-xl font-mono font-bold text-xs bg-surface-ground/80 text-text-muted border border-surface-border/60"
                    >
                      0.00
                    </span>
                  </template>
                  <span v-else class="text-text-muted/35 font-mono">—</span>
                </div>
              </td>

              <!-- 7. تكلفة الوحدة -->
              <td class="px-3 py-2 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <span
                    v-if="row.item_id"
                    class="font-mono font-bold text-xs px-2.5 py-1 rounded-lg text-text-secondary bg-surface-ground/80"
                  >
                    {{ formatSmartNumber(row.unit_cost) }}
                  </span>
                  <span v-else class="text-text-muted/35 font-mono">—</span>
                </div>
              </td>

              <!-- 8. زر الحذف -->
              <td class="px-3 py-2 text-center align-middle">
                <div class="h-9 flex items-center justify-center">
                  <button
                    type="button"
                    tabindex="-1"
                    @click="handleRemoveRowWithFocus(index)"
                    class="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-colors cursor-pointer"
                    title="حذف هذا السطر (Alt + Delete)"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <!-- الحالة الافتراضية إذا فرغ الجدول -->
            <tr v-if="items.length === 0">
              <td colspan="8" class="py-10 text-center text-text-muted font-medium text-xs">
                لم تسجل أي أصناف جردية بعد. انقر على الزر أدناه لإضافة سطر فحص جديد.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- شريط الإضافة السريع ومؤشر عدد البنود المدمج أسفل المنصة -->
      <div
        class="px-4 py-2 bg-surface-ground/60 border-t border-surface-border/80 flex flex-wrap items-center justify-between gap-2"
      >
        <button
          type="button"
          tabindex="-1"
          @click="handleAddNewLineWithFocus"
          class="h-8 px-3.5 bg-surface-card hover:bg-primary hover:text-white text-primary border border-primary/45 hover:border-primary text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>إضافة سطر صنف جديد (Ctrl + Enter)</span>
        </button>

        <div class="flex items-center gap-3 text-xs text-text-secondary">
          <span class="hidden sm:inline text-[11px] text-text-muted">
            تلميح: استخدم
            <kbd
              class="px-1.5 py-0.5 bg-surface-card border border-surface-border rounded text-[10px] font-mono"
              >2*</kbd
            >
            قبل الباركود لمضاعفة الكمية تلقائياً
          </span>
          <span
            class="px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border font-mono shadow-2xs"
          >
            الأصناف الجردية:
            <strong class="text-primary font-black text-sm mr-1">{{
              items.filter((r) => r.item_id).length
            }}</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- قائمة المقترحات الطافية الذكية عبر Teleport -->
    <Teleport to="body">
      <div
        v-if="
          activeDropdownIndex !== null && items[activeDropdownIndex] && searchResults.length > 0
        "
        :style="dropdownStyle"
        class="fixed bg-surface-section border border-surface-border rounded-xl shadow-2xl z-[9999] max-h-64 overflow-y-auto divide-y divide-surface-border/60 text-right font-sans transition-all"
        dir="rtl"
      >
        <div
          v-for="(product, pIndex) in searchResults"
          :key="product.id"
          :ref="(el) => setDropdownItemRef(el, pIndex)"
          @mousedown.prevent="
            onSelectModernProduct(
              items[activeDropdownIndex],
              product,
              activeDropdownIndex,
              activeMultiplier,
              false,
            )
          "
          @mouseenter="onDropdownItemHover(pIndex)"
          class="p-2.5 cursor-pointer flex items-center justify-between transition-colors"
          :class="
            highlightedProductIndex === pIndex
              ? 'bg-primary/10 border-r-4 border-primary'
              : 'hover:bg-surface-ground'
          "
        >
          <div class="flex flex-col gap-1 pr-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-text-primary">{{ product.name }}</span>
              <span
                v-if="product.matched_barcode"
                class="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-mono font-bold border border-primary/25"
              >
                باركود: {{ product.matched_barcode }}
              </span>
              <span
                v-if="activeMultiplier > 1"
                class="text-[9px] bg-warning/15 text-warning px-1.5 py-0.5 rounded font-mono font-black border border-warning/30"
              >
                × {{ activeMultiplier }}
              </span>
            </div>

            <div class="flex items-center gap-3 text-[10px] text-text-muted font-mono">
              <span>كود: PRD-{{ product.id }}</span>
              <span
                v-if="product.units?.[0]?.unit_name || product.units?.[0]?.unit?.name"
                class="font-sans text-text-secondary"
              >
                الوحدة:
                {{ product.units[0].unit_name || product.units[0].unit?.name }}
              </span>
              <span class="font-sans font-bold text-info">
                الرصيد الدفتري:
                {{ formatSmartNumber(product.current_stock ?? product.stock ?? 0) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-3 pl-1">
            <span
              v-if="product.units?.[0]?.cost"
              class="text-xs font-mono font-bold text-primary whitespace-nowrap"
              title="تكلفة الوحدة"
            >
              ت: {{ formatSmartNumber(product.units[0].cost) }}
            </span>
            <span
              class="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap shadow-sm"
              :class="
                highlightedProductIndex === pIndex
                  ? 'bg-primary text-white'
                  : 'text-primary bg-primary/10 border border-primary/20'
              "
            >
              اختيار ↵
            </span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
