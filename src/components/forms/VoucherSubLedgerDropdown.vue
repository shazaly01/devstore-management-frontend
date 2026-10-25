<!--src/components/forms/VoucherSubLedgerDropdown.vue-->
<template>
  <div class="relative w-full">
    <!-- عنوان الحقل -->
    <label v-if="label" class="block text-xs font-bold text-text-secondary mb-1.5 pr-1">
      {{ label }}
    </label>

    <!-- الإطار الرئيسي للمنسدلة -->
    <div
      class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 cursor-pointer shadow-sm"
      @click="toggleDropdown"
    >
      <span class="absolute right-3 text-text-muted pointer-events-none z-10">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </span>

      <input
        type="text"
        readonly
        :value="selectedLedgerName"
        placeholder="اضغط لاختيار الحساب المساعد (مورد، عميل، مصروف)..."
        class="block w-full h-full pr-10 pl-10 bg-transparent text-text-primary focus:outline-none text-xs font-bold placeholder:text-text-muted cursor-pointer text-right"
        required
      />

      <span class="absolute left-4 text-text-muted pointer-events-none text-[10px]">▼</span>
    </div>

    <!-- شريط عرض الرصيد اللحظي للحساب المختار -->
    <div
      v-if="props.subLedgerId && currentSelectedBalance !== null"
      class="mt-1.5 flex items-center justify-end pl-1 text-[11px] font-bold animate-fade-in"
    >
      <span class="text-text-muted ml-1">الرصيد الحالي للحساب المحدد:</span>
      <span
        :class="
          currentSelectedBalance < 0
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-emerald-600 dark:text-emerald-400'
        "
      >
        {{ Number(currentSelectedBalance).toLocaleString() }} جنيه
      </span>
    </div>

    <!-- لوحة الخيارات المنسدلة (Dropdown Panel) -->
    <div
      v-if="isDropdownOpen"
      class="absolute right-0 z-50 mt-1 w-full bg-surface-section border border-surface-border rounded-xl shadow-2xl p-3 space-y-3 animate-fade-in"
    >
      <!-- شريط تصنيفات التبويب -->
      <div
        class="flex flex-wrap gap-1 bg-surface-ground border border-surface-border p-1 rounded-lg"
      >
        <button
          type="button"
          @click="activeTab = 'all'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded-md font-bold transition-all text-center cursor-pointer',
            activeTab === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-section',
          ]"
        >
          الكل
        </button>
        <button
          type="button"
          @click="activeTab = 'bank_treasury'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded-md font-bold transition-all text-center cursor-pointer',
            activeTab === 'bank_treasury'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-section',
          ]"
        >
          الخزائن والبنوك
        </button>
        <button
          type="button"
          @click="activeTab = 'expense'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded-md font-bold transition-all text-center cursor-pointer',
            activeTab === 'expense'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-section',
          ]"
        >
          المصروفات
        </button>
        <button
          type="button"
          @click="activeTab = 'supplier'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded-md font-bold transition-all text-center cursor-pointer',
            activeTab === 'supplier'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-section',
          ]"
        >
          الموردين
        </button>
        <button
          type="button"
          @click="activeTab = 'customer'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded-md font-bold transition-all text-center cursor-pointer',
            activeTab === 'customer'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-section',
          ]"
        >
          العملاء
        </button>
        <button
          type="button"
          @click="activeTab = 'designer'"
          :class="[
            'flex-1 text-[11px] py-1.5 px-1 rounded-md font-bold transition-all text-center cursor-pointer',
            activeTab === 'designer'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-section',
          ]"
        >
          المصممون
        </button>
      </div>

      <!-- مربع البحث الداخلي -->
      <input
        type="text"
        v-model="searchQuery"
        ref="searchInputRef"
        placeholder="اكتب اسم الحساب المساعد للبحث الفوري..."
        class="block w-full p-2 border border-surface-border rounded-md bg-surface-ground text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-medium transition-all"
      />

      <!-- مؤشر جلب البيانات -->
      <div v-if="isDataLoading" class="text-center py-4 text-xs text-text-muted font-bold">
        جاري تحديث جلب الحسابات المساعدة...
      </div>

      <!-- قائمة الحسابات المنسابة -->
      <ul
        v-else
        class="max-h-48 overflow-y-auto divide-y divide-surface-border/60 text-xs custom-scrollbar"
      >
        <li v-for="item in filteredSubLedgers" :key="item.composite_key">
          <button
            type="button"
            @click="selectLedger(item)"
            :class="[
              'w-full text-right px-3 py-2.5 flex justify-between items-center transition-colors rounded-lg text-xs font-bold cursor-pointer',
              normalizedSubLedgerType === item.type && props.subLedgerId == item.id
                ? 'bg-primary/10 text-primary font-black'
                : 'text-text-primary hover:bg-surface-ground',
            ]"
          >
            <div class="flex flex-col text-right">
              <span>{{ item.name }}</span>
              <span
                :class="
                  item.balance < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                "
                class="text-[10px] font-bold mt-0.5"
              >
                الرصيد: {{ Number(item.balance).toLocaleString() }} جنيه
              </span>
            </div>
            <span
              :class="['text-[10px] px-2 py-0.5 rounded-full font-bold border', item.badgeClass]"
            >
              {{ item.displayType }}
            </span>
          </button>
        </li>
        <li
          v-if="filteredSubLedgers.length === 0"
          class="text-center py-4 text-text-muted text-xs font-medium"
        >
          لا توجد نتائج مطابقة للبحث أو التصنيف الحالي
        </li>
      </ul>
    </div>

    <!-- رسائل التحقق -->
    <p
      v-if="validationErrors?.sub_ledger_id || validationErrors?.account_id"
      class="text-danger text-[10px] font-bold mt-1 pr-1"
    >
      يرجى تحديد حساب مستهدف صحيح من القائمة
    </p>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useSupplierStore } from '@/stores/supplierStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useExpenseStore } from '@/stores/expenseStore'
import { useUserStore } from '@/stores/userStore'
import { useTreasuryStore } from '@/stores/treasuryStore'
import { useBankStore } from '@/stores/bankStore'

const props = defineProps({
  label: { type: String, default: '' },
  subLedgerType: { type: String, default: '' },
  subLedgerId: { type: [String, Number], default: null },
  accounts: { type: Array, required: true },
  validationErrors: { type: Object, default: null },
})

const emit = defineEmits(['update:subLedgerType', 'update:subLedgerId', 'update:accountId'])

const supplierStore = useSupplierStore()
const customerStore = useCustomerStore()
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const treasuryStore = useTreasuryStore()
const bankStore = useBankStore()

const { suppliers, loading: suppliersLoading } = storeToRefs(supplierStore)
const { customers, loading: customersLoading } = storeToRefs(customerStore)
const { expenses, loading: expensesLoading } = storeToRefs(expenseStore)
const { users: designers, loading: designersLoading } = storeToRefs(userStore)
const { banks, loading: banksLoading } = storeToRefs(bankStore)
const { treasuries, loading: treasuriesLoading } = storeToRefs(treasuryStore)

const isDropdownOpen = ref(false)
const activeTab = ref('all')
const searchQuery = ref('')
const selectedLedgerName = ref('')
const searchInputRef = ref(null)

const normalizedSubLedgerType = computed(() => {
  return props.subLedgerType === 'user' ? 'designer' : props.subLedgerType
})

const isDataLoading = computed(() => {
  return (
    suppliersLoading.value ||
    customersLoading.value ||
    expensesLoading.value ||
    designersLoading.value ||
    banksLoading.value ||
    treasuriesLoading.value
  )
})

const designersAccount = computed(() => {
  return props.accounts.find((acc) => acc.code === '2103') || null
})

onMounted(async () => {
  try {
    const promises = []
    if (expenses.value.length === 0)
      promises.push(expenseStore.fetchExpenses(1, { per_page: 1000 }))
    if (suppliers.value.length === 0)
      promises.push(supplierStore.fetchSuppliers(1, { per_page: 1000 }))
    if (customers.value.length === 0)
      promises.push(customerStore.fetchCustomers(1, { per_page: 1000 }))
    if (designers.value.length === 0)
      promises.push(userStore.fetchUsers(1, { type: 'designer', per_page: 1000 }))
    if (treasuries.value.length === 0)
      promises.push(treasuryStore.fetchTreasuries(1, { per_page: 1000 }))
    if (banks.value.length === 0) promises.push(bankStore.fetchBanks(1, { per_page: 1000 }))

    if (promises.length > 0) {
      await Promise.all(promises)
    }
    syncSelectedLedgerName()
  } catch (err) {
    console.error('Failed to load sub-ledger data for voucher search field:', err)
  }
})

const unifiedSubLedgers = computed(() => {
  const list = []

  expenses.value.forEach((item) => {
    list.push({
      composite_key: `expense:${item.id}`,
      id: item.id,
      type: 'expense',
      account_id: item.account_id,
      name: item.name,
      balance: item.current_balance ?? 0,
      displayType: 'مصروف',
      badgeClass:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
    })
  })

  suppliers.value.forEach((item) => {
    list.push({
      composite_key: `supplier:${item.id}`,
      id: item.id,
      type: 'supplier',
      account_id: item.account_id,
      name: item.name,
      balance: item.current_balance ?? 0,
      displayType: 'مورد',
      badgeClass:
        'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
    })
  })

  customers.value.forEach((item) => {
    list.push({
      composite_key: `customer:${item.id}`,
      id: item.id,
      type: 'customer',
      account_id: item.account_id,
      name: item.name,
      balance: item.current_balance ?? 0,
      displayType: 'عميل',
      badgeClass:
        'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50',
    })
  })

  designers.value.forEach((item) => {
    if (item.type === 'designer') {
      list.push({
        composite_key: `designer:${item.id}`,
        id: item.id,
        type: 'designer',
        account_id: designersAccount.value?.id || '',
        name: item.full_name,
        balance: item.current_balance ?? 0,
        displayType: 'مصمم',
        badgeClass:
          'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50',
      })
    }
  })

  banks.value.forEach((item) => {
    list.push({
      composite_key: `bank:${item.id}`,
      id: item.id,
      type: 'bank',
      account_id: item.account_id,
      name: item.name,
      balance: item.current_balance ?? 0,
      displayType: 'بنك',
      badgeClass:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
    })
  })

  treasuries.value.forEach((item) => {
    list.push({
      composite_key: `treasury:${item.id}`,
      id: item.id,
      type: 'treasury',
      account_id: item.account_id,
      name: item.name,
      balance: item.current_balance ?? 0,
      displayType: 'خزنة',
      badgeClass:
        'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900/50',
    })
  })

  return list
})

const filteredSubLedgers = computed(() => {
  return unifiedSubLedgers.value.filter((item) => {
    const matchesTab =
      activeTab.value === 'all' ||
      (activeTab.value === 'bank_treasury'
        ? item.type === 'bank' || item.type === 'treasury'
        : item.type === activeTab.value)
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesTab && matchesSearch
  })
})

const currentSelectedBalance = computed(() => {
  if (!props.subLedgerType || !props.subLedgerId) return null
  const selected = unifiedSubLedgers.value.find(
    (item) => item.type === normalizedSubLedgerType.value && item.id == props.subLedgerId,
  )
  return selected ? selected.balance : null
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
  let resolvedAccountId = ''

  if (item.type === 'designer') {
    const dynamicAcc = props.accounts.find((a) => a.code === '2103')
    resolvedAccountId = dynamicAcc ? dynamicAcc.id : item.account_id
  } else if (item.type === 'bank') {
    const dynamicAcc = props.accounts.find((a) => a.code === '1102')
    resolvedAccountId = dynamicAcc ? dynamicAcc.id : item.account_id
  } else if (item.type === 'treasury') {
    const dynamicAcc = props.accounts.find((a) => a.code === '1101')
    resolvedAccountId = dynamicAcc ? dynamicAcc.id : item.account_id
  } else {
    resolvedAccountId = item.account_id
  }

  emit('update:subLedgerType', item.type)
  emit('update:subLedgerId', item.id)
  emit('update:accountId', resolvedAccountId)

  selectedLedgerName.value = `${item.name} (${item.displayType})`
  isDropdownOpen.value = false
  searchQuery.value = ''
}

const syncSelectedLedgerName = () => {
  if (props.subLedgerType && props.subLedgerId) {
    const target = unifiedSubLedgers.value.find(
      (item) => item.type === normalizedSubLedgerType.value && item.id == props.subLedgerId,
    )
    if (target) {
      selectedLedgerName.value = `${target.name} (${target.displayType})`
    } else {
      selectedLedgerName.value = 'حساب مساعد تم تحديده مسبقاً'
    }
  } else {
    selectedLedgerName.value = ''
  }
}

watch(
  () => [props.subLedgerType, props.subLedgerId],
  () => {
    syncSelectedLedgerName()
  },
)

watch(
  () => unifiedSubLedgers.value,
  () => {
    syncSelectedLedgerName()
  },
  { deep: true },
)

watch(
  () => [normalizedSubLedgerType.value, props.subLedgerId],
  () => {
    syncSelectedLedgerName()
  },
)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-surface-border));
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-primary));
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
