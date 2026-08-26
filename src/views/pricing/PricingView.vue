<!-- src/views/pricing/PricingView.vue -->
<template>
  <div class="space-y-6">
    <!-- 1. شريط العنوان وأسعار الصرف السريعة -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة وسياسات التسعير المتقدم</h1>
        <p class="text-sm text-text-muted mt-1">
          محرك احتساب وهوامش الأسعار، مؤشرات الصرف، ومراقبة تآكل الربحية
        </p>
      </div>

      <!-- بطاقات أسعار الصرف الحية + زر تحديث الصرف السريع -->
      <div class="flex flex-wrap items-center gap-3">
        <div
          v-for="curr in activeForeignCurrencies"
          :key="curr.id"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-border bg-surface-section shadow-xs"
        >
          <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span class="text-xs font-semibold text-text-secondary"
            >{{ curr.name }} ({{ curr.code }}):</span
          >
          <span class="text-xs font-bold font-mono text-text-primary">
            {{
              curr.latest_exchange_rate ? formatNumber(curr.latest_exchange_rate.rate) : 'غير مسجل'
            }}
          </span>
        </div>

        <AppButton
          v-if="authStore.can('pricing.manage_exchange_rates')"
          type="button"
          variant="secondary"
          @click="isExchangeRateModalOpen = true"
          class="text-xs flex items-center gap-1.5"
        >
          <svg
            class="w-4 h-4 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>تحديث سعر صرف</span>
        </AppButton>
      </div>
    </div>

    <!-- 2. أزرار التبويبات الرئيسية (Tabbed Navigation) -->
    <div class="border-b border-surface-border">
      <nav class="flex space-x-6 space-x-reverse" aria-label="Tabs">
        <!-- تبويب (1): إعادة التسعير الجماعي -->
        <button
          type="button"
          @click="activeTab = 'bulk'"
          :class="[
            'pb-3 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'bulk'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary hover:border-surface-border',
          ]"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span>تحديث أسعار البيع</span>
          <span
            v-if="previewItems.length > 0"
            class="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary font-mono"
          >
            {{ previewItems.length }}
          </span>
        </button>

        <!-- تبويب (2): تأصيل وتهيئة التكلفة الأجنبية [جديد] -->
        <button
          type="button"
          @click="activeTab = 'foreign_cost'"
          :class="[
            'pb-3 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'foreign_cost'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary hover:border-surface-border',
          ]"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span> تثبيت تكلفة العملة للأصناف </span>
          <span
            v-if="foreignCostPreviewItems.length > 0"
            class="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary font-mono"
          >
            {{ foreignCostPreviewItems.length }}
          </span>
        </button>

        <!-- تبويب (3): رادار تآكل الهوامش -->
        <button
          type="button"
          @click="switchTab('radar')"
          :class="[
            'pb-3 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'radar'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary hover:border-surface-border',
          ]"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>كاشف الأصناف الخاسرة</span>
          <span
            v-if="radarItems.length > 0"
            class="px-2 py-0.5 text-xs rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-mono font-bold"
          >
            {{ radarItems.length }}
          </span>
        </button>

        <!-- تبويب (4): سجل تغييرات الأسعار -->
        <button
          type="button"
          @click="switchTab('history')"
          :class="[
            'pb-3 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary hover:border-surface-border',
          ]"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>الأرشيف والتراجع</span>
        </button>
      </nav>
    </div>

    <!-- 3. المحتوى المتغير للتبويبات -->

    <!-- تبويب (1): محرك إعادة التسعير الجماعي[cite: 18] -->
    <div v-show="activeTab === 'bulk'" class="space-y-6">
      <BulkRepriceFilter
        :categories="categories"
        :currencies="currencies"
        :is-loading="pricingStore.loading"
        :validation-errors="pricingStore.validationErrors"
        @preview="handlePreview"
        @reset="handleResetPreview"
      />

      <BulkRepriceTable
        v-if="previewItems.length > 0"
        :preview-data="previewItems"
        :is-loading="pricingStore.loading"
        :is-saving="isApplying"
        :selected-currency-id="appliedCriteria.currency_id"
        :selected-exchange-rate="appliedCriteria.exchange_rate"
        @apply="handleApplyPricing"
        @cancel="handleResetPreview"
      />

      <div
        v-else-if="!pricingStore.loading"
        class="p-12 text-center rounded-xl border-2 border-dashed border-surface-border bg-surface-ground/30"
      >
        <div
          class="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 class="text-base font-bold text-text-primary">جدول المعاينة جاهز</h3>
        <p class="text-xs text-text-muted mt-1 max-w-md mx-auto">
          قم بتحديد معيار إعادة التسعير (سعر الصرف، النسبة، أو هامش الربح) من الشريط أعلاه واضغط على
          "معاينة الأسعار المقترحة" لمراجعة التعديلات واعتمادها.
        </p>
      </div>
    </div>

    <!-- تبويب (2): تأصيل وتهيئة التكلفة بالعملة الأجنبية [جديد] -->
    <div v-show="activeTab === 'foreign_cost'" class="space-y-6">
      <ForeignCostFilter
        :categories="categories"
        :currencies="currencies"
        :is-loading="pricingStore.loading"
        :validation-errors="pricingStore.validationErrors"
        @preview="handleForeignCostPreview"
        @reset="handleResetForeignCostPreview"
      />

      <ForeignCostTable
        v-if="foreignCostPreviewItems.length > 0"
        :preview-data="foreignCostPreviewItems"
        :is-loading="pricingStore.loading"
        :is-saving="isApplyingForeignCost"
        :selected-currency-id="appliedForeignCriteria.currency_id"
        :selected-exchange-rate="appliedForeignCriteria.exchange_rate"
        @apply="handleApplyForeignCost"
        @cancel="handleResetForeignCostPreview"
      />

      <div
        v-else-if="!pricingStore.loading"
        class="p-12 text-center rounded-xl border-2 border-dashed border-surface-border bg-surface-ground/30"
      >
        <div
          class="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 class="text-base font-bold text-text-primary">أداة تأصيل التكلفة الأجنبية جاهزة</h3>
        <p class="text-xs text-text-muted mt-1 max-w-md mx-auto">
          اختر طريقة الاحتساب وسعر الصرف المرجعي واضغط على "توليد ومطابقة التكاليف" لحساب التكلفة
          بالعملة الأجنبية لكافة الأصناف دفعة واحدة.
        </p>
      </div>
    </div>

    <!-- تبويب (3): رادار تآكل الهوامش[cite: 18] -->
    <div v-show="activeTab === 'radar'">
      <MarginRadarTable
        :items="radarItems"
        :categories="categories"
        :is-loading="pricingStore.loading"
        @filter-change="loadRadarData"
        @refresh="loadRadarData"
      />
    </div>

    <!-- تبويب (4): سجل تغييرات الأسعار التاريخي[cite: 18] -->
    <div v-show="activeTab === 'history'">
      <PriceHistoryTable
        :items="historyItems"
        :pagination="historyPagination"
        :is-loading="pricingStore.loading"
        @filter="handleHistoryFilter"
        @page-change="loadHistoryData"
        @rollback-batch="openRollbackModal"
      />
    </div>

    <!-- 4. النوافذ المنبثقة للعمليات السريعة[cite: 18] -->

    <!-- نافذة تسجيل سعر الصرف السريع[cite: 18] -->
    <ExchangeRateModal
      v-model="isExchangeRateModalOpen"
      :currencies="currencies"
      :is-saving="exchangeRateStore.loading"
      :validation-errors="exchangeRateStore.validationErrors"
      @save="handleSaveExchangeRate"
    />

    <!-- نافذة التراجع عن دفعة التسعير[cite: 18] -->
    <RollbackModal
      v-model="isRollbackModalOpen"
      :batch-id="selectedRollbackBatchId"
      :is-saving="isRollingBack"
      :validation-errors="pricingStore.validationErrors"
      @rollback="handleConfirmRollback"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import { usePricingStore } from '@/stores/pricingStore'
import { useExchangeRateStore } from '@/stores/exchangeRateStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useAuthStore } from '@/stores/authStore'

import AppButton from '@/components/ui/AppButton.vue'
import BulkRepriceFilter from './components/BulkRepriceFilter.vue'
import BulkRepriceTable from './components/BulkRepriceTable.vue'
import ForeignCostFilter from './components/ForeignCostFilter.vue'
import ForeignCostTable from './components/ForeignCostTable.vue'
import MarginRadarTable from './components/MarginRadarTable.vue'
import PriceHistoryTable from './components/PriceHistoryTable.vue'
import RollbackModal from './components/RollbackModal.vue'
import ExchangeRateModal from './components/ExchangeRateModal.vue'

const toast = useToast()
const authStore = useAuthStore()
const pricingStore = usePricingStore()
const exchangeRateStore = useExchangeRateStore()
const categoryStore = useCategoryStore()

const { previewItems, foreignCostPreviewItems, radarItems, historyItems, historyPagination } =
  storeToRefs(pricingStore)
const { currencies } = storeToRefs(exchangeRateStore)
const { categories } = storeToRefs(categoryStore)

const activeTab = ref('bulk')
const isExchangeRateModalOpen = ref(false)
const isRollbackModalOpen = ref(false)
const selectedRollbackBatchId = ref('')
const isApplying = ref(false)
const isApplyingForeignCost = ref(false)
const isRollingBack = ref(false)

const appliedCriteria = ref({
  currency_id: null,
  exchange_rate: null,
})

const appliedForeignCriteria = ref({
  currency_id: null,
  exchange_rate: null,
})

const activeHistoryFilters = ref({})

const activeForeignCurrencies = computed(() => {
  return (currencies.value || []).filter((c) => !c.is_default && c.is_active)
})

const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'radar' && radarItems.value.length === 0) {
    loadRadarData()
  } else if (tab === 'history' && historyItems.value.length === 0) {
    loadHistoryData(1)
  }
}

const loadRadarData = (filters = {}) => {
  pricingStore.fetchRadar(filters).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات رادار الهوامش.')
  })
}

const loadHistoryData = (page = 1) => {
  pricingStore.fetchHistory(page, activeHistoryFilters.value).catch(() => {
    toast.error('حدث خطأ أثناء تحميل سجل تاريخ الأسعار.')
  })
}

const handleHistoryFilter = (filters) => {
  activeHistoryFilters.value = filters
  loadHistoryData(1)
}

// معالجات التسعير الجماعي
const handlePreview = async (payload) => {
  appliedCriteria.value = {
    currency_id: payload.currency_id || null,
    exchange_rate: payload.exchange_rate || null,
  }

  try {
    const items = await pricingStore.fetchPreview(payload)
    if (items.length === 0) {
      toast.info('لم يتم العثور على أصناف تطابق معايير التسعير المحددة.')
    } else {
      toast.success(`تم احتساب مقترحات الأسعار بنجاح لـ (${items.length}) صنف.`)
    }
  } catch (err) {
    if (err.response?.status !== 422) {
      toast.error(pricingStore.error || 'فشل في توليد معاينة الأسعار.')
    }
  }
}

const handleResetPreview = () => {
  pricingStore.clearPreview()
  appliedCriteria.value = {
    currency_id: null,
    exchange_rate: null,
  }
}

const handleApplyPricing = async (payload) => {
  isApplying.value = true
  try {
    const response = await pricingStore.applyReprice(payload)
    toast.success(response.message || 'تم اعتماد وتطبيق الأسعار الجديدة بنجاح!')
    if (activeTab.value === 'radar') {
      loadRadarData()
    }
  } catch (err) {
    if (err.response?.status !== 422) {
      toast.error(pricingStore.error || 'حدث خطأ أثناء حفظ وتطبيق الأسعار الجديدة.')
    }
  } finally {
    isApplying.value = false
  }
}

// معالجات أداة تأصيل التكلفة الأجنبية
const handleForeignCostPreview = async (payload) => {
  appliedForeignCriteria.value = {
    currency_id: payload.currency_id || null,
    exchange_rate: payload.exchange_rate || null,
  }

  try {
    const items = await pricingStore.fetchForeignCostPreview(payload)
    if (items.length === 0) {
      toast.info('جميع الأصناف مؤصلة مسبقاً أو لا توجد أصناف تطابق الشروط.')
    } else {
      toast.success(`تم توليد واحتساب التكاليف الأجنبية لـ (${items.length}) وحدة.`)
    }
  } catch (err) {
    if (err.response?.status !== 422) {
      toast.error(pricingStore.error || 'فشل في احتساب التكلفة بالعملة الأجنبية.')
    }
  }
}

const handleResetForeignCostPreview = () => {
  pricingStore.clearPreview()
  appliedForeignCriteria.value = {
    currency_id: null,
    exchange_rate: null,
  }
}

const handleApplyForeignCost = async (payload) => {
  isApplyingForeignCost.value = true
  try {
    const response = await pricingStore.applyForeignCost(payload)
    toast.success(response.message || 'تم تثبيت التكلفة الأجنبية لكافة الأصناف بنجاح!')
    handleResetForeignCostPreview()
  } catch (err) {
    if (err.response?.status !== 422) {
      toast.error(pricingStore.error || 'حدث خطأ أثناء حفظ التكلفة الأجنبية.')
    }
  } finally {
    isApplyingForeignCost.value = false
  }
}

const openRollbackModal = (batchId) => {
  selectedRollbackBatchId.value = batchId
  isRollbackModalOpen.value = true
}

const handleConfirmRollback = async (payload) => {
  isRollingBack.value = true
  try {
    const response = await pricingStore.rollbackBatch(payload)
    toast.success(response.message || 'تم التراجع عن الدفعة واستعادة الأسعار السابقة بنجاح.')
    isRollbackModalOpen.value = false
    selectedRollbackBatchId.value = ''
    loadHistoryData(historyPagination.value?.current_page || 1)
  } catch (err) {
    if (err.response?.status !== 422) {
      toast.error(pricingStore.error || 'فشلت عملية التراجع عن دفعة التسعير.')
    }
  } finally {
    isRollingBack.value = false
  }
}

const handleSaveExchangeRate = async (payload) => {
  try {
    const res = await exchangeRateStore.createExchangeRate(payload)
    toast.success(res.message || 'تم تحديث وتسجيل سعر الصرف بنجاح.')
    isExchangeRateModalOpen.value = false
  } catch (err) {
    if (err.response?.status !== 422) {
      toast.error(exchangeRateStore.error || 'حدث خطأ أثناء تسجيل سعر الصرف.')
    }
  }
}

const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00'
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

onMounted(() => {
  exchangeRateStore.fetchCurrencies().catch(() => {})
  categoryStore.fetchCategories(1, { per_page: 1000 }).catch(() => {})
})
</script>
