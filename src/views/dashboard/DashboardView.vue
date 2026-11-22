<!-- src/views/dashboard/DashboardView.vue -->
<template>
  <div
    class="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-text-primary relative overflow-hidden min-h-screen selection:bg-primary/30 font-sans"
    dir="rtl"
  >
    <!-- هالات توهج خلفية -->
    <div
      class="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-40 dark:opacity-100 transition-opacity"
    ></div>
    <div
      class="absolute top-1/3 -left-40 w-96 h-96 bg-info/10 rounded-full blur-[120px] pointer-events-none opacity-30 dark:opacity-80 transition-opacity"
    ></div>

    <!-- 1. الترويسة الزجاجية ثلاثية الأبعاد وشريط الفلاتر -->
    <DashboardHeroHeader
      title="لوحة الإشراف والمؤشرات الإدارية"
      subtitle="متابعة حية ودقيقة للأداء المالي، حركة المبيعات والمشتريات، والرقابة المخزنية."
      :badge="activeDateBadge"
      :icon="Squares2X2Icon"
      :loading="loading"
      :show-reset="hasActiveFilters && authStore.can('dashboard.manager')"
      @refresh="handleRefresh"
      @reset="handleReset"
    >
      <template v-if="authStore.can('dashboard.manager') && stats.date_range?.from" #meta-badges>
        <span
          class="inline-flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-card/90 px-3 py-2 text-xs font-bold text-text-secondary shadow-sm tabular-nums"
        >
          <CalendarDaysIcon class="h-4 w-4 text-primary" />
          <span>{{ stats.date_range.from }}</span>
          <span class="text-text-muted">←</span>
          <span>{{ stats.date_range.to }}</span>
        </span>
      </template>

      <template v-if="authStore.can('dashboard.manager')" #filters>
        <DashboardFilters :key="filterResetKey" :loading="loading" @filter="handleFilterChange" />
      </template>
    </DashboardHeroHeader>

    <!-- 2. حالة التحميل (Shimmer Skeleton) -->
    <DashboardSkeleton v-if="loading" class="relative z-10" />

    <!-- 3. الفضاء التشغيلي الفعلي للمدير -->
    <div v-else-if="authStore.can('dashboard.manager')" class="space-y-6 relative z-10">
      <!-- أولاً: بطاقات المؤشرات الكبرى (KPIs) مع نسب النمو والـ Sparklines -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <DashboardKpiCard
          title="صافي المبيعات"
          :subtitle="`${stats.operational_volume?.total_sales_invoices || 0} فاتورة بيع | ${stats.operational_volume?.total_return_invoices || 0} مرتجع`"
          :value="stats.kpis?.net_sales?.value ?? stats.net_sales_amount"
          :growth-percentage="stats.kpis?.net_sales?.growth_percentage ?? null"
          :sparkline="stats.kpis?.net_sales?.sparkline || []"
          variant="primary"
          :icon="BanknotesIcon"
          :stagger-index="1"
        />

        <DashboardKpiCard
          title="صافي الأرباح التقديرية"
          :subtitle="`الإيرادات: ${formatCompact(stats.kpis?.net_profit?.revenue || 0)} | المصروفات: ${formatCompact(stats.kpis?.net_profit?.expenses || 0)}`"
          :value="stats.kpis?.net_profit?.value ?? 0"
          :growth-percentage="stats.kpis?.net_profit?.growth_percentage ?? null"
          :sparkline="stats.kpis?.net_profit?.sparkline || []"
          variant="emerald"
          :icon="ArrowTrendingUpIcon"
          :stagger-index="2"
        />

        <DashboardKpiCard
          title="صافي المشتريات"
          subtitle="إجمالي التوريدات مطروحاً منها المرتجعات"
          :value="stats.kpis?.net_purchases?.value ?? 0"
          :growth-percentage="stats.kpis?.net_purchases?.growth_percentage ?? null"
          :sparkline="stats.kpis?.net_purchases?.sparkline || []"
          variant="sky"
          :icon="ShoppingCartIcon"
          :stagger-index="3"
        />

        <DashboardKpiCard
          title="السيولة النقدية والبنكية"
          :subtitle="`خزائن: ${formatCompact(stats.kpis?.total_liquidity?.treasuries_balance || 0)} | بنوك: ${formatCompact(stats.kpis?.total_liquidity?.banks_balance || 0)}`"
          :value="stats.kpis?.total_liquidity?.value ?? 0"
          comparison-label="الرصيد اللحظي المتاح"
          variant="indigo"
          :icon="BuildingLibraryIcon"
          :stagger-index="4"
        />
      </div>

      <!-- ثانياً: كبسولات التنبيهات الإجرائية العاجلة -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardAlertPill
          title="نواقص المخزون (حد الطلب)"
          :count="stats.alerts?.reorder_count ?? stats.reorder_level_items?.length ?? 0"
          active-description="أصناف وصلت أو قلت عن حد الطلب"
          empty-description="جميع أرصدة الأصناف في المستوى الآمن"
          variant="amber"
          :icon="ExclamationTriangleIcon"
          :stagger-index="5"
          @click="router.push({ name: 'CurrentStockReport' })"
        />

        <DashboardAlertPill
          title="أصناف قريبة انتهاء الصلاحية"
          :count="stats.alerts?.expiring_soon_count ?? stats.expiring_items?.length ?? 0"
          :active-description="`أصناف متوفرة تنتهي خلال ${stats.expiry_days || currentFilters.expiry_days} يوم`"
          empty-description="لا توجد أصناف منتهية أو قريبة الانتهاء"
          variant="rose"
          :icon="ClockIcon"
          :stagger-index="6"
          @click="router.push({ name: 'ItemsList' })"
        />

        <DashboardAlertPill
          title="عملاء تجاوزوا الحد الائتماني"
          :count="stats.alerts?.over_credit_customers_count ?? 0"
          active-description="حسابات عملاء تخطت سقف الائتمان المسموح"
          empty-description="جميع أرصدة العملاء ضمن الحد الائتماني"
          variant="sky"
          :icon="UserGroupIcon"
          :stagger-index="7"
          @click="router.push({ name: 'CustomersList' })"
        />
      </div>

      <!-- ثالثاً: شريط المؤشرات المالية والتجارية التكميلية -->
      <div
        class="dashboard-enter grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        style="--stagger-index: 8"
      >
        <div
          class="rounded-xl border border-surface-border bg-surface-card p-4 flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <p class="text-xs font-bold text-text-muted truncate">إجمالي مديونيات العملاء</p>
            <p class="mt-1 text-lg sm:text-xl font-black text-text-primary tabular-nums">
              {{ formatNumber(stats.kpis?.total_liquidity?.customers_receivables || 0) }}
            </p>
          </div>
          <span
            class="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0 shadow-sm shadow-amber-500/50"
          ></span>
        </div>

        <div
          class="rounded-xl border border-surface-border bg-surface-card p-4 flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <p class="text-xs font-bold text-text-muted truncate">إجمالي مستحقات الموردين</p>
            <p class="mt-1 text-lg sm:text-xl font-black text-text-primary tabular-nums">
              {{ formatNumber(stats.kpis?.total_liquidity?.suppliers_payables || 0) }}
            </p>
          </div>
          <span
            class="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0 shadow-sm shadow-rose-500/50"
          ></span>
        </div>

        <div
          class="rounded-xl border border-surface-border bg-surface-card p-4 flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <p class="text-xs font-bold text-text-muted truncate">قيمة المخزون الدفترية</p>
            <p class="mt-1 text-lg sm:text-xl font-black text-text-primary tabular-nums">
              {{ formatNumber(stats.kpis?.total_liquidity?.inventory_value || 0) }}
            </p>
          </div>
          <span
            class="h-2.5 w-2.5 rounded-full bg-sky-500 shrink-0 shadow-sm shadow-sky-500/50"
          ></span>
        </div>

        <div
          class="rounded-xl border border-surface-border bg-surface-card p-4 flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <p class="text-xs font-bold text-text-muted truncate">حركة فواتير المبيعات</p>
            <p class="mt-1 text-lg sm:text-xl font-black text-primary tabular-nums">
              {{
                (stats.operational_volume?.total_sales_invoices || 0) +
                (stats.operational_volume?.total_return_invoices || 0)
              }}
              <span class="text-xs font-bold text-text-muted">مستند</span>
            </p>
          </div>
          <DocumentTextIcon class="h-5 w-5 text-primary shrink-0" />
        </div>
      </div>

      <!-- رابعاً: الرسم البياني التفاعلي للمبيعات والمشتريات خلال الفترة -->
      <SalesTrendChart :chart-data="stats.sales_chart" :stagger-index="9" />

      <!-- خامساً: التوزيع الهيكلي للجداول والتقارير التفصيلية -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <!-- الجناح الأيمن: الأصناف الأكثر مبيعاً، المصروفات التشغيلية، ومديونيات العملاء -->
        <div class="xl:col-span-7 space-y-6 flex flex-col">
          <!-- جدول الأصناف الأكثر مبيعاً خلال الفترة -->
          <TopSellingItemsTable :items="stats.top_selling_items" :stagger-index="10" />

          <!-- جدول كشف المصروفات المفصل للشهر الحالي أو النطاق المختار -->
          <ExpensesSummaryTable :expenses="stats.expenses_summary" />

          <!-- جدول مديونيات العملاء المحدث لحظياً -->
          <CustomerDebtsTable :customers="stats.customers_summary" />
        </div>

        <!-- الجناح الأيسر: تنبيهات انتهاء الصلاحية وتنبيهات حد الطلب -->
        <div class="xl:col-span-5 space-y-6 flex flex-col">
          <!-- جدول الأصناف قريبة انتهاء الصلاحية مع فلتر المدة بالأيام -->
          <ExpiringItemsTable
            :items="stats.expiring_items"
            :expiry-days="stats.expiry_days || currentFilters.expiry_days"
            :loading="loading"
            :stagger-index="11"
            @change-days="handleExpiryDaysChange"
          />

          <!-- جدول تنبيهات الأصناف التي بلغت حد الطلب -->
          <ReorderAlertsTable :items="stats.reorder_level_items" />
        </div>
      </div>
    </div>

    <!-- 4. واجهة حجب وحماية تظهر للمستخدم العادي بدلاً من الأرقام الحساسة -->
    <div
      v-else
      class="text-center py-24 relative z-10 border border-surface-border rounded-2xl bg-surface-section/60 backdrop-blur-md shadow-sm"
    >
      <div class="max-w-md mx-auto space-y-3 p-6">
        <h2 class="text-xl font-bold text-text-primary">مرحباً بك في النظام</h2>
        <p class="text-sm text-text-muted leading-relaxed">
          تمت المصادقة على دخولك بنجاح. لوحة المؤشرات الإحصائية والمالية الشاملة مخصصة حصراً للإدارة
          العليا والمدير العام.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dashboardService from '@/services/dashboardService'
import { useAuthStore } from '@/stores/authStore'
import {
  Squares2X2Icon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ShoppingCartIcon,
  BuildingLibraryIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
} from '@heroicons/vue/24/outline'

// استيراد مكونات لوحة التحكم الزجاجية الموحدة
import DashboardHeroHeader from '@/components/dashboard/DashboardHeroHeader.vue'
import DashboardKpiCard from '@/components/dashboard/DashboardKpiCard.vue'
import DashboardAlertPill from '@/components/dashboard/DashboardAlertPill.vue'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton.vue'

// استيراد مكونات الشاشة الفرعية
import DashboardFilters from './components/DashboardFilters.vue'
import SalesTrendChart from './components/SalesTrendChart.vue'
import TopSellingItemsTable from './components/TopSellingItemsTable.vue'
import ExpiringItemsTable from './components/ExpiringItemsTable.vue'
import ReorderAlertsTable from './components/ReorderAlertsTable.vue'
import ExpensesSummaryTable from './components/ExpensesSummaryTable.vue'
import CustomerDebtsTable from './components/CustomerDebtsTable.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const filterResetKey = ref(0)
const currentFilters = ref({
  from_date: '',
  to_date: '',
  expiry_days: 30,
})

const createDefaultStats = () => ({
  date_range: { from: '', to: '' },
  expiry_days: 30,
  net_sales_amount: 0,
  top_selling_items: [],
  reorder_level_items: [],
  expiring_items: [],
  operational_volume: {
    total_sales_invoices: 0,
    total_return_invoices: 0,
  },
  kpis: {
    net_sales: { value: 0, previous_value: 0, growth_percentage: 0, sparkline: [] },
    net_profit: {
      value: 0,
      previous_value: 0,
      growth_percentage: 0,
      sparkline: [],
      revenue: 0,
      cogs: 0,
      expenses: 0,
    },
    net_purchases: { value: 0, previous_value: 0, growth_percentage: 0, sparkline: [] },
    total_liquidity: {
      value: 0,
      treasuries_balance: 0,
      banks_balance: 0,
      customers_receivables: 0,
      suppliers_payables: 0,
      inventory_value: 0,
    },
  },
  sales_chart: {
    labels: [],
    dates: [],
    gross_sales: [],
    returns: [],
    net_sales: [],
    net_purchases: [],
    payment_breakdown: { cash: 0, bank: 0, credit: 0 },
  },
  alerts: {
    reorder_count: 0,
    expiring_soon_count: 0,
    over_credit_customers_count: 0,
  },
  expenses_summary: { list: [], grand_total: 0 },
  customers_summary: { list: [], grand_total: 0 },
})

const stats = ref(createDefaultStats())

const hasActiveFilters = computed(() =>
  Boolean(
    currentFilters.value.from_date ||
      currentFilters.value.to_date ||
      Number(currentFilters.value.expiry_days) !== 30,
  ),
)

const activeDateBadge = computed(() => {
  if (!authStore.can('dashboard.manager')) return 'بوابة النظام'
  return currentFilters.value.from_date || currentFilters.value.to_date
    ? 'نطاق مخصص'
    : 'الشهر الحالي'
})

/**
 * تنقية الفلاتر وإزالة الحقول الفارغة قبل الإرسال للـ API
 */
const buildCleanParams = (filters = {}) => {
  const params = {}
  if (filters.from_date) params.from_date = filters.from_date
  if (filters.to_date) params.to_date = filters.to_date
  if (filters.expiry_days) params.expiry_days = Number(filters.expiry_days)
  return params
}

/**
 * المحرك المركزي لجلب مؤشرات لوحة التحكم من الـ API
 */
const fetchDashboardData = async (filters = {}) => {
  loading.value = true
  try {
    const response = await dashboardService.getStats(buildCleanParams(filters))
    if (response && response.data && response.data.data) {
      const defaults = createDefaultStats()
      const incoming = response.data.data
      stats.value = {
        ...defaults,
        ...incoming,
        kpis: {
          ...defaults.kpis,
          ...(incoming.kpis || {}),
        },
        sales_chart: {
          ...defaults.sales_chart,
          ...(incoming.sales_chart || {}),
        },
        alerts: {
          ...defaults.alerts,
          ...(incoming.alerts || {}),
        },
      }
    }
  } catch (error) {
    console.error('خطأ أثناء جلب مؤشرات لوحة التحكم:', error)
  } finally {
    loading.value = false
  }
}

/**
 * استقبال الأحداث الزمنية وتحديث المؤشرات لحظياً مع الحفاظ على مدة الصلاحية
 */
const handleFilterChange = (newFilters) => {
  if (!authStore.can('dashboard.manager')) return
  currentFilters.value = {
    ...currentFilters.value,
    ...newFilters,
  }
  fetchDashboardData(currentFilters.value)
}

/**
 * تحديث عدد أيام فحص انتهاء الصلاحية مع الحفاظ على فلاتر التاريخ الحالية
 */
const handleExpiryDaysChange = (days) => {
  if (!authStore.can('dashboard.manager')) return
  currentFilters.value = {
    ...currentFilters.value,
    expiry_days: Number(days) || 30,
  }
  fetchDashboardData(currentFilters.value)
}

/**
 * تحديث البيانات بنفس الفلاتر الحالية
 */
const handleRefresh = () => {
  if (!authStore.can('dashboard.manager')) return
  fetchDashboardData(currentFilters.value)
}

/**
 * إعادة ضبط الفلاتر والعودة للشهر الحالي ومدة صلاحية 30 يوماً
 */
const handleReset = () => {
  if (!authStore.can('dashboard.manager')) return
  currentFilters.value = { from_date: '', to_date: '', expiry_days: 30 }
  filterResetKey.value += 1
  fetchDashboardData(currentFilters.value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

const formatCompact = (value) => {
  const num = Number(value) || 0
  const abs = Math.abs(num)
  if (abs >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toFixed(0)
}

onMounted(() => {
  if (authStore.can('dashboard.manager')) {
    fetchDashboardData(currentFilters.value)
  } else {
    loading.value = false
  }
})
</script>
