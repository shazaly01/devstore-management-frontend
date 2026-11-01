<!--src/views/sales/components/SaleItemsTable.vue-->
<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
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

// إدارة وضعية البحث مع الحفظ المحلي في المتصفح
const searchMode = ref(localStorage.getItem('panda_sales_search_mode') || 'classic')

const setSearchMode = (mode) => {
  searchMode.value = mode
  localStorage.setItem('panda_sales_search_mode', mode)

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
// 1. تجهيز بيانات الأصناف للبحث (مشترك وموحد)
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

// مزامنة المخزون عند تغير المستودع
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

// مزامنة أسعار العملاء
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

const updateRowTotal = (row) => {
  const q = parseFloat(row.quantity) || 0
  const p = parseFloat(row.unit_price) || 0
  row.grand_total = parseFloat((q * p).toFixed(4))
}

const getCustomerPriceForUnit = (productOrUnits, unitId) => {
  const units = Array.isArray(productOrUnits) ? productOrUnits : productOrUnits?.units || []
  const matchedUnit = units.find((u) => u.id === unitId)
  if (!matchedUnit) return 0

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
    return Number(matchedPriceEntry.price) || 0
  }

  return Number(matchedUnit.price) || 0
}

const syncUnitSalePrice = (row) => {
  if (row.is_price_overridden) {
    updateRowTotal(row)
    return
  }

  if (row.available_units && row.item_unit_id) {
    row.unit_price = getCustomerPriceForUnit(row.available_units, row.item_unit_id)
  }
  updateRowTotal(row)
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

const getRowAvailableStock = (row) => {
  if (row.base_stock === null || row.base_stock === undefined) return 0
  const matchedUnit = row.available_units?.find((u) => u.id === row.item_unit_id)
  const factor = matchedUnit ? parseFloat(matchedUnit.conversion_factor) || 1 : 1
  return parseFloat((row.base_stock / factor).toFixed(2))
}

// ----------------------------------------------------
// 2. دوال وإجراءات الوضع الكلاسيكي
// ----------------------------------------------------
const handleUnitPriceInput = (row, value) => {
  row.unit_price = props.unformatNumber(value)
  row.is_price_overridden = true
  updateRowTotal(row)
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
      if (typeof inputEl.scrollIntoView === 'function') {
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
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
      if (typeof inputEl.scrollIntoView === 'function') {
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
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

// ----------------------------------------------------
// 3. دوال وإجراءات الوضع الحديث (البحث السطري المباشر)
// ----------------------------------------------------
const cellRefs = ref({})
const dropdownItemRefs = ref([])
const modernColumnsOrder = ['name', 'unit', 'qty', 'price']
const activeTargetInput = ref(null)

const activePriceIndex = ref(null)
const activeQtyIndex = ref(null)

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

const getQtyDisplayValue = (row, index) => {
  if (activeQtyIndex.value === index) {
    return row.quantity === 0 || row.quantity === null ? '' : row.quantity
  }
  return formatSmartNumber(row.quantity)
}

const onQtyFocus = (index, event) => {
  activeQtyIndex.value = index
  handleFieldFocus(event)
}

const onQtyBlur = (row, index, event) => {
  activeQtyIndex.value = null
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.quantity = val === '' ? 0 : Number(val)
  updateRowTotal(row)
}

const onQuantityChange = (row, event) => {
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.quantity = val === '' ? 0 : Number(val)
  updateRowTotal(row)
}

const getPriceDisplayValue = (row, index) => {
  if (activePriceIndex.value === index) {
    return row.unit_price === 0 || row.unit_price === null ? '' : row.unit_price
  }
  return formatSmartNumber(row.unit_price)
}

const onPriceFocus = (index, event) => {
  activePriceIndex.value = index
  handleFieldFocus(event)
}

const onPriceBlur = (row, index, event) => {
  activePriceIndex.value = null
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.unit_price = val === '' ? 0 : Number(val)
  row.is_price_overridden = true
  updateRowTotal(row)
}

const onPriceChange = (row, event) => {
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.unit_price = val === '' ? 0 : Number(val)
  row.is_price_overridden = true
  updateRowTotal(row)
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
    focusModernCell(rowIndex - 1, 'price', true)
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

// قائمة المقترحات الطافية
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
    row.unit_price = 0
    updateRowTotal(row)
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

  // 1. فحص إذا كان الصنف مضافاً مسبقاً بنفس الوحدة في سطر آخر
  const existingIndex = props.items.findIndex(
    (it, idx) => idx !== index && it.item_id === product.id && it.item_unit_id === defaultUnitId,
  )

  if (existingIndex !== -1) {
    // زيادة كمية السطر المسبق بمقدار 1 ومزامنة الإجمالي
    const existingRow = props.items[existingIndex]
    existingRow.quantity = (parseFloat(existingRow.quantity) || 0) + 1
    updateRowTotal(existingRow)

    // تشغيل وميض مرئي برتقالي لتمييز السطر
    existingRow._flashing = true
    setTimeout(() => {
      existingRow._flashing = false
    }, 1200)

    // تصفير السطر الحالي ليبقى جاهزاً لقراءة الصنف التالي
    row.item_id = null
    row.item_id_display = ''
    row.item_name = ''
    row.available_units = []
    row.item_unit_id = null
    row.unit_price = 0
    row.quantity = 1
    row.grand_total = 0
    updateRowTotal(row)

    // إغلاق قائمة المقترحات
    activeDropdownIndex.value = null
    activeTargetInput.value = null
    searchResults.value = []
    dropdownItemRefs.value = []

    // التمرير السلس والتركيز المباشر على كمية السطر الذي زادت كميته
    focusModernCell(existingIndex, 'qty', true)
    return
  }

  // 2. تسكين صنف جديد
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
  row.is_price_overridden = false

  if (defaultUnitId) {
    row.unit_price = getCustomerPriceForUnit(product.units, defaultUnitId)
  } else {
    row.unit_price = Number(defaultUnit?.price) || 0
  }

  if (!row.quantity || Number(row.quantity) <= 0) {
    row.quantity = 1
  }

  updateRowTotal(row)

  activeDropdownIndex.value = null
  activeTargetInput.value = null
  searchResults.value = []
  dropdownItemRefs.value = []

  // التمرير والتركيز على حقل الكمية بالسطر الجديد
  focusModernCell(index, 'qty', true)
}

const onModernUnitSelectChange = (row) => {
  syncUnitSalePrice(row)
}

// معالجة مفاتيح الإدخال والأسهم في الوضع الحديث
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

const handleModernUnitKeydown = (event, row, index) => {
  if (checkModernShortcuts(event, index)) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    navigateModernHorizontal(index, 'unit', 1)
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    navigateModernHorizontal(index, 'unit', -1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    focusModernCell(index, 'qty', true)
  }
}

const handleModernQtyKeydown = (event, row, index) => {
  if (checkModernShortcuts(event, index)) return

  if (event.key === 'Enter') {
    event.preventDefault()
    focusModernCell(index, 'price', true)
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusModernCell(index + 1, 'qty', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      focusModernCell(index - 1, 'qty', true)
    }
    return
  }

  const el = event.target
  if (event.key === 'ArrowLeft') {
    if (isTextFullySelected(el) || isCursorAtEnd(el)) {
      event.preventDefault()
      navigateModernHorizontal(index, 'qty', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateModernHorizontal(index, 'qty', -1)
    }
  }
}

const handleModernPriceKeydown = (event, row, index) => {
  if (checkModernShortcuts(event, index)) return

  if (event.key === 'Enter') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusModernCell(index + 1, 'name', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusModernCell(index + 1, 'price', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      focusModernCell(index - 1, 'price', true)
    }
    return
  }

  const el = event.target
  if (event.key === 'ArrowLeft') {
    if (isTextFullySelected(el) || isCursorAtEnd(el)) {
      if (index < props.items.length - 1) {
        event.preventDefault()
        focusModernCell(index + 1, 'name', true)
      } else {
        event.preventDefault()
        handleAddNewLineWithFocus()
      }
    }
    return
  }

  if (event.key === 'ArrowRight') {
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateModernHorizontal(index, 'price', -1)
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
  <div ref="tableWrapperRef" class="p-0 bg-transparent space-y-3 font-sans" dir="rtl">
    <!-- شريط التبديل بين نمط البحث الكلاسيكي ونمط البحث الحديث -->
    <div
      class="flex items-center justify-between bg-surface-ground p-1.5 rounded-xl border border-surface-border/80 shadow-xs"
    >
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-bold text-text-secondary px-2">نمط إدخال الأصناف:</span>
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

      <div class="text-[11px] text-text-muted font-medium hidden sm:block">
        <span v-if="searchMode === 'classic'"
          >البحث الكلاسيكي عبر المحرك الشبكي العلوي واختيار الصنف للأعلى</span
        >
        <span v-else>الإدخال السطري المباشر وقراءة الباركود مع القائمة المقترحة السريعة</span>
      </div>
    </div>

    <!-- رسائل التحقق العامة للأصناف -->
    <p
      v-if="getValidationError('items')"
      class="p-2.5 bg-danger/10 text-danger border border-danger/30 rounded-lg text-xs font-bold shadow-sm"
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
          placeholder="اكتب اسم المنتج أو رقم الصنف للمزامنة اللحظية الفورية للمبيعات..."
          @select="onItemSelected"
        />
      </div>

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
              <th class="p-3 w-14 text-center">#</th>
              <th class="p-3 min-w-[260px]">بيان الصنف أو مسح الباركود</th>
              <th class="p-3 min-w-[130px] w-36">وحدة البيع</th>
              <th class="p-3 min-w-[110px] w-28 text-center">الكمية المباعة</th>
              <th class="p-3 min-w-[130px] w-36 text-center">سعر الوحدة</th>
              <th class="p-3 min-w-[120px] w-32 text-center">الإجمالي</th>
              <th class="p-3 min-w-[110px] w-28 text-center">المخزون المتاح</th>
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

              <!-- 2. بيان الصنف والبحث والباركود المباشر -->
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

              <!-- 3. وحدة البيع -->
              <td class="p-2.5 align-middle">
                <div class="relative w-full h-9 flex items-center">
                  <select
                    :ref="(el) => setCellRef(el, index, 'unit')"
                    v-model="row.item_unit_id"
                    @focus="handleFieldFocus($event)"
                    @change="onModernUnitSelectChange(row)"
                    @keydown="handleModernUnitKeydown($event, row, index)"
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
                  <span class="absolute left-2.5 text-text-muted pointer-events-none text-[9px]"
                    >▼</span
                  >
                </div>

                <p
                  v-if="getValidationError(`items.${index}.item_unit_id`)"
                  class="text-danger text-[10px] font-bold mt-0.5 pr-1"
                >
                  الوحدة مطلوبة
                </p>
              </td>

              <!-- 4. الكمية المباعة -->
              <td class="p-2.5 align-middle">
                <div class="h-9 flex items-center justify-center">
                  <input
                    :ref="(el) => setCellRef(el, index, 'qty')"
                    type="text"
                    inputmode="decimal"
                    :value="getQtyDisplayValue(row, index)"
                    @focus="onQtyFocus(index, $event)"
                    @blur="onQtyBlur(row, index, $event)"
                    @input="onQuantityChange(row, $event)"
                    @keydown="handleModernQtyKeydown($event, row, index)"
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

              <!-- 5. سعر الوحدة -->
              <td class="p-2.5 align-middle">
                <div class="h-9 flex flex-col items-center justify-center">
                  <input
                    :ref="(el) => setCellRef(el, index, 'price')"
                    type="text"
                    inputmode="decimal"
                    :value="getPriceDisplayValue(row, index)"
                    @focus="onPriceFocus(index, $event)"
                    @blur="onPriceBlur(row, index, $event)"
                    @input="onPriceChange(row, $event)"
                    @keydown="handleModernPriceKeydown($event, row, index)"
                    placeholder="0"
                    :class="[
                      'w-full h-9 px-2 text-center font-mono font-bold text-xs rounded-lg outline-none transition-all',
                      isPriceBelowMin(row)
                        ? 'bg-danger/10 text-danger border border-danger/40 focus:border-danger focus:ring-1 focus:ring-danger/40 shadow-sm'
                        : 'bg-surface-ground border border-surface-border hover:border-primary/60 focus:border-primary text-text-primary focus:ring-2 focus:ring-primary/20',
                    ]"
                  />
                  <span
                    v-if="isPriceBelowMin(row)"
                    class="text-[9px] text-danger font-bold mt-0.5 whitespace-nowrap animate-pulse"
                  >
                    الأدنى: {{ formatSmartNumber(getMinAllowedPrice(row)) }}
                  </span>
                </div>
              </td>

              <!-- 6. الإجمالي -->
              <td class="p-2.5 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <div
                    class="inline-flex items-center justify-center min-w-[70px] bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg"
                  >
                    <span class="font-mono font-black text-xs text-primary">
                      {{ formatSmartNumber(row.grand_total) }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- 7. المخزون المتاح -->
              <td class="p-2.5 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <span
                    class="inline-block px-2 py-1 rounded font-mono font-bold text-[11px] bg-surface-ground text-text-secondary border border-surface-border"
                  >
                    {{ formatSmartNumber(getRowAvailableStock(row)) }}
                  </span>
                </div>
              </td>

              <!-- 8. زر الحذف -->
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
              <td colspan="8" class="py-10 text-center text-text-muted">
                لا توجد أصناف مضافة حالياً. انقر على الزر أدناه لإضافة سطر بيع جديد.
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
                v-if="product.units?.[0]?.price"
                class="text-xs font-mono font-bold text-success whitespace-nowrap"
              >
                {{ formatSmartNumber(product.units[0].price) }}
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
</style>
