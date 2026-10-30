<!--src/views/disassembly/components/DisassemblyItemsTable.vue-->
<template>
  <div class="space-y-3 text-right font-sans" dir="rtl">
    <!-- تنبيه أخطاء التحقق العامة للأسطر -->
    <div
      v-if="getValidationError('items')"
      class="p-3 bg-danger/10 text-danger border border-danger/30 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
    >
      <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>{{ getValidationError('items') }}</span>
    </div>

    <!-- جدول إدخال وتعديل الأجزاء الناتجة -->
    <div
      class="overflow-x-auto rounded-xl border border-surface-border bg-surface-section shadow-sm"
    >
      <table class="w-full border-collapse text-right text-xs">
        <thead>
          <tr
            class="border-b border-surface-border bg-surface-ground/70 text-text-secondary font-black select-none h-11"
          >
            <th class="p-3 w-14 text-center">#</th>
            <th class="p-3 min-w-[240px]">بيان الصنف الناتج أو مسح الباركود</th>
            <th class="p-3 min-w-[130px] w-36">وحدة القياس</th>
            <th class="p-3 min-w-[110px] w-28 text-center">الوزن / الكمية</th>
            <th class="p-3 min-w-[130px] w-36 text-center">سعر البيع المرجعي</th>
            <th class="p-3 min-w-[90px] w-24 text-center">نسبة التكلفة</th>
            <th class="p-3 min-w-[120px] w-32 text-center">تكلفة الوحدة</th>
            <th class="p-3 min-w-[120px] w-32 text-center">إجمالي التكلفة</th>
            <th class="p-3 min-w-[140px]">ملاحظات السطر</th>
            <th class="p-3 w-12 text-center">إجراء</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-surface-border/60">
          <tr
            v-for="(row, index) in items"
            :key="index"
            class="transition-colors hover:bg-surface-ground/40 h-14"
          >
            <!-- تسلسل السطر وشارة كود الصنف -->
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

            <!-- 1. بيان الصنف ومسح الباركود التفاعلي داخل السطر -->
            <td class="p-2.5 align-middle">
              <div class="relative w-full h-9 flex items-center">
                <input
                  :ref="(el) => setCellRef(el, index, 'name')"
                  type="text"
                  v-model="row.item_name"
                  @focus="onNameInputFocus(index, $event)"
                  @input="onItemNameInput(row, index, $event)"
                  @blur="closeSearchDropdownDelayed"
                  @keydown="handleItemNameKeydown($event, row, index)"
                  placeholder="امسح الباركود أو اكتب اسم الجزء (صدور، أوراك...)"
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

            <!-- 2. وحدة القياس -->
            <td class="p-2.5 align-middle">
              <div class="relative w-full h-9 flex items-center">
                <select
                  :ref="(el) => setCellRef(el, index, 'unit')"
                  v-model="row.item_unit_id"
                  @focus="$event.target.select && $event.target.select()"
                  @change="onUnitSelectChange(row)"
                  @keydown="handleUnitKeydown($event, row, index)"
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
                    {{ u.unit?.name || u.name || 'وحدة' }}
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
                {{ getValidationError(`items.${index}.item_unit_id`) }}
              </p>
            </td>

            <!-- 3. الوزن / الكمية الفعلية -->
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
                  @keydown="handleQtyKeydown($event, row, index)"
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

            <!-- 4. سعر البيع المرجعي (تنسيق مالي بدون تمييز العملة وبدون أصفار كسور زائدة) -->
            <td class="p-2.5 align-middle">
              <div class="h-9 flex items-center justify-center">
                <input
                  :ref="(el) => setCellRef(el, index, 'price')"
                  type="text"
                  inputmode="decimal"
                  :value="getPriceDisplayValue(row, index)"
                  @focus="onPriceFocus(index, $event)"
                  @blur="onPriceBlur(row, index, $event)"
                  @input="onPriceChange(row, $event)"
                  @keydown="handlePriceKeydown($event, row, index)"
                  placeholder="0"
                  class="w-full h-9 px-2 text-center font-mono font-bold text-xs bg-surface-ground border border-surface-border hover:border-primary/60 focus:border-primary rounded-lg text-text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </td>

            <!-- 5. نسبة التكلفة المستحقة % -->
            <td class="p-2.5 text-center align-middle select-none">
              <div class="h-9 flex items-center justify-center">
                <span
                  class="inline-block px-2 py-1 rounded font-mono font-bold text-[11px] bg-surface-ground text-text-secondary border border-surface-border"
                >
                  {{ formatSmartNumber(row.cost_percentage || 0) }}%
                </span>
              </div>
            </td>

            <!-- 6. تكلفة الكيلو / الوحدة المحسوبة -->
            <td class="p-2.5 text-center align-middle select-none">
              <div class="h-9 flex items-center justify-center">
                <div
                  class="inline-flex items-center justify-center min-w-[70px] bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-lg"
                >
                  <span class="font-mono font-black text-xs text-primary">
                    {{ formatSmartNumber(row.unit_cost) }}
                  </span>
                </div>
              </div>
            </td>

            <!-- 7. إجمالي تكلفة البند -->
            <td class="p-2.5 text-center align-middle select-none">
              <div class="h-9 flex items-center justify-center">
                <div
                  class="inline-flex items-center justify-center min-w-[70px] bg-success/10 border border-success/30 px-2.5 py-1 rounded-lg"
                >
                  <span class="font-mono font-black text-xs text-success">
                    {{ formatSmartNumber(row.total_cost) }}
                  </span>
                </div>
              </div>
            </td>

            <!-- 8. ملاحظات السطر -->
            <td class="p-2.5 align-middle">
              <div class="h-9 flex items-center">
                <input
                  :ref="(el) => setCellRef(el, index, 'notes')"
                  type="text"
                  v-model="row.notes"
                  @focus="handleFieldFocus($event)"
                  @keydown="handleNotesKeydown($event, row, index)"
                  placeholder="ملاحظات..."
                  class="w-full h-9 px-2 text-xs bg-surface-ground border border-surface-border hover:border-primary/60 focus:border-primary rounded-lg text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </td>

            <!-- 9. زر حذف السطر -->
            <td class="p-2.5 text-center align-middle">
              <div class="h-9 flex items-center justify-center">
                <button
                  type="button"
                  tabindex="-1"
                  @click="handleRemoveRowWithFocus(index)"
                  class="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                  title="حذف هذا الجزء (Alt + Delete)"
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
            <td colspan="10" class="py-10 text-center text-text-muted">
              لم تسجل أي جزء ناتج بعد. انقر على الزر أدناه للبدء بإضافة النواتج.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- شريط الإضافة السفلي السريع ومؤشر عدد البنود -->
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
        <span>+ إضافة جزء ناتج آخر (Ctrl + Enter)</span>
      </button>

      <span class="text-xs text-text-secondary font-mono">
        إجمالي الأجزاء الناتجة:
        <strong class="text-text-primary">{{ items.filter((r) => r.item_id).length }}</strong>
      </span>
    </div>

    <!-- قائمة المقترحات الطافية الذكية عبر Teleport (عريضة ومتوافقة مع RTL وبدون تمييز عملة) -->
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
            onSelectProduct(items[activeDropdownIndex], product, activeDropdownIndex)
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
              <span v-if="product.units?.[0]?.unit?.name" class="font-sans text-text-secondary">
                الوحدة: {{ product.units[0].unit.name }}
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
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useItemStore } from '@/stores/itemStore'

const props = defineProps({
  items: { type: Array, required: true },
  sourceItemId: { type: [Number, String], default: null },
  formatNumber: { type: Function, required: true },
  getValidationError: { type: Function, required: true },
  selectItemForRow: { type: Function, required: true },
  addEmptyRow: { type: Function, required: true },
})

const emit = defineEmits(['unit-changed', 'recalculate', 'remove-row'])

const itemStore = useItemStore()

// دالة التنسيق الذكي: إخفاء أصفار الكسور عند الأعداد الصحيحة وإظهار الكسور حتى خانتين أو 4 خانات
const formatSmartNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  }).format(num)
}

// 1. فهرسة الأصناف في الذاكرة
const normalizedStoreItems = computed(() => {
  if (!itemStore.items) return []
  return itemStore.items
    .filter((it) => it.id !== Number(props.sourceItemId))
    .map((item) => {
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
        all_barcodes: allBarcodes,
      }
    })
})

// 2. إدارة المراجع والتركيز التلقائي والتظليل
const cellRefs = ref({})
const dropdownItemRefs = ref([])
const columnsOrder = ['name', 'unit', 'qty', 'price', 'notes']
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

// دالة التركيز مع التظليل والتمرير التلقائي السلس
const focusCell = (rowIndex, colKey, shouldScroll = true) => {
  nextTick(() => {
    const target = cellRefs.value[rowIndex]?.[colKey]
    if (target) {
      target.focus()
      if (typeof target.select === 'function') {
        target.select()
      }
      if (shouldScroll && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
      }
    }
  })
}

// تظليل النص فوراً عند التركيز
const handleFieldFocus = (event) => {
  const el = event.target
  if (el && typeof el.select === 'function') {
    el.select()
  }
}

const onNameInputFocus = (index, event) => {
  handleFieldFocus(event)
  openSearchDropdown(index, event)
}

// التحكم بعرض الكمية: رقم نقي أثناء الكتابة، وتنسيق ذكي عند عدم التحديد
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
  emit('recalculate')
}

const onQuantityChange = (row, event) => {
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.quantity = val === '' ? 0 : Number(val)
  emit('recalculate')
}

// التحكم بعرض السعر المرجعي: رقم نقي أثناء الكتابة، وتنسيق ذكي عند عدم التحديد
const getPriceDisplayValue = (row, index) => {
  if (activePriceIndex.value === index) {
    return row.expected_unit_price === 0 || row.expected_unit_price === null
      ? ''
      : row.expected_unit_price
  }
  return formatSmartNumber(row.expected_unit_price)
}

const onPriceFocus = (index, event) => {
  activePriceIndex.value = index
  handleFieldFocus(event)
}

const onPriceBlur = (row, index, event) => {
  activePriceIndex.value = null
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.expected_unit_price = val === '' ? 0 : Number(val)
  emit('recalculate')
}

const onPriceChange = (row, event) => {
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.expected_unit_price = val === '' ? 0 : Number(val)
  emit('recalculate')
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

const navigateHorizontal = (rowIndex, currentColKey, direction) => {
  const currentIdx = columnsOrder.indexOf(currentColKey)
  const targetIdx = currentIdx + direction

  if (targetIdx >= 0 && targetIdx < columnsOrder.length) {
    focusCell(rowIndex, columnsOrder[targetIdx], false)
  } else if (targetIdx >= columnsOrder.length) {
    if (rowIndex === props.items.length - 1) {
      handleAddNewLineWithFocus()
    } else {
      focusCell(rowIndex + 1, 'name', true)
    }
  } else if (targetIdx < 0 && rowIndex > 0) {
    focusCell(rowIndex - 1, 'notes', false)
  }
}

const handleAddNewLineWithFocus = async () => {
  props.addEmptyRow()
  await nextTick()
  const newIndex = props.items.length - 1
  focusCell(newIndex, 'name', true)
}

const handleRemoveRowWithFocus = async (index) => {
  emit('remove-row', index)
  await nextTick()
  const targetIndex = Math.max(0, Math.min(index, props.items.length - 1))
  focusCell(targetIndex, 'name', true)
}

const checkCommonRowShortcuts = (event, index) => {
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

// 3. إدارة البحث العريض وقائمة الاقتراحات
const activeDropdownIndex = ref(null)
const highlightedProductIndex = ref(0)
const searchResults = ref([])

const dropdownStyle = ref({
  top: 'auto',
  bottom: 'auto',
  right: '0px',
  width: '480px',
})

const updateDropdownPosition = (targetElement) => {
  if (!targetElement) return
  activeTargetInput.value = targetElement
  const rect = targetElement.getBoundingClientRect()
  const dropdownEstimatedHeight = 260
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  const shouldOpenUpwards = spaceBelow < dropdownEstimatedHeight && spaceAbove > spaceBelow

  const preferredWidth = Math.max(rect.width, 480)
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
  for (const it of normalizedStoreItems.value) {
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
    onSelectProduct(props.items[rowIndex], results[0], rowIndex)
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
    emit('recalculate')
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

const onSelectProduct = (row, product, index) => {
  if (!row || props.items[index] !== row) return

  const isSuccess = props.selectItemForRow(row, product, index)
  activeDropdownIndex.value = null
  activeTargetInput.value = null
  searchResults.value = []
  dropdownItemRefs.value = []

  if (isSuccess) {
    focusCell(index, 'qty', false)
  } else {
    focusCell(index, 'name', false)
  }
}

const onUnitSelectChange = (row) => {
  emit('unit-changed', row)
}

// 4. معالجة أحداث لوحة المفاتيح
const handleItemNameKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

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
        onSelectProduct(row, selected, index)
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
      focusCell(index, 'qty', false)
    } else {
      focusCell(index, 'unit', false)
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeDropdownIndex.value = null
    if (index < props.items.length - 1) {
      focusCell(index + 1, 'name', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      activeDropdownIndex.value = null
      focusCell(index - 1, 'name', true)
    }
    return
  }

  // في RTL: السهم الأيسر هو الانتقال للأمام للعمود التالي
  if (event.key === 'ArrowLeft') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtEnd(el) || !row.item_name) {
      event.preventDefault()
      activeDropdownIndex.value = null
      navigateHorizontal(index, 'name', 1)
    }
    return
  }

  // في RTL: السهم الأيمن هو الانتقال للخلف للعمود السابق
  if (event.key === 'ArrowRight') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      if (index > 0) {
        event.preventDefault()
        activeDropdownIndex.value = null
        navigateHorizontal(index, 'name', -1)
      }
    }
  }
}

const handleUnitKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    navigateHorizontal(index, 'unit', 1)
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    navigateHorizontal(index, 'unit', -1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    focusCell(index, 'qty', false)
  }
}

const handleQtyKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  if (event.key === 'Enter') {
    event.preventDefault()
    focusCell(index, 'price', false)
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusCell(index + 1, 'qty', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      focusCell(index - 1, 'qty', true)
    }
    return
  }

  const el = event.target
  if (event.key === 'ArrowLeft') {
    if (isTextFullySelected(el) || isCursorAtEnd(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'qty', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'qty', -1)
    }
  }
}

const handlePriceKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  if (event.key === 'Enter') {
    event.preventDefault()
    focusCell(index, 'notes', false)
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusCell(index + 1, 'price', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      focusCell(index - 1, 'price', true)
    }
    return
  }

  const el = event.target
  if (event.key === 'ArrowLeft') {
    if (isTextFullySelected(el) || isCursorAtEnd(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'price', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'price', -1)
    }
  }
}

const handleNotesKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  if (event.key === 'Enter' || event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusCell(index + 1, 'name', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      focusCell(index - 1, 'notes', true)
    }
    return
  }

  const el = event.target
  if (event.key === 'ArrowRight') {
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'notes', -1)
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

  nextTick(() => {
    if (props.items.length > 0) {
      focusCell(0, 'name', false)
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>
