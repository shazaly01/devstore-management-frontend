<!-- src/views/dashboard/components/SalesTrendChart.vue -->
<template>
  <DashboardChartCard
    title="تحليل المبيعات والمشتريات خلال الفترة"
    subtitle="تتبع الأداء اليومي/الشهري لصافي المبيعات ومقارنتها بالمشتريات والمرتجعات"
    :icon="PresentationChartLineIcon"
    accent-rgb="255, 125, 20"
    height-class="h-80 sm:h-96"
    :empty="!hasData"
    empty-title="لا توجد حركات مبيعات أو مشتريات في هذه الفترة"
    empty-message="قم بتغيير نطاق التاريخ من شريط الفلاتر العلوي لاستعراض المنحنيات البيانية."
    :stagger-index="staggerIndex"
  >
    <!-- أزرار التحكم في إظهار وإخفاء السلاسل البيانية -->
    <template #header-extra>
      <div class="flex flex-wrap items-center gap-1.5" dir="rtl">
        <button
          v-for="series in seriesList"
          :key="series.key"
          type="button"
          @click="toggleSeries(series.key)"
          class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all duration-150 cursor-pointer select-none"
          :class="
            visibleSeries[series.key]
              ? 'border-surface-border bg-surface-section text-text-primary shadow-sm'
              : 'border-transparent bg-surface-ground/60 text-text-muted opacity-55 hover:opacity-85'
          "
        >
          <span
            class="h-2.5 w-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: series.color }"
          ></span>
          <span>{{ series.label }}</span>
        </button>
      </div>
    </template>

    <!-- منطقة الرسم البياني التفاعلي -->
    <template #default="{ theme }">
      <div
        ref="chartWrapper"
        class="relative w-full h-full select-none"
        @mousemove="handleMouseMove"
        @mouseleave="hoveredIndex = null"
      >
        <svg
          :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
          class="w-full h-full overflow-visible"
          role="img"
          aria-label="رسم بياني لتحليل المبيعات والمشتريات"
        >
          <defs>
            <linearGradient id="sales-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ff7d14" stop-opacity="0.34" />
              <stop offset="80%" stop-color="#ff7d14" stop-opacity="0.05" />
              <stop offset="100%" stop-color="#ff7d14" stop-opacity="0.0" />
            </linearGradient>

            <linearGradient id="purchases-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.24" />
              <stop offset="85%" stop-color="#0ea5e9" stop-opacity="0.03" />
              <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- خطوط الشبكة الأفقية وقيم المحور الصادي -->
          <g v-for="(tick, idx) in yTicks" :key="`y-tick-${idx}`">
            <line
              :x1="padding.left"
              :y1="tick.y"
              :x2="svgWidth - padding.right"
              :y2="tick.y"
              :stroke="theme.gridColor"
              stroke-width="1"
              stroke-dasharray="4 4"
            />
            <text
              :x="padding.left - 10"
              :y="tick.y + 4"
              text-anchor="end"
              :fill="theme.mutedColor"
              font-size="11"
              font-weight="600"
              class="tabular-nums"
            >
              {{ formatCompactNumber(tick.value) }}
            </text>
          </g>

          <!-- تسميات المحور السيني (التواريخ) -->
          <g v-for="xTick in xTicks" :key="`x-tick-${xTick.index}`">
            <text
              :x="xTick.x"
              :y="svgHeight - 8"
              text-anchor="middle"
              :fill="theme.mutedColor"
              font-size="11"
              font-weight="600"
              class="tabular-nums"
            >
              {{ xTick.label }}
            </text>
          </g>

          <!-- سلسلة صافي المشتريات -->
          <g v-if="visibleSeries.net_purchases && purchasesPoints.length">
            <path :d="purchasesAreaPath" fill="url(#purchases-area-grad)" />
            <path
              :d="purchasesLinePath"
              fill="none"
              stroke="#0ea5e9"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>

          <!-- سلسلة المرتجعات -->
          <g v-if="visibleSeries.returns && returnsPoints.length">
            <path
              :d="returnsLinePath"
              fill="none"
              stroke="#f43f5e"
              stroke-width="2.1"
              stroke-dasharray="5 4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>

          <!-- سلسلة صافي المبيعات -->
          <g v-if="visibleSeries.net_sales && salesPoints.length">
            <path :d="salesAreaPath" fill="url(#sales-area-grad)" />
            <path
              :d="salesLinePath"
              fill="none"
              stroke="#ff7d14"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>

          <!-- خط التتبع العمودي ونقاط التركيز عند تمرير المؤشر -->
          <g v-if="hoveredIndex !== null && hoveredX !== null">
            <line
              :x1="hoveredX"
              :y1="padding.top"
              :x2="hoveredX"
              :y2="svgHeight - padding.bottom"
              stroke="#ff7d14"
              stroke-opacity="0.55"
              stroke-width="1.5"
              stroke-dasharray="3 3"
            />

            <circle
              v-if="visibleSeries.net_purchases && purchasesPoints[hoveredIndex]"
              :cx="purchasesPoints[hoveredIndex].x"
              :cy="purchasesPoints[hoveredIndex].y"
              r="4.5"
              fill="#0ea5e9"
              stroke="#ffffff"
              stroke-width="2"
            />

            <circle
              v-if="visibleSeries.returns && returnsPoints[hoveredIndex]"
              :cx="returnsPoints[hoveredIndex].x"
              :cy="returnsPoints[hoveredIndex].y"
              r="4"
              fill="#f43f5e"
              stroke="#ffffff"
              stroke-width="2"
            />

            <circle
              v-if="visibleSeries.net_sales && salesPoints[hoveredIndex]"
              :cx="salesPoints[hoveredIndex].x"
              :cy="salesPoints[hoveredIndex].y"
              r="5.5"
              fill="#ff7d14"
              stroke="#ffffff"
              stroke-width="2.2"
            />
          </g>
        </svg>

        <!-- بطاقة التلميح العائمة (Tooltip) عند التمرير -->
        <div
          v-if="hoveredIndex !== null"
          class="pointer-events-none absolute top-2 z-20 min-w-[195px] rounded-xl border border-primary/40 bg-slate-900/95 px-3.5 py-2.5 text-xs text-white shadow-xl backdrop-blur-md transition-all duration-75"
          :style="tooltipPositionStyle"
          dir="rtl"
        >
          <p
            class="mb-1.5 border-b border-white/15 pb-1 font-extrabold text-orange-300 tabular-nums"
          >
            {{ fullDates[hoveredIndex] || labels[hoveredIndex] }}
          </p>
          <div class="space-y-1">
            <div v-if="visibleSeries.net_sales" class="flex items-center justify-between gap-4">
              <span class="flex items-center gap-1.5 text-slate-200">
                <span class="h-2 w-2 rounded-full bg-[#ff7d14]"></span>
                صافي المبيعات:
              </span>
              <span class="font-bold tabular-nums text-white">
                {{ formatCurrency(netSalesSeries[hoveredIndex] || 0) }}
              </span>
            </div>

            <div v-if="visibleSeries.net_purchases" class="flex items-center justify-between gap-4">
              <span class="flex items-center gap-1.5 text-slate-200">
                <span class="h-2 w-2 rounded-full bg-[#0ea5e9]"></span>
                صافي المشتريات:
              </span>
              <span class="font-bold tabular-nums text-sky-300">
                {{ formatCurrency(netPurchasesSeries[hoveredIndex] || 0) }}
              </span>
            </div>

            <div v-if="visibleSeries.returns" class="flex items-center justify-between gap-4">
              <span class="flex items-center gap-1.5 text-slate-200">
                <span class="h-2 w-2 rounded-full bg-[#f43f5e]"></span>
                المرتجعات:
              </span>
              <span class="font-bold tabular-nums text-rose-300">
                {{ formatCurrency(returnsSeries[hoveredIndex] || 0) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ذيل البطاقة: ملخص طرق التحصيل للمبيعات خلال الفترة -->
    <template #footer>
      <div class="flex flex-wrap items-center justify-between gap-3" dir="rtl">
        <span class="font-bold text-text-muted">توزيع تحصيل المبيعات:</span>

        <div class="flex flex-wrap items-center gap-3 sm:gap-5">
          <div class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span class="text-text-muted">نقدي:</span>
            <span class="font-extrabold text-text-primary tabular-nums">
              {{ formatCurrency(paymentBreakdown.cash) }}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
            <span class="text-text-muted">بنكي / شبكة:</span>
            <span class="font-extrabold text-text-primary tabular-nums">
              {{ formatCurrency(paymentBreakdown.bank) }}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span class="text-text-muted">آجل (ذمم):</span>
            <span class="font-extrabold text-text-primary tabular-nums">
              {{ formatCurrency(paymentBreakdown.credit) }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </DashboardChartCard>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import DashboardChartCard from '@/components/dashboard/DashboardChartCard.vue'
import { PresentationChartLineIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  chartData: {
    type: Object,
    default: () => ({
      labels: [],
      dates: [],
      gross_sales: [],
      returns: [],
      net_sales: [],
      net_purchases: [],
      payment_breakdown: { cash: 0, bank: 0, credit: 0 },
    }),
  },
  staggerIndex: {
    type: Number,
    default: 2,
  },
})

const svgWidth = 860
const svgHeight = 290
const padding = { top: 18, right: 20, bottom: 30, left: 62 }

const seriesList = [
  { key: 'net_sales', label: 'صافي المبيعات', color: '#ff7d14' },
  { key: 'net_purchases', label: 'صافي المشتريات', color: '#0ea5e9' },
  { key: 'returns', label: 'المرتجعات', color: '#f43f5e' },
]

const visibleSeries = reactive({
  net_sales: true,
  net_purchases: true,
  returns: true,
})

const toggleSeries = (key) => {
  const activeCount = Object.values(visibleSeries).filter(Boolean).length
  if (visibleSeries[key] && activeCount <= 1) return
  visibleSeries[key] = !visibleSeries[key]
}

const labels = computed(() => props.chartData?.labels || [])
const fullDates = computed(() => props.chartData?.dates || [])
const netSalesSeries = computed(() => (props.chartData?.net_sales || []).map((v) => Number(v) || 0))
const netPurchasesSeries = computed(() =>
  (props.chartData?.net_purchases || []).map((v) => Number(v) || 0),
)
const returnsSeries = computed(() => (props.chartData?.returns || []).map((v) => Number(v) || 0))

const paymentBreakdown = computed(() => ({
  cash: Number(props.chartData?.payment_breakdown?.cash || 0),
  bank: Number(props.chartData?.payment_breakdown?.bank || 0),
  credit: Number(props.chartData?.payment_breakdown?.credit || 0),
}))

const hasData = computed(() => {
  if (!labels.value.length) return false
  const allValues = [...netSalesSeries.value, ...netPurchasesSeries.value, ...returnsSeries.value]
  return allValues.some((v) => Math.abs(v) > 0)
})

const valueBounds = computed(() => {
  const activeValues = []
  if (visibleSeries.net_sales) activeValues.push(...netSalesSeries.value)
  if (visibleSeries.net_purchases) activeValues.push(...netPurchasesSeries.value)
  if (visibleSeries.returns) activeValues.push(...returnsSeries.value)

  if (!activeValues.length) return { min: 0, max: 100 }

  const rawMin = Math.min(0, ...activeValues)
  const rawMax = Math.max(0, ...activeValues)
  const paddedMax = rawMax > 0 ? rawMax * 1.12 : 100

  return {
    min: rawMin,
    max: paddedMax === rawMin ? rawMin + 100 : paddedMax,
  }
})

const plotWidth = svgWidth - padding.left - padding.right
const plotHeight = svgHeight - padding.top - padding.bottom

const getXCoordinate = (index, total) => {
  if (total <= 1) return padding.left + plotWidth / 2
  return padding.left + (index / (total - 1)) * plotWidth
}

const getYCoordinate = (value) => {
  const { min, max } = valueBounds.value
  const ratio = (value - min) / (max - min)
  return padding.top + plotHeight - ratio * plotHeight
}

const buildPoints = (series) => {
  const total = labels.value.length
  return series.map((val, idx) => ({
    x: Number(getXCoordinate(idx, total).toFixed(2)),
    y: Number(getYCoordinate(val).toFixed(2)),
  }))
}

const salesPoints = computed(() => buildPoints(netSalesSeries.value))
const purchasesPoints = computed(() => buildPoints(netPurchasesSeries.value))
const returnsPoints = computed(() => buildPoints(returnsSeries.value))

const buildLinePath = (points) => {
  if (!points.length) return ''
  return points.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')
}

const buildAreaPath = (points) => {
  if (!points.length) return ''
  const baseY = Number(getYCoordinate(0).toFixed(2))
  const first = points[0]
  const last = points[points.length - 1]
  return `${buildLinePath(points)} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`
}

const salesLinePath = computed(() => buildLinePath(salesPoints.value))
const salesAreaPath = computed(() => buildAreaPath(salesPoints.value))
const purchasesLinePath = computed(() => buildLinePath(purchasesPoints.value))
const purchasesAreaPath = computed(() => buildAreaPath(purchasesPoints.value))
const returnsLinePath = computed(() => buildLinePath(returnsPoints.value))

const yTicks = computed(() => {
  const { min, max } = valueBounds.value
  const steps = 4
  const ticks = []
  for (let i = 0; i <= steps; i++) {
    const val = min + ((max - min) / steps) * i
    ticks.push({
      value: val,
      y: Number(getYCoordinate(val).toFixed(2)),
    })
  }
  return ticks
})

const xTicks = computed(() => {
  const total = labels.value.length
  if (!total) return []
  const maxLabels = 8
  const step = Math.max(1, Math.ceil(total / maxLabels))
  const result = []

  for (let i = 0; i < total; i += step) {
    result.push({
      index: i,
      label: labels.value[i],
      x: Number(getXCoordinate(i, total).toFixed(2)),
    })
  }

  return result
})

const chartWrapper = ref(null)
const hoveredIndex = ref(null)

const handleMouseMove = (event) => {
  if (!chartWrapper.value || !labels.value.length) return
  const rect = chartWrapper.value.getBoundingClientRect()
  const relX = ((event.clientX - rect.left) / rect.width) * svgWidth
  const clampedX = Math.max(padding.left, Math.min(svgWidth - padding.right, relX))

  if (labels.value.length === 1) {
    hoveredIndex.value = 0
    return
  }

  const ratio = (clampedX - padding.left) / plotWidth
  const idx = Math.round(ratio * (labels.value.length - 1))
  hoveredIndex.value = Math.max(0, Math.min(labels.value.length - 1, idx))
}

const hoveredX = computed(() => {
  if (hoveredIndex.value === null) return null
  return getXCoordinate(hoveredIndex.value, labels.value.length)
})

const tooltipPositionStyle = computed(() => {
  if (hoveredX.value === null) return {}
  const percentX = (hoveredX.value / svgWidth) * 100
  if (percentX > 65) {
    return { right: `${100 - percentX + 2}%` }
  }
  return { left: `${percentX + 2}%` }
})

const formatCompactNumber = (num) => {
  const abs = Math.abs(num)
  if (abs >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return Math.round(num).toString()
}

const formatCurrency = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(num) || 0)
}
</script>
