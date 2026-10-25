<!--src/components/ui/SmartSearchGrid.vue-->
<template>
  <div class="relative w-full" ref="containerRef">
    <div class="relative">
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          aria-hidden="true"
          class="w-5 h-5 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input
        ref="inputRef"
        type="text"
        v-model="searchQuery"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="openDropdown"
        :placeholder="placeholder"
        class="block w-full p-3 pr-10 text-sm border rounded-lg transition-all shadow-sm outline-none bg-surface-section border-surface-border text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
        autocomplete="off"
      />
    </div>

    <!-- قائمة النتائج المنسدلة -->
    <div
      v-if="isOpen && filteredData.length > 0"
      class="absolute z-50 w-full mt-1 bg-surface-section border border-surface-border rounded-xl shadow-2xl max-h-80 overflow-y-auto"
    >
      <table class="w-full text-sm text-right">
        <thead
          class="text-xs uppercase bg-surface-ground border-b border-surface-border text-text-secondary sticky top-0 z-10 shadow-sm"
        >
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              class="px-4 py-3 font-bold"
              :class="col.widthClass || ''"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/60">
          <tr
            v-for="(item, index) in filteredData"
            :key="item.id ?? index"
            @click="selectItem(item)"
            @mouseover="highlightedIndex = index"
            :class="[
              'cursor-pointer transition-colors',
              highlightedIndex === index
                ? 'bg-primary/10 text-primary font-bold'
                : 'hover:bg-surface-ground text-text-primary',
            ]"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-2.5 font-medium"
              :class="highlightedIndex === index ? 'text-primary' : 'text-text-primary'"
            >
              {{ getDisplayValue(item, col.key) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- حالة التحميل في البحث الخادمي -->
    <div
      v-if="isOpen && serverSearch && loading"
      class="absolute z-50 w-full mt-1 bg-surface-section border border-surface-border rounded-xl shadow-xl p-4 text-center text-text-muted text-xs font-semibold"
      role="status"
    >
      جارٍ البحث عن الأصناف...
    </div>

    <!-- التحقق من الحد الأدنى لطول البحث الخادمي -->
    <div
      v-if="
        isOpen &&
        serverSearch &&
        searchQuery.trim().length > 0 &&
        searchQuery.trim().length < minSearchLength &&
        !loading
      "
      class="absolute z-50 w-full mt-1 bg-surface-section border border-surface-border rounded-xl shadow-xl p-4 text-center text-text-muted text-xs font-semibold"
    >
      أدخل {{ minSearchLength }} أحرف على الأقل لبدء البحث.
    </div>

    <!-- رسالة خطأ البحث الخادمي -->
    <div
      v-if="
        isOpen && serverSearch && error && !loading && searchQuery.trim().length >= minSearchLength
      "
      class="absolute z-50 w-full mt-1 bg-surface-section border border-surface-border rounded-xl shadow-xl p-4 text-center text-danger text-xs font-semibold"
      role="alert"
    >
      {{ error }}
    </div>

    <!-- رسالة عدم وجود نتائج -->
    <div
      v-if="
        isOpen &&
        searchQuery &&
        filteredData.length === 0 &&
        !loading &&
        !error &&
        (!serverSearch || searchQuery.trim().length >= minSearchLength)
      "
      class="absolute z-50 w-full mt-1 bg-surface-section border border-surface-border rounded-xl shadow-xl p-4 text-center text-text-muted text-xs font-semibold"
    >
      لا توجد نتائج مطابقة لـ "<span class="font-bold text-text-primary">{{ searchQuery }}</span
      >"
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  searchKeys: { type: Array, required: true },
  placeholder: { type: String, default: 'ابحث بالاسم أو الباركود...' },
  serverSearch: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  minSearchLength: { type: Number, default: 2 },
  debounceMs: { type: Number, default: 300 },
  displayKey: { type: String, default: 'name' },
})

const emit = defineEmits(['select', 'search', 'clear'])

const inputRef = ref(null)
const containerRef = ref(null)
const searchQuery = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(0)
let searchDebounceTimer = null

const getNestedValue = (obj, path) => {
  if (!obj || !path) return null
  const parts = path.split('.')
  let current = obj

  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) return null

    if (Array.isArray(current)) {
      const subKey = parts.slice(i).join('.')
      return current.flatMap((item) => getNestedValue(item, subKey)).filter(Boolean)
    }

    current = current[parts[i]]
  }

  return current
}

const getDisplayValue = (item, key) => {
  const val = getNestedValue(item, key)
  if (val === null || val === undefined || val === '') return '---'
  if (Array.isArray(val)) return val.join(', ')
  return val
}

const findExactMatch = (query) => {
  if (!query) return null
  const cleanQuery = String(query).replace(/\s+/g, '').toLowerCase()

  return props.data.find((item) => {
    if (Array.isArray(item.all_barcodes) && item.all_barcodes.length > 0) {
      const barcodeFound = item.all_barcodes.some((b) => {
        const strBarcode = String(typeof b === 'object' ? b.barcode : b)
          .replace(/\s+/g, '')
          .toLowerCase()
        return strBarcode === cleanQuery
      })
      if (barcodeFound) return true
    }

    if (Array.isArray(item.barcodes) && item.barcodes.length > 0) {
      const barcodeFound = item.barcodes.some((b) => {
        const strBarcode = String(typeof b === 'object' ? b.barcode : b)
          .replace(/\s+/g, '')
          .toLowerCase()
        return strBarcode === cleanQuery
      })
      if (barcodeFound) return true
    }

    if (item.code && String(item.code).replace(/\s+/g, '').toLowerCase() === cleanQuery) return true
    if (item.id && String(item.id) === cleanQuery) return true
    if (item.id_display && String(item.id_display).replace(/\s+/g, '').toLowerCase() === cleanQuery)
      return true

    return false
  })
}

const filteredData = computed(() => {
  if (props.serverSearch) {
    if (searchQuery.value.trim().length < props.minSearchLength) return []
    return props.data.slice(0, 50)
  }

  if (!searchQuery.value.trim()) return []

  const query = searchQuery.value.toLowerCase().trim()

  return props.data
    .filter((item) => {
      return props.searchKeys.some((key) => {
        const val = getNestedValue(item, key)
        if (val === null || val === undefined) return false

        if (Array.isArray(val)) {
          return val.some((v) => {
            const strVal = typeof v === 'object' ? v.barcode || JSON.stringify(v) : String(v)
            return strVal.toLowerCase().includes(query)
          })
        }

        return String(val).toLowerCase().includes(query)
      })
    })
    .slice(0, 50)
})

const handleInput = () => {
  const query = searchQuery.value.trim()
  highlightedIndex.value = 0

  if (props.serverSearch) {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = null
    }

    emit('clear')
    emit('search', '')

    if (!query) {
      isOpen.value = false
      return
    }

    isOpen.value = true
    if (query.length < props.minSearchLength) return

    searchDebounceTimer = setTimeout(() => {
      emit('search', query)
      searchDebounceTimer = null
    }, props.debounceMs)
    return
  }

  if (!query) {
    isOpen.value = false
    return
  }

  isOpen.value = true
}

const openDropdown = () => {
  if (searchQuery.value.trim()) {
    isOpen.value = true
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()

    const rawValue = e.target?.value || searchQuery.value || ''
    const query = String(rawValue).trim()

    if (!query) return

    const exactMatch = findExactMatch(query)

    if (exactMatch) {
      selectItem(exactMatch)
      return
    }

    if (filteredData.value.length > 0) {
      const targetIndex =
        highlightedIndex.value >= 0 && highlightedIndex.value < filteredData.value.length
          ? highlightedIndex.value
          : 0
      selectItem(filteredData.value[targetIndex])
    }
  } else if (e.key === 'ArrowDown') {
    if (!isOpen.value) return
    e.preventDefault()
    if (highlightedIndex.value < filteredData.value.length - 1) highlightedIndex.value++
  } else if (e.key === 'ArrowUp') {
    if (!isOpen.value) return
    e.preventDefault()
    if (highlightedIndex.value > 0) highlightedIndex.value--
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

const selectItem = (item) => {
  if (!item) return

  emit('select', item)
  searchQuery.value = props.serverSearch ? String(getNestedValue(item, props.displayKey) ?? '') : ''
  isOpen.value = false
  highlightedIndex.value = 0
}

const focus = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
})

defineExpose({
  focus,
})
</script>
