<!--src/views/disassembly/components/DisassemblyHeader.vue-->
<template>
  <div
    class="bg-surface-section rounded-xl border border-surface-border shadow-sm text-right font-sans overflow-hidden transition-colors duration-200"
    dir="rtl"
  >
    <!-- 1. الصف العلوي: المستودع وتاريخ التشغيل (مفصول بشريط متميز من ألوان النظام) -->
    <div
      class="px-4 py-2.5 bg-surface-ground/70 border-b border-surface-border flex flex-wrap items-center justify-between gap-3"
    >
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-primary"></span>
        <span class="text-xs font-black text-text-primary">بيانات المستند والمستودع</span>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <!-- مستودع العملية -->
        <div class="flex items-center gap-2">
          <label class="text-[11px] font-bold text-text-secondary shrink-0">المستودع:</label>
          <div class="w-56 flex flex-col">
            <div
              class="relative w-full h-8 bg-surface-section border border-surface-border rounded-lg flex items-center transition-all hover:border-primary/60 focus-within:border-primary shadow-xs"
            >
              <span class="absolute right-2 text-text-muted pointer-events-none z-10">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </span>
              <div class="w-full h-full pr-7 pl-2 flex items-center">
                <StoresDropdown
                  id="disassembly-store-id"
                  v-model="formData.store_id"
                  variant="sales"
                  class="w-full bg-transparent text-xs"
                />
              </div>
            </div>
            <p v-if="getFieldError('store_id')" class="text-danger text-[10px] font-bold pr-1">
              {{ getFieldError('store_id') }}
            </p>
          </div>
        </div>

        <!-- تاريخ التشغيل -->
        <div class="flex items-center gap-2">
          <label class="text-[11px] font-bold text-text-secondary shrink-0">التاريخ:</label>
          <div class="w-36 flex flex-col">
            <div
              class="relative w-full h-8 bg-surface-section border border-surface-border rounded-lg flex items-center transition-all hover:border-primary/60 focus-within:border-primary shadow-xs"
            >
              <input
                type="date"
                v-model="formData.disassembly_date"
                class="block w-full h-full pr-2 pl-7 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
              />
              <span
                class="absolute left-2 text-text-muted pointer-events-none flex items-center text-xs z-10"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </div>
            <p
              v-if="getFieldError('disassembly_date')"
              class="text-danger text-[10px] font-bold pr-1"
            >
              {{ getFieldError('disassembly_date') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. الصف السفلي: بيانات الصنف الخام والميزان المالي (مستقلة ومتوازنة المقاسات) -->
    <div class="p-3.5 bg-surface-section">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
        <!-- 1. الصنف الخام المصروف (4 أعمدة) -->
        <div class="lg:col-span-4 flex flex-col space-y-1">
          <label class="text-[11px] font-bold text-text-secondary pr-1">
            الصنف الخام المصروف (اسم / باركود)
          </label>
          <div
            ref="searchInputContainerRef"
            class="relative w-full h-9 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
          >
            <span class="absolute right-2.5 text-primary pointer-events-none z-10">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </span>

            <input
              type="text"
              v-model="sourceItemSearchText"
              @focus="onSearchInputFocus"
              @input="onSearchInput"
              @blur="closeSearchDropdownDelayed"
              @keydown="handleSearchKeydown"
              placeholder="امسح الباركود أو ابحث عن الصنف..."
              class="block w-full h-full pr-8 pl-7 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-bold"
            />

            <button
              v-if="formData.source_item_id"
              type="button"
              tabindex="-1"
              @click="clearSourceItem"
              class="absolute left-2.5 text-text-muted hover:text-danger text-xs font-bold transition-colors cursor-pointer"
              title="إلغاء واختيار صنف آخر"
            >
              ✕
            </button>
          </div>
          <p v-if="getFieldError('source_item_id')" class="text-danger text-[10px] font-bold pr-1">
            {{ getFieldError('source_item_id') }}
          </p>
        </div>

        <!-- 2. وحدة الصرف (2 عمود) -->
        <div class="lg:col-span-2 flex flex-col space-y-1">
          <label class="text-[11px] font-bold text-text-secondary pr-1">وحدة الصرف</label>
          <div
            class="relative w-full h-9 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
          >
            <select
              v-model="formData.source_item_unit_id"
              :disabled="sourceAvailableUnits.length === 0"
              class="block w-full h-full pr-2.5 pl-6 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" class="bg-surface-section text-text-muted">اختر الوحدة...</option>
              <option
                v-for="unit in sourceAvailableUnits"
                :key="unit.id"
                :value="unit.id"
                class="bg-surface-section text-text-primary"
              >
                {{ unit.unit?.name || unit.name || 'وحدة' }}
              </option>
            </select>
            <span class="absolute left-2 text-text-muted pointer-events-none text-[8px]">▼</span>
          </div>
          <p
            v-if="getFieldError('source_item_unit_id')"
            class="text-danger text-[10px] font-bold pr-1"
          >
            {{ getFieldError('source_item_unit_id') }}
          </p>
        </div>

        <!-- 3. الكمية المصروفة مع شارة الرصيد المتاح (2 عمود) -->
        <div class="lg:col-span-2 flex flex-col space-y-1">
          <div class="flex justify-between items-center pr-1">
            <label class="text-[11px] font-bold text-text-secondary">الكمية المصروفة</label>
            <span
              v-if="formData.source_item_id"
              class="font-mono text-[10px] font-bold"
              :class="sourceAvailableStock > 0 ? 'text-success' : 'text-danger'"
              :title="'الرصيد المتاح بالمستودع: ' + formatSmartNumber(sourceAvailableStock)"
            >
              (متاح: {{ formatSmartNumber(sourceAvailableStock) }})
            </span>
          </div>

          <div
            class="relative w-full h-9 bg-surface-ground border rounded-lg flex items-center transition-all shadow-xs"
            :class="
              isOverStock
                ? 'border-danger/60 focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/20'
                : 'border-surface-border hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
            "
          >
            <input
              type="text"
              inputmode="decimal"
              :value="qtyDisplayValue"
              @focus="onQtyFocus"
              @blur="onQtyBlur"
              @input="onQtyInput"
              placeholder="0"
              class="block w-full h-full px-2 text-center font-mono font-black text-xs bg-transparent text-text-primary focus:outline-none"
            />
            <span
              class="absolute left-2 text-text-muted text-[10px] font-bold pointer-events-none select-none"
            >
              {{ currentUnitName }}
            </span>
          </div>
          <p v-if="getFieldError('source_quantity')" class="text-danger text-[10px] font-bold pr-1">
            {{ getFieldError('source_quantity') }}
          </p>
        </div>

        <!-- 4. تكلفة الوحدة مع زر القفل (2 عمود) -->
        <div class="lg:col-span-2 flex flex-col space-y-1">
          <div class="flex justify-between items-center pr-1">
            <label class="text-[11px] font-bold text-text-secondary">تكلفة الوحدة</label>
            <button
              type="button"
              tabindex="-1"
              @click="toggleCostLock"
              class="text-[9px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
              :class="isCostUnlocked ? 'text-warning' : 'text-text-muted hover:text-primary'"
              :title="isCostUnlocked ? 'قفل واعتماد الحساب التلقائي' : 'انقر لتعديل التكلفة يدوياً'"
            >
              <span>{{ isCostUnlocked ? '🔓' : '🔒' }}</span>
            </button>
          </div>

          <div
            class="relative w-full h-9 rounded-lg flex items-center transition-all shadow-xs"
            :class="
              isCostUnlocked
                ? 'bg-surface-ground border border-warning/60 focus-within:border-warning focus-within:ring-2 focus-within:ring-warning/20'
                : 'bg-surface-ground/60 border border-surface-border/60'
            "
          >
            <input
              type="text"
              inputmode="decimal"
              :readonly="!isCostUnlocked"
              :value="costDisplayValue"
              @focus="onCostFocus"
              @blur="onCostBlur"
              @input="onCostInput"
              placeholder="0"
              class="block w-full h-full px-2 text-center font-mono font-bold text-xs bg-transparent text-text-primary focus:outline-none"
              :class="{ 'cursor-not-allowed opacity-75': !isCostUnlocked }"
            />
          </div>
          <p
            v-if="getFieldError('source_unit_cost')"
            class="text-danger text-[10px] font-bold pr-1"
          >
            {{ getFieldError('source_unit_cost') }}
          </p>
        </div>

        <!-- 5. إجمالي تكلفة الخام المراد توزيعها (2 عمود) -->
        <div class="lg:col-span-2 flex flex-col space-y-1">
          <label class="text-[11px] font-bold text-text-secondary pr-1">إجمالي التكلفة</label>
          <div
            class="w-full h-9 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between px-2.5 text-primary shadow-xs select-none"
          >
            <span class="text-[10px] font-bold text-primary/80">الإجمالي:</span>
            <span class="font-mono text-xs font-black tracking-wide">
              {{ formatSmartNumber(formData.source_total_cost || 0) }}
            </span>
          </div>
          <p
            v-if="getFieldError('source_total_cost')"
            class="text-danger text-[10px] font-bold pr-1"
          >
            {{ getFieldError('source_total_cost') }}
          </p>
        </div>
      </div>
    </div>

    <!-- قائمة المقترحات الطافية لاختيار الصنف الخام عبر Teleport -->
    <Teleport to="body">
      <div
        v-if="isDropdownOpen && searchResults.length > 0"
        :style="dropdownStyle"
        class="fixed bg-surface-section border border-surface-border rounded-xl shadow-2xl z-[9999] max-h-60 overflow-y-auto divide-y divide-surface-border/60 text-right font-sans transition-all"
        dir="rtl"
      >
        <div
          v-for="(item, pIndex) in searchResults"
          :key="item.id"
          :ref="(el) => setDropdownItemRef(el, pIndex)"
          @mousedown.prevent="selectSourceItem(item)"
          @mouseenter="highlightedIndex = pIndex"
          class="p-2.5 cursor-pointer flex items-center justify-between transition-colors"
          :class="
            highlightedIndex === pIndex
              ? 'bg-primary/10 border-r-4 border-primary'
              : 'hover:bg-surface-ground'
          "
        >
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-text-primary">{{ item.name }}</span>
              <span
                v-if="item.matched_barcode"
                class="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-mono font-bold border border-primary/25"
              >
                باركود: {{ item.matched_barcode }}
              </span>
            </div>

            <div class="flex items-center gap-3 text-[10px] text-text-muted font-mono">
              <span>كود: PRD-{{ item.id }}</span>
              <span v-if="item.units?.[0]?.unit?.name" class="font-sans text-text-secondary">
                الوحدة: {{ item.units[0].unit.name }}
              </span>
              <span class="font-sans font-bold text-info">
                الرصيد: {{ formatSmartNumber(item.current_stock ?? item.stock ?? 0) }}
              </span>
            </div>
          </div>

          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded transition-all shadow-xs"
            :class="
              highlightedIndex === pIndex
                ? 'bg-primary text-white'
                : 'text-primary bg-primary/10 border border-primary/20'
            "
          >
            اختيار ↵
          </span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import StoresDropdown from '@/components/forms/StoresDropdown.vue'
import { useItemStore } from '@/stores/itemStore'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  sourceAvailableUnits: { type: Array, default: () => [] },
  sourceAvailableStock: { type: Number, default: 0 },
  validationErrors: { type: Object, default: () => null },
})

const itemStore = useItemStore()

const formatSmartNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  }).format(num)
}

// 1. فهرسة الأصناف في الذاكرة للبحث الفوري والباركود
const normalizedItems = computed(() => {
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
      all_barcodes: allBarcodes,
    }
  })
})

// 2. إدارة بحث الصنف الخام المباشر والمنسدلة
const searchInputContainerRef = ref(null)
const sourceItemSearchText = ref('')
const isDropdownOpen = ref(false)
const searchResults = ref([])
const highlightedIndex = ref(0)
const dropdownItemRefs = ref([])

const setDropdownItemRef = (el, idx) => {
  if (el) dropdownItemRefs.value[idx] = el
}

const dropdownStyle = ref({
  top: 'auto',
  bottom: 'auto',
  right: '0px',
  width: '380px',
})

const updateDropdownPosition = () => {
  if (!searchInputContainerRef.value) return
  const rect = searchInputContainerRef.value.getBoundingClientRect()
  const dropdownHeight = 240
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  const shouldOpenUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow
  const width = Math.max(rect.width, 360)
  const rightOffset = Math.max(10, window.innerWidth - rect.right)

  if (shouldOpenUpwards) {
    dropdownStyle.value = {
      top: 'auto',
      bottom: `${window.innerHeight - rect.top + 4}px`,
      right: `${rightOffset}px`,
      width: `${width}px`,
    }
  } else {
    dropdownStyle.value = {
      top: `${rect.bottom + 4}px`,
      bottom: 'auto',
      right: `${rightOffset}px`,
      width: `${width}px`,
    }
  }
}

const executeSearch = (text) => {
  const clean = text ? text.trim().toLowerCase() : ''
  if (!clean) {
    searchResults.value = []
    isDropdownOpen.value = false
    return
  }

  const results = []
  for (const it of normalizedItems.value) {
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

  searchResults.value = results
  highlightedIndex.value = 0
  isDropdownOpen.value = results.length > 0
  updateDropdownPosition()
}

const onSearchInputFocus = (event) => {
  if (event.target && typeof event.target.select === 'function') {
    event.target.select()
  }
  executeSearch(sourceItemSearchText.value)
}

const onSearchInput = () => {
  if (formData.value.source_item_id) {
    formData.value.source_item_id = ''
    formData.value.source_item_unit_id = ''
  }
  executeSearch(sourceItemSearchText.value)
}

const closeSearchDropdownDelayed = () => {
  setTimeout(() => {
    isDropdownOpen.value = false
    if (formData.value.source_item_id) {
      const matched = normalizedItems.value.find((it) => it.id === formData.value.source_item_id)
      if (matched) sourceItemSearchText.value = matched.name
    }
  }, 200)
}

const selectSourceItem = (item) => {
  formData.value.source_item_id = item.id
  sourceItemSearchText.value = item.name
  formData.value.source_item_unit_id = item.units?.[0]?.id || ''
  isDropdownOpen.value = false
}

const clearSourceItem = () => {
  formData.value.source_item_id = ''
  formData.value.source_item_unit_id = ''
  sourceItemSearchText.value = ''
  searchResults.value = []
  isDropdownOpen.value = false
}

const handleSearchKeydown = (event) => {
  if (!isDropdownOpen.value || searchResults.value.length === 0) {
    if (event.key === 'Enter') {
      event.preventDefault()
      executeSearch(sourceItemSearchText.value)
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    highlightedIndex.value = (highlightedIndex.value + 1) % searchResults.value.length
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    highlightedIndex.value =
      (highlightedIndex.value - 1 + searchResults.value.length) % searchResults.value.length
    return
  }

  if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault()
    const selected = searchResults.value[highlightedIndex.value]
    if (selected) selectSourceItem(selected)
  }

  if (event.key === 'Escape') {
    isDropdownOpen.value = false
  }
}

watch(
  () => formData.value.source_item_id,
  (newId) => {
    if (newId && normalizedItems.value.length > 0) {
      const matched = normalizedItems.value.find((it) => it.id === newId)
      if (matched) {
        sourceItemSearchText.value = matched.name
      }
    } else if (!newId) {
      sourceItemSearchText.value = ''
    }
  },
  { immediate: true },
)

watch(
  () => itemStore.items,
  () => {
    if (formData.value.source_item_id && !sourceItemSearchText.value) {
      const matched = normalizedItems.value.find((it) => it.id === formData.value.source_item_id)
      if (matched) sourceItemSearchText.value = matched.name
    }
  },
)

// 3. اسم الوحدة الحالية
const currentUnitName = computed(() => {
  if (!formData.value.source_item_unit_id || !props.sourceAvailableUnits.length) {
    return 'وحدة'
  }
  const matched = props.sourceAvailableUnits.find(
    (u) => u.id === formData.value.source_item_unit_id,
  )
  return matched?.unit?.name || matched?.name || 'وحدة'
})

// 4. التحقق من تجاوز الرصيد المتاح
const isOverStock = computed(() => {
  const qty = Number(formData.value.source_quantity) || 0
  const stock = Number(props.sourceAvailableStock) || 0
  return stock > 0 && qty > stock
})

// 5. إدارة حقل الكمية المصروفة
const isQtyFocused = ref(false)

const qtyDisplayValue = computed(() => {
  if (isQtyFocused.value) {
    return formData.value.source_quantity === 0 || formData.value.source_quantity === null
      ? ''
      : formData.value.source_quantity
  }
  return formatSmartNumber(formData.value.source_quantity)
})

const onQtyFocus = (event) => {
  isQtyFocused.value = true
  if (event.target && typeof event.target.select === 'function') {
    event.target.select()
  }
}

const onQtyBlur = (event) => {
  isQtyFocused.value = false
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  formData.value.source_quantity = val === '' ? 0 : Number(val)
}

const onQtyInput = (event) => {
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  formData.value.source_quantity = val === '' ? 0 : Number(val)
}

// 6. إدارة قفل وتعديل تكلفة الوحدة
const isCostUnlocked = ref(false)
const isCostFocused = ref(false)

const toggleCostLock = () => {
  isCostUnlocked.value = !isCostUnlocked.value
}

const costDisplayValue = computed(() => {
  if (isCostFocused.value) {
    return formData.value.source_unit_cost === 0 || formData.value.source_unit_cost === null
      ? ''
      : formData.value.source_unit_cost
  }
  return formatSmartNumber(formData.value.source_unit_cost)
})

const onCostFocus = (event) => {
  if (!isCostUnlocked.value) return
  isCostFocused.value = true
  if (event.target && typeof event.target.select === 'function') {
    event.target.select()
  }
}

const onCostBlur = (event) => {
  isCostFocused.value = false
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  formData.value.source_unit_cost = val === '' ? 0 : Number(val)
}

const onCostInput = (event) => {
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  formData.value.source_unit_cost = val === '' ? 0 : Number(val)
}

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}

const handleScrollOrResize = () => {
  if (isDropdownOpen.value) updateDropdownPosition()
}

onMounted(() => {
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}
</style>
