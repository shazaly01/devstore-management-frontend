<!--src/views/reports/financial/components/SubLedgerFilterCard.vue-->
<template>
  <AppCard class="relative z-20">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-right font-sans" dir="rtl">
      <!-- اختيار الكيان / الحساب المساعد -->
      <div class="relative col-span-1 md:col-span-2">
        <label class="block text-xs font-bold text-text-secondary uppercase mb-2">
          الكيان / الحساب المساعد المستهدف <span class="text-danger">*</span>
        </label>

        <div class="relative">
          <input
            type="text"
            readonly
            :value="selectedLedgerName"
            @click="toggleDropdown"
            placeholder="اضغط للبحث واختيار (عميل، مورد، بنك، خزنة، مصمم)..."
            class="w-full h-10 px-3 pl-8 bg-surface-ground border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-bold cursor-pointer text-right transition-all outline-none shadow-sm"
            required
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span class="text-text-muted text-[10px]">▼</span>
          </div>
        </div>

        <!-- القائمة المنسدلة للبحث والتصنيف -->
        <div
          v-if="isDropdownOpen"
          class="absolute left-0 right-0 z-50 mt-1.5 w-full bg-surface-section border border-surface-border rounded-xl shadow-2xl p-3 space-y-3 text-right font-sans"
        >
          <!-- تبويبات التصنيف -->
          <div
            class="flex flex-wrap gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border"
          >
            <button
              type="button"
              @click="activeTab = 'all'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-2 rounded-md font-bold transition-all text-center cursor-pointer',
                activeTab === 'all'
                  ? 'bg-surface-section text-text-primary shadow-xs border border-surface-border'
                  : 'text-text-muted hover:text-text-primary',
              ]"
            >
              الكل
            </button>
            <button
              type="button"
              @click="activeTab = 'App\\Models\\Customer'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-2 rounded-md font-bold transition-all text-center cursor-pointer',
                activeTab === 'App\\Models\\Customer'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-primary',
              ]"
            >
              العملاء
            </button>
            <button
              type="button"
              @click="activeTab = 'App\\Models\\Supplier'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-2 rounded-md font-bold transition-all text-center cursor-pointer',
                activeTab === 'App\\Models\\Supplier'
                  ? 'bg-warning text-white shadow-xs'
                  : 'text-text-muted hover:text-warning',
              ]"
            >
              الموردين
            </button>
            <button
              type="button"
              @click="activeTab = 'App\\Models\\Bank'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-2 rounded-md font-bold transition-all text-center cursor-pointer',
                activeTab === 'App\\Models\\Bank'
                  ? 'bg-info text-white shadow-xs'
                  : 'text-text-muted hover:text-info',
              ]"
            >
              البنوك
            </button>
            <button
              type="button"
              @click="activeTab = 'App\\Models\\Treasury'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-2 rounded-md font-bold transition-all text-center cursor-pointer',
                activeTab === 'App\\Models\\Treasury'
                  ? 'bg-success text-white shadow-xs'
                  : 'text-text-muted hover:text-success',
              ]"
            >
              الخزائن
            </button>
            <button
              type="button"
              @click="activeTab = 'App\\Models\\User'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-2 rounded-md font-bold transition-all text-center cursor-pointer',
                activeTab === 'App\\Models\\User'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-primary',
              ]"
            >
              المصممون
            </button>
          </div>

          <!-- حقل البحث النصي -->
          <input
            type="text"
            v-model="searchQuery"
            ref="searchInputRef"
            placeholder="اكتب اسم الحساب أو الكيان للبحث الفوري..."
            class="block w-full h-9 px-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary placeholder:text-text-muted focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium transition-all shadow-xs"
          />

          <div v-if="isDataLoading" class="text-center py-4 text-xs text-text-muted">
            جاري تحديث الحسابات المساعدة من الخادم...
          </div>

          <!-- قائمة النتائج -->
          <ul
            v-else
            class="max-h-48 overflow-y-auto divide-y divide-surface-border text-xs text-right"
          >
            <li v-for="item in filteredSubLedgers" :key="item.composite_key">
              <button
                type="button"
                @click="selectLedger(item)"
                class="w-full text-right px-3 py-2.5 hover:bg-surface-ground flex justify-between items-center transition-colors rounded-lg cursor-pointer"
              >
                <span class="font-bold text-text-primary">{{ item.name }}</span>
                <span
                  :class="[
                    'text-[10px] px-2 py-0.5 rounded-full border font-bold font-sans',
                    item.badgeClass,
                  ]"
                >
                  {{ item.displayType }}
                </span>
              </button>
            </li>
            <li
              v-if="filteredSubLedgers.length === 0"
              class="text-center py-4 text-text-muted text-xs"
            >
              لا توجد نتائج مطابقة للبحث أو التصنيف الحالي
            </li>
          </ul>
        </div>
      </div>

      <!-- من تاريخ -->
      <div>
        <label class="block text-xs font-bold text-text-secondary uppercase mb-2">من تاريخ</label>
        <input
          type="date"
          v-model="localFilters.from_date"
          class="block w-full h-10 px-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-bold font-mono outline-none transition-all cursor-pointer shadow-sm"
        />
      </div>

      <!-- إلى تاريخ -->
      <div>
        <label class="block text-xs font-bold text-text-secondary uppercase mb-2">إلى تاريخ</label>
        <input
          type="date"
          v-model="localFilters.to_date"
          class="block w-full h-10 px-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-bold font-mono outline-none transition-all cursor-pointer shadow-sm"
        />
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'

const props = defineProps({
  subLedgersList: { type: Array, required: true },
  isDataLoading: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['fetch'])

const localFilters = ref({
  sub_ledger_type: '',
  sub_ledger_id: '',
  from_date: '',
  to_date: '',
})

const isDropdownOpen = ref(false)
const activeTab = ref('all')
const searchQuery = ref('')
const selectedLedgerName = ref('')
const searchInputRef = ref(null)

const filteredSubLedgers = computed(() => {
  return props.subLedgersList.filter((item) => {
    const matchesTab = activeTab.value === 'all' || item.type === activeTab.value
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesTab && matchesSearch
  })
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

const selectLedger = (item) => {
  localFilters.value.sub_ledger_type = item.type
  localFilters.value.sub_ledger_id = item.id
  selectedLedgerName.value = `${item.name} (${item.displayType})`
  isDropdownOpen.value = false
  searchQuery.value = ''
}

const emitFetch = () => {
  if (!localFilters.value.sub_ledger_type || !localFilters.value.sub_ledger_id) return

  const cleanFilters = {
    sub_ledger_type: localFilters.value.sub_ledger_type,
    sub_ledger_id: localFilters.value.sub_ledger_id,
  }
  if (localFilters.value.from_date) cleanFilters.from_date = localFilters.value.from_date
  if (localFilters.value.to_date) cleanFilters.to_date = localFilters.value.to_date

  emit('fetch', cleanFilters)
}

watch(
  localFilters,
  () => {
    emitFetch()
  },
  { deep: true },
)
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
