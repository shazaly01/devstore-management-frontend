<!--src/views/purchases/components/PurchaseItemsTable.vue-->
<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useItemStore } from '@/stores/itemStore'

import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'
import InvoiceDetailTable from '@/components/ui/dynamic-invoice/InvoiceDetailTable.vue'

const props = defineProps({
  items: { type: Array, required: true },
  form: { type: Object, required: true },
  visibleTableSchema: { type: Array, required: true },
  globalProfitMargin: { type: [Number, String], default: null },
  applyGlobalProfitMargin: { type: Function, required: true },
  getValidationError: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  unformatNumber: { type: Function, required: true },
  handleForeignUnitCostInput: { type: Function, required: true },
  handleUnitCostInput: { type: Function, required: true },
  handleSellingPriceInput: { type: Function, required: true },
  removeRow: { type: Function, required: true },
  triggerAddNewEmptyLine: { type: Function, required: true },
  handleGlobalItemSelect: { type: Function, required: true },
  syncUnitCostPrice: { type: Function, required: true },
})

const emit = defineEmits(['update:globalProfitMargin'])

const itemStore = useItemStore()

// إدارة وضعية البحث مع الحفظ التلقائي في localStorage
const searchMode = ref(localStorage.getItem('panda_purchases_search_mode') || 'classic')

const setSearchMode = (mode) => {
  searchMode.value = mode
  localStorage.setItem('panda_purchases_search_mode', mode)

  if (mode === 'modern') {
    if (props.items.length === 0) {
      props.triggerAddNewEmptyLine()
    }
    nextTick(() => {
      focusModernCell(props.items.length - 1, 'name', true)
    })
  } else {
    nextTick(() => {
      searchGridRef.value?.focus()
    })
  }
}

// ----------------------------------------------------
// 1. تجهيز بيانات الأصناف للبحث
// ----------------------------------------------------
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

const formatSmartNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  }).format(num)
}

const updateRowTotal = (row) => {
  const q = parseFloat(row.quantity) || 0
  const c = parseFloat(row.unit_cost) || 0
  row.grand_total = parseFloat((q * c).toFixed(4))
}

const getRowAvailableStock = (row) => {
  if (row.base_stock === null || row.base_stock === undefined) return 0
  const matchedUnit = row.available_units?.find((u) => String(u.id) === String(row.item_unit_id))
  const factor = matchedUnit ? parseFloat(matchedUnit.conversion_factor) || 1 : 1
  return parseFloat((row.base_stock / factor).toFixed(2))
}

// ----------------------------------------------------
// 2. دوال وإجراءات الوضع الكلاسيكي
// ----------------------------------------------------
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
      if (typeof inputEl.scrollIntoView === 'function') {
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      }
    }
  })
}

const focusClassicField = (rowIndex, colKey) => {
  nextTick(() => {
    const selector = `input[data-row="${rowIndex}"][data-col="${colKey}"]`
    const inputEl =
      tableWrapperRef.value?.querySelector(selector) || document.querySelector(selector)
    if (inputEl) {
      inputEl.focus()
      if (typeof inputEl.select === 'function') {
        inputEl.select()
      }
      if (typeof inputEl.scrollIntoView === 'function') {
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      }
    }
  })
}

const onClassicQuantityEnter = () => {
  searchGridRef.value?.focus()
}

const onClassicQuantityArrowLeft = (rowIndex) => {
  const targetCol = props.form.currency_id ? 'foreign_unit_cost' : 'unit_cost'
  focusClassicField(rowIndex, targetCol)
}

const onClassicFieldEnter = () => {
  searchGridRef.value?.focus()
}

const onClassicItemSelected = (selectedItem) => {
  props.handleGlobalItemSelect(selectedItem)

  nextTick(() => {
    const defaultUnitId = selectedItem.units?.[0]?.id || ''
    let targetIndex = props.items.findIndex((row) => {
      if (row.item_id !== selectedItem.id) return false
      if (defaultUnitId) return String(row.item_unit_id) === String(defaultUnitId)
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

// ----------------------------------------------------
// 3. دوال وإجراءات الوضع الحديث (البحث السطري المباشر)
// ----------------------------------------------------
const cellRefs = ref({})
const dropdownItemRefs = ref([])
const activeTargetInput = ref(null)

const activeQtyIndex = ref(null)
const activeForeignCostIndex = ref(null)
const activeCostIndex = ref(null)
const activeMarginIndex = ref(null)
const activePriceIndex = ref(null)

const modernColumnsOrder = computed(() => {
  if (props.form.currency_id) {
    return ['name', 'unit', 'qty', 'foreign_cost', 'cost', 'margin', 'price', 'expiry']
  }
  return ['name', 'unit', 'qty', 'cost', 'margin', 'price', 'expiry']
})

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
      if (typeof target.select === 'function') {
        target.select()
      }
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

// دوال إدارة التركيز الآمنة
const onModernQtyFocus = (index, event) => {
  activeQtyIndex.value = index
  handleFieldFocus(event)
}

const onModernForeignCostFocus = (index, event) => {
  activeForeignCostIndex.value = index
  handleFieldFocus(event)
}

const onModernCostFocus = (index, event) => {
  activeCostIndex.value = index
  handleFieldFocus(event)
}

const onModernMarginFocus = (index, event) => {
  activeMarginIndex.value = index
  handleFieldFocus(event)
}

const onModernPriceFocus = (index, event) => {
  activePriceIndex.value = index
  handleFieldFocus(event)
}

// دوال عرض القيم في الحقول
const getQtyDisplayValue = (row, index) => {
  if (activeQtyIndex.value === index) {
    return row.quantity === 0 || row.quantity === null ? '' : row.quantity
  }
  return formatSmartNumber(row.quantity)
}

const getForeignCostDisplayValue = (row, index) => {
  if (activeForeignCostIndex.value === index) {
    return row.foreign_unit_cost || ''
  }
  return row.foreign_unit_cost !== null && row.foreign_unit_cost !== ''
    ? formatSmartNumber(row.foreign_unit_cost)
    : ''
}

const getCostDisplayValue = (row, index) => {
  if (activeCostIndex.value === index) {
    return row.unit_cost === 0 || row.unit_cost === null ? '' : row.unit_cost
  }
  return formatSmartNumber(row.unit_cost)
}

const getMarginDisplayValue = (row, index) => {
  if (activeMarginIndex.value === index) {
    return row.profit_margin === 0 || row.profit_margin === null ? '' : row.profit_margin
  }
  return formatSmartNumber(row.profit_margin)
}

const getPriceDisplayValue = (row, index) => {
  if (activePriceIndex.value === index) {
    return row.selling_price === 0 || row.selling_price === null ? '' : row.selling_price
  }
  return formatSmartNumber(row.selling_price)
}

// معالجات تغيير القيم
const onModernQuantityChange = (row, event) => {
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.quantity = val === '' ? 0 : Number(val)
  updateRowTotal(row)
}

const onModernForeignCostChange = (row, event) => {
  props.handleForeignUnitCostInput(row, event.target.value)
  updateRowTotal(row)
}

const onModernUnitCostChange = (row, event) => {
  props.handleUnitCostInput(row, event.target.value)
  updateRowTotal(row)
}

const onModernMarginChange = (row, event) => {
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.profit_margin = val === '' ? 0 : Number(val)
  const cost = parseFloat(row.unit_cost) || 0
  if (cost > 0) {
    row.selling_price = parseFloat((cost * (1 + row.profit_margin / 100)).toFixed(4))
  }
}

const onModernSellingPriceChange = (row, event) => {
  props.handleSellingPriceInput(row, event.target.value)
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
  const order = modernColumnsOrder.value
  const currentIdx = order.indexOf(currentColKey)
  const targetIdx = currentIdx + direction

  if (targetIdx >= 0 && targetIdx < order.length) {
    focusModernCell(rowIndex, order[targetIdx], true)
  } else if (targetIdx >= order.length) {
    if (rowIndex === props.items.length - 1) {
      handleAddNewLineWithFocus()
    } else {
      focusModernCell(rowIndex + 1, 'name', true)
    }
  } else if (targetIdx < 0 && rowIndex > 0) {
    focusModernCell(rowIndex - 1, 'expiry', true)
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

const executeFastSearch = (queryText, rowIndex, immediate = false) => {
  const clean = queryText ? queryText.trim().toLowerCase() : ''
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

  if (immediate && results.length === 1) {
    onSelectModernProduct(props.items[rowIndex], results[0], rowIndex)
    return
  }

  searchResults.value = results
  highlightedProductIndex.value = 0
  dropdownItemRefs.value = []

  if (activeTargetInput.value) {
    updateDropdownPosition(activeTargetInput.value)
  }
}

const openSearchDropdown = (index, event) => {
  activeDropdownIndex.value = index
  updateDropdownPosition(event.target)
  executeFastSearch(props.items[index]?.item_name || '', index, false)
}

const onItemNameInput = (row, index, event) => {
  if (row.item_id) {
    row.item_id = null
    row.item_unit_id = null
    row.available_units = []
    row.unit_cost = 0
    row.foreign_unit_cost = null
    row.selling_price = 0
    row.grand_total = 0
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
  }, 200)
}

const onSelectModernProduct = (row, product, index) => {
  if (!row || props.items[index] !== row) return

  const defaultUnit = product.units?.[0] || null
  const defaultUnitId = defaultUnit?.id || ''

  // فحص ما إذا كان الصنف مضافاً مسبقاً بنفس الوحدة (الدمج الذكي مع الوميض)
  const existingIndex = props.items.findIndex(
    (it, idx) =>
      idx !== index &&
      it.item_id === product.id &&
      String(it.item_unit_id) === String(defaultUnitId),
  )

  if (existingIndex !== -1) {
    const existingRow = props.items[existingIndex]
    existingRow.quantity = (parseFloat(existingRow.quantity) || 0) + 1
    updateRowTotal(existingRow)

    existingRow._flashing = true
    setTimeout(() => {
      existingRow._flashing = false
    }, 1200)

    // تصفير السطر الحالي
    row.item_id = null
    row.item_id_display = ''
    row.item_name = ''
    row.available_units = []
    row.item_unit_id = null
    row.unit_cost = 0
    row.foreign_unit_cost = null
    row.profit_margin = 0
    row.selling_price = 0
    row.quantity = 1
    row.grand_total = 0

    activeDropdownIndex.value = null
    activeTargetInput.value = null
    searchResults.value = []
    dropdownItemRefs.value = []

    focusModernCell(existingIndex, 'qty', true)
    return
  }

  // تسكين بيانات الصنف الجديد
  const cost =
    defaultUnit?.cost !== undefined && defaultUnit?.cost !== null ? parseFloat(defaultUnit.cost) : 0
  const foreignCost =
    defaultUnit?.foreign_cost !== undefined && defaultUnit?.foreign_cost !== null
      ? parseFloat(defaultUnit.foreign_cost)
      : null

  let margin = 0
  if (
    props.globalProfitMargin !== null &&
    props.globalProfitMargin !== '' &&
    parseFloat(props.globalProfitMargin) >= 0
  ) {
    margin = parseFloat(props.globalProfitMargin)
  } else if (product.profit_margin) {
    margin = parseFloat(product.profit_margin)
  }

  let sellingPrice = 0
  if (cost > 0 && margin > 0) {
    sellingPrice = parseFloat((cost * (1 + margin / 100)).toFixed(4))
  } else if (defaultUnit?.price) {
    sellingPrice = parseFloat(defaultUnit.price) || 0
  }

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
  row.foreign_unit_cost = foreignCost
  row.unit_cost = cost
  row.profit_margin = margin
  row.selling_price = sellingPrice
  row.quantity = 1
  row.expiry_date = product.expiry_date ? String(product.expiry_date).substring(0, 10) : ''

  updateRowTotal(row)

  activeDropdownIndex.value = null
  activeTargetInput.value = null
  searchResults.value = []
  dropdownItemRefs.value = []

  focusModernCell(index, 'qty', true)
}

const onModernUnitSelectChange = (row) => {
  props.syncUnitCostPrice(row)
  updateRowTotal(row)
}

// معالجات لوحة المفاتيح والأسهم
const handleModernNameKeydown = (event, row, index) => {
  if (checkModernShortcuts(event, index)) return

  const isDropdownOpen = activeDropdownIndex.value === index && searchResults.value.length > 0

  if (isDropdownOpen) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      highlightedProductIndex.value =
        (highlightedProductIndex.value + 1) % searchResults.value.length
      scrollHighlightedDropdownItemIntoView()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
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
        onSelectModernProduct(row, selected, index)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      activeDropdownIndex.value = null
      searchResults.value = []
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
    } else {
      focusModernCell(index, 'unit', true)
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
      focusModernCell(index - 1, 'name', true)
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
    const order = modernColumnsOrder.value
    const currentIdx = order.indexOf(colKey)
    if (currentIdx < order.length - 1) {
      focusModernCell(index, order[currentIdx + 1], true)
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
      focusModernCell(index + 1, colKey, true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      focusModernCell(index - 1, colKey, true)
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

  if (searchMode.value === 'modern' && props.items.length === 0) {
    props.triggerAddNewEmptyLine()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>

<template>
  <div ref="tableWrapperRef" class="space-y-3 font-sans text-right" dir="rtl">
    <!-- شريط التبديل العلوي بين نمط البحث الكلاسيكي والحديث مدمج مع أداة نسبة الربح -->
    <div
      class="flex flex-col md:flex-row items-center justify-between gap-3 bg-surface-ground p-1.5 rounded-xl border border-surface-border/80 shadow-xs"
    >
      <div class="flex items-center gap-1.5 w-full md:w-auto">
        <span class="text-xs font-bold text-text-secondary px-1">نمط الإدخال:</span>
        <button
          type="button"
          @click="setSearchMode('classic')"
          class="px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
          :class="
            searchMode === 'classic'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-section border border-transparent'
          "
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          <span>بحث كلاسيكي</span>
        </button>

        <button
          type="button"
          @click="setSearchMode('modern')"
          class="px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
          :class="
            searchMode === 'modern'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-section border border-transparent'
          "
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>بحث حديث</span>
        </button>
      </div>

      <!-- أداة نسبة الربح العامة المدمجة -->
      <div
        class="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 bg-surface-section border border-surface-border px-3 py-1 rounded-lg shadow-xs"
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
            :value="globalProfitMargin"
            @input="
              emit(
                'update:globalProfitMargin',
                $event.target.value ? Number($event.target.value) : null,
              )
            "
            @keyup.enter="applyGlobalProfitMargin"
            placeholder="0"
            min="0"
            step="0.5"
            class="w-16 p-1 bg-surface-ground text-text-primary border border-surface-border focus:border-primary rounded-md text-xs font-bold text-center font-mono outline-none transition-all"
          />
          <span class="mr-1 text-xs font-bold text-text-muted">%</span>
        </div>

        <button
          type="button"
          @click="applyGlobalProfitMargin"
          class="px-2.5 py-1 bg-primary hover:bg-primary-dark active:scale-95 text-white text-xs font-bold rounded-md shadow-xs transition-all whitespace-nowrap cursor-pointer"
          title="تطبيق النسبة على كل الأصناف الحالية"
        >
          تطبيق
        </button>
      </div>
    </div>

    <!-- رسائل التحقق العامة -->
    <p
      v-if="getValidationError('items')"
      class="p-2.5 bg-danger/10 text-danger rounded-lg text-xs font-bold border border-danger/30 shadow-sm"
    >
      {{ getValidationError('items') }}
    </p>

    <!-- الوضع الأول: نمط البحث الكلاسيكي -->
    <template v-if="searchMode === 'classic'">
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
          placeholder="اكتب اسم المنتج أو رقم الصنف للمزامنة اللحظية الفورية..."
          @select="onClassicItemSelected"
        />
      </div>

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
                {{ u.unit_name || u.unit?.name || 'وحدة مجهولة' }}
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
              @keydown.enter.prevent="onClassicQuantityEnter"
              @keydown.arrow-left.prevent="onClassicQuantityArrowLeft(index)"
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
              @keydown.enter.prevent="onClassicFieldEnter"
              @keydown.arrow-left.prevent="focusClassicField(index, 'unit_cost')"
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
              @keydown.enter.prevent="onClassicFieldEnter"
              @keydown.arrow-left.prevent="focusClassicField(index, 'selling_price')"
              @keydown.arrow-right.prevent="
                focusClassicField(index, form.currency_id ? 'foreign_unit_cost' : 'quantity')
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
              @keydown.enter.prevent="onClassicFieldEnter"
              @keydown.arrow-right.prevent="focusClassicField(index, 'unit_cost')"
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
    </template>

    <!-- الوضع الثاني: نمط البحث الحديث -->
    <template v-else>
      <div
        class="overflow-x-auto rounded-xl border border-surface-border bg-surface-section shadow-sm"
      >
        <table class="w-full border-collapse text-right text-xs">
          <thead>
            <tr
              class="border-b border-surface-border bg-surface-ground/70 text-text-secondary font-black select-none h-11"
            >
              <th class="p-3 w-12 text-center">#</th>
              <th class="p-3 min-w-[240px]">بيان الصنف أو مسح الباركود</th>
              <th class="p-3 min-w-[120px] w-32">وحدة التعبئة</th>
              <th class="p-3 min-w-[100px] w-24 text-center">الكمية</th>
              <th v-if="form.currency_id" class="p-3 min-w-[120px] w-32 text-center">
                التكلفة بالأجنبي
              </th>
              <th class="p-3 min-w-[120px] w-32 text-center">التكلفة (محلي)</th>
              <th class="p-3 min-w-[90px] w-24 text-center">الربح %</th>
              <th class="p-3 min-w-[120px] w-32 text-center">سعر البيع</th>
              <th class="p-3 min-w-[120px] w-32 text-center">الصلاحية</th>
              <th class="p-3 min-w-[120px] w-32 text-center">الإجمالي</th>
              <th class="p-3 min-w-[100px] w-24 text-center">المخزون الحالي</th>
              <th class="p-3 w-12 text-center">إجراء</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-surface-border/60">
            <tr
              v-for="(row, index) in items"
              :key="index"
              class="transition-all duration-300 hover:bg-surface-ground/40 h-14"
              :class="{
                'animate-flash-merge bg-primary/15 ring-2 ring-primary/50 ring-inset':
                  row._flashing,
              }"
            >
              <!-- 1. تسلسل السطر وشارة الكود -->
              <td class="p-2.5 text-center font-mono align-middle">
                <div class="flex items-center justify-center gap-1">
                  <span class="font-bold text-xs text-text-muted">{{ index + 1 }}</span>
                  <span
                    v-if="row.item_id"
                    class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap"
                  >
                    PRD-{{ row.item_id }}
                  </span>
                  <span
                    v-else
                    class="text-[9px] px-1.5 py-0.5 rounded font-sans font-bold bg-warning/10 text-warning border border-warning/20 whitespace-nowrap"
                  >
                    جديد
                  </span>
                </div>
              </td>

              <!-- 2. بيان الصنف ومسح الباركود السطري المباشر -->
              <td class="p-2.5 align-middle">
                <div class="relative w-full h-9 flex items-center">
                  <input
                    :ref="(el) => setCellRef(el, index, 'name')"
                    type="text"
                    v-model="row.item_name"
                    @focus="onNameInputFocus(index, $event)"
                    @input="onItemNameInput(row, index, $event)"
                    @blur="closeSearchDropdownDelayed"
                    @keydown="handleModernNameKeydown($event, row, index)"
                    placeholder="امسح الباركود أو اكتب اسم الصنف..."
                    class="w-full h-9 px-3 bg-surface-ground border border-surface-border hover:border-primary/60 focus:border-primary rounded-lg text-text-primary text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted"
                  />
                </div>

                <p
                  v-if="getValidationError(`items.${index}.item_id`)"
                  class="text-danger text-[10px] font-bold mt-0.5 pr-1"
                >
                  {{ getValidationError(`items.${index}.item_id`) }}
                </p>
              </td>

              <!-- 3. وحدة التعبئة -->
              <td class="p-2.5 align-middle">
                <div class="relative w-full h-9 flex items-center">
                  <select
                    :ref="(el) => setCellRef(el, index, 'unit')"
                    v-model="row.item_unit_id"
                    @focus="handleFieldFocus($event)"
                    @change="onModernUnitSelectChange(row)"
                    @keydown="handleModernGenericKeydown($event, row, index, 'unit')"
                    :disabled="!row.available_units || row.available_units.length === 0"
                    class="w-full h-9 pr-2.5 pl-6 bg-surface-ground border border-surface-border hover:border-primary/60 focus:border-primary rounded-lg text-text-primary text-xs font-bold outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="" class="bg-surface-section text-text-muted">
                      اختر الوحدة...
                    </option>
                    <option
                      v-for="u in row.available_units"
                      :key="u.id"
                      :value="u.id"
                      class="bg-surface-section text-text-primary"
                    >
                      {{ u.unit_name || u.unit?.name || 'وحدة' }}
                    </option>
                  </select>
                  <span class="absolute left-2.5 text-text-muted pointer-events-none text-[9px]">
                    ▼
                  </span>
                </div>

                <p
                  v-if="getValidationError(`items.${index}.item_unit_id`)"
                  class="text-danger text-[10px] font-bold mt-0.5 pr-1"
                >
                  الوحدة مطلوبة
                </p>
              </td>

              <!-- 4. الكمية -->
              <td class="p-2.5 align-middle">
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
                    class="w-full h-9 px-2 text-center font-mono font-black text-xs bg-surface-ground border border-surface-border hover:border-primary/60 focus:border-primary rounded-lg text-text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <p
                  v-if="getValidationError(`items.${index}.quantity`)"
                  class="text-danger text-[10px] font-bold mt-0.5 text-center"
                >
                  {{ getValidationError(`items.${index}.quantity`) }}
                </p>
              </td>

              <!-- 5. التكلفة بالعملة الأجنبية -->
              <td v-if="form.currency_id" class="p-2.5 align-middle">
                <div class="h-9 flex items-center justify-center">
                  <input
                    :ref="(el) => setCellRef(el, index, 'foreign_cost')"
                    type="text"
                    inputmode="decimal"
                    :value="getForeignCostDisplayValue(row, index)"
                    @focus="onModernForeignCostFocus(index, $event)"
                    @blur="activeForeignCostIndex = null"
                    @input="onModernForeignCostChange(row, $event)"
                    @keydown="handleModernGenericKeydown($event, row, index, 'foreign_cost')"
                    placeholder="-"
                    class="w-full h-9 px-2 text-center font-mono font-bold text-xs bg-surface-ground border border-surface-border hover:border-primary/60 focus:border-primary rounded-lg text-text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </td>

              <!-- 6. تكلفة الوحدة (محلي) -->
              <td class="p-2.5 align-middle">
                <div class="h-9 flex items-center justify-center">
                  <input
                    :ref="(el) => setCellRef(el, index, 'cost')"
                    type="text"
                    inputmode="decimal"
                    :value="getCostDisplayValue(row, index)"
                    @focus="onModernCostFocus(index, $event)"
                    @blur="activeCostIndex = null"
                    @input="onModernUnitCostChange(row, $event)"
                    @keydown="handleModernGenericKeydown($event, row, index, 'cost')"
                    placeholder="0"
                    class="w-full h-9 px-2 text-center font-mono font-bold text-xs bg-surface-ground border border-surface-border hover:border-primary/60 focus:border-primary rounded-lg text-text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </td>

              <!-- 7. نسبة الربح % -->
              <td class="p-2.5 align-middle">
                <div class="h-9 flex items-center justify-center">
                  <input
                    :ref="(el) => setCellRef(el, index, 'margin')"
                    type="text"
                    inputmode="decimal"
                    :value="getMarginDisplayValue(row, index)"
                    @focus="onModernMarginFocus(index, $event)"
                    @blur="activeMarginIndex = null"
                    @input="onModernMarginChange(row, $event)"
                    @keydown="handleModernGenericKeydown($event, row, index, 'margin')"
                    placeholder="0"
                    class="w-full h-9 px-1 text-center font-mono font-bold text-xs bg-surface-ground border border-surface-border hover:border-primary/60 focus:border-primary rounded-lg text-text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </td>

              <!-- 8. سعر البيع -->
              <td class="p-2.5 align-middle">
                <div class="h-9 flex items-center justify-center">
                  <input
                    :ref="(el) => setCellRef(el, index, 'price')"
                    type="text"
                    inputmode="decimal"
                    :value="getPriceDisplayValue(row, index)"
                    @focus="onModernPriceFocus(index, $event)"
                    @blur="activePriceIndex = null"
                    @input="onModernSellingPriceChange(row, $event)"
                    @keydown="handleModernGenericKeydown($event, row, index, 'price')"
                    placeholder="0"
                    class="w-full h-9 px-2 text-center font-mono font-bold text-xs bg-surface-ground border border-surface-border hover:border-primary/60 focus:border-primary rounded-lg text-text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </td>

              <!-- 9. تاريخ الصلاحية -->
              <td class="p-2.5 align-middle">
                <div class="h-9 flex items-center justify-center">
                  <input
                    :ref="(el) => setCellRef(el, index, 'expiry')"
                    type="date"
                    v-model="row.expiry_date"
                    @focus="handleFieldFocus($event)"
                    @keydown="handleModernGenericKeydown($event, row, index, 'expiry')"
                    class="w-full h-9 px-1.5 text-center font-mono text-xs bg-surface-ground border border-surface-border hover:border-primary/60 focus:border-primary rounded-lg text-text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </td>

              <!-- 10. الإجمالي -->
              <td class="p-2.5 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <div
                    class="inline-flex items-center justify-center min-w-[70px] bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg"
                  >
                    <span class="font-mono font-black text-xs text-primary">
                      {{ formatSmartNumber(row.grand_total) }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- 11. المخزون الحالي -->
              <td class="p-2.5 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <span
                    class="inline-block px-2 py-1 rounded font-mono font-bold text-[11px] bg-surface-ground text-text-secondary border border-surface-border"
                  >
                    {{ formatSmartNumber(getRowAvailableStock(row)) }}
                  </span>
                </div>
              </td>

              <!-- 12. زر الحذف -->
              <td class="p-2.5 text-center align-middle">
                <div class="h-9 flex items-center justify-center">
                  <button
                    type="button"
                    tabindex="-1"
                    @click="handleRemoveRowWithFocus(index)"
                    class="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
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
              <td :colspan="form.currency_id ? 12 : 11" class="py-10 text-center text-text-muted">
                لا توجد أصناف مضافة حالياً. انقر على الزر أدناه لإضافة سطر مشتريات جديد.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- شريط الإضافة السريع ومؤشر عدد البنود للوضع الحديث -->
      <div class="flex items-center justify-between pt-1">
        <button
          type="button"
          tabindex="-1"
          @click="handleAddNewLineWithFocus"
          class="h-9 px-4 bg-surface-ground hover:bg-surface-section text-primary border border-primary/40 hover:border-primary text-xs font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-sm cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>+ إضافة سطر صنف جديد (Ctrl + Enter)</span>
        </button>

        <span class="text-xs text-text-secondary font-mono">
          إجمالي أسطر الفاتورة:
          <strong class="text-text-primary">{{ items.filter((r) => r.item_id).length }}</strong>
        </span>
      </div>

      <!-- قائمة المقترحات الطافية الذكية عبر Teleport للوضع الحديث -->
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
              onSelectModernProduct(items[activeDropdownIndex], product, activeDropdownIndex)
            "
            @mouseenter="highlightedProductIndex = pIndex"
            class="p-3 cursor-pointer flex items-center justify-between transition-colors"
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
                  الرصيد: {{ formatSmartNumber(product.current_stock ?? product.stock ?? 0) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3 pl-1">
              <span
                v-if="product.units?.[0]?.cost"
                class="text-xs font-mono font-bold text-primary whitespace-nowrap"
                title="تكلفة الوحدة الحالية"
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
    </template>
  </div>
</template>

<style scoped>
@keyframes flashRow {
  0% {
    background-color: rgba(249, 115, 22, 0.35);
  }
  50% {
    background-color: rgba(249, 115, 22, 0.15);
  }
  100% {
    background-color: transparent;
  }
}

.animate-flash-merge {
  animation: flashRow 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.smart-search-grid th.text-right),
:deep(.smart-search-grid td.text-right),
:deep(.smart-search-dropdown .text-right),
:deep(table td:nth-child(2)) {
  text-align: right !important;
}
</style>
