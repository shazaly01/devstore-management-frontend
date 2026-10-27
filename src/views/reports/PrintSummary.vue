<!--src/views/reports/PrintSummary.vue-->
<template>
  <div class="print-container bg-white text-slate-800 p-4 font-sans text-right" dir="rtl">
    <!-- الشريط التزييني العلوي المتدرج -->
    <div class="w-full flex h-2 overflow-hidden rounded-t mb-3">
      <div class="w-8/12 bg-gradient-to-r from-orange-600 to-orange-500"></div>
      <div class="w-1/12 bg-amber-400"></div>
      <div class="w-3/12 bg-slate-700"></div>
    </div>

    <!-- رأس التقرير الموحد -->
    <div
      class="px-2 py-1 flex justify-between items-center gap-4 border-b border-slate-200 pb-3 mb-4"
    >
      <!-- الشعار مع آلية التراجع التلقائي للبديل المحلي -->
      <div class="flex items-center justify-center">
        <img
          :src="logoSrc"
          @error="handleLogoError"
          alt="شعار الشركة"
          class="h-20 w-auto max-w-[180px] object-contain"
        />
      </div>

      <!-- اسم الشركة وعنوان التقرير -->
      <div class="text-center flex-1 px-2">
        <h1 v-if="companyName" class="text-2xl font-black text-slate-900 tracking-wide mb-1">
          {{ companyName }}
        </h1>
        <p class="text-sm font-bold text-slate-600">{{ reportTitle }}</p>
      </div>

      <!-- تفاصيل تاريخ ووقت التقرير -->
      <div class="text-right space-y-1">
        <div
          class="bg-gradient-to-l from-slate-50 to-orange-50/50 px-2.5 py-0.5 rounded border-r-2 border-orange-500 inline-block"
        >
          <span class="text-xs font-black text-orange-600">تقرير جرد لحظي</span>
        </div>
        <div class="flex items-center justify-end gap-2 text-xs">
          <span class="font-bold text-slate-500">تاريخ التقرير:</span>
          <span class="font-mono font-bold text-slate-800">{{ currentDate }}</span>
        </div>
        <div class="flex items-center justify-end gap-2 text-xs">
          <span class="font-bold text-slate-500">وقت الاستخراج:</span>
          <span class="font-mono font-bold text-slate-800">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <!-- بطاقات ملخص الأرصدة والمخزون -->
    <div class="grid grid-cols-4 gap-3 mb-4">
      <div
        class="border border-slate-200 p-2.5 rounded bg-slate-50 flex flex-col justify-center border-r-4 border-r-orange-500"
      >
        <p class="text-slate-500 text-[10px] font-bold mb-1 uppercase">إجمالي الأصناف</p>
        <p class="text-base font-black text-slate-900 font-mono">
          {{ formatNumber(summary?.total_items) }}
          <span class="text-xs font-normal text-slate-500">صنف</span>
        </p>
      </div>

      <div
        class="border border-slate-200 p-2.5 rounded bg-slate-50 flex flex-col justify-center border-r-4 border-r-sky-500"
      >
        <p class="text-slate-500 text-[10px] font-bold mb-1 uppercase">إجمالي كميات المخزون</p>
        <p class="text-base font-black text-sky-700 font-mono">
          {{ formatNumber(summary?.grand_total_quantity) }}
        </p>
      </div>

      <div
        class="border border-slate-200 p-2.5 rounded bg-slate-50 flex flex-col justify-center border-r-4 border-r-amber-500"
      >
        <p class="text-slate-500 text-[10px] font-bold mb-1 uppercase">إجمالي قيمة التكلفة</p>
        <p class="text-base font-black text-amber-700 font-mono">
          {{ formatNumber(summary?.grand_total_cost_value) }}
        </p>
      </div>

      <div
        class="border border-slate-200 p-2.5 rounded bg-slate-50 flex flex-col justify-center border-r-4 border-r-emerald-600"
      >
        <p class="text-slate-500 text-[10px] font-bold mb-1 uppercase">إجمالي القيمة البيعية</p>
        <p class="text-base font-black text-emerald-700 font-mono">
          {{ formatNumber(summary?.grand_total_sale_value) }}
        </p>
      </div>
    </div>

    <!-- جدول بيانات المخزون التفصيلي بتوزيع نسبي مريح -->
    <div class="w-full border border-slate-300 rounded overflow-hidden">
      <table class="w-full text-right border-collapse table-fixed text-xs">
        <thead>
          <tr
            class="bg-slate-100 text-slate-800 font-black border-b border-slate-300 print:bg-slate-200"
          >
            <th class="p-2 border border-slate-300 w-[4%] text-center">#</th>
            <th class="p-2 border border-slate-300 w-[34%] text-right">الصنف</th>
            <th class="p-2 border border-slate-300 w-[11%] text-right">المستودع</th>
            <th class="p-2 border border-slate-300 w-[11%] text-center">الكمية</th>
            <th class="p-2 border border-slate-300 w-[10%] text-center">التكلفة</th>
            <th class="p-2 border border-slate-300 w-[8%] text-center">الربح %</th>
            <th class="p-2 border border-slate-300 w-[10%] text-center">البيع</th>
            <th class="p-2 border border-slate-300 w-[12%] text-left">إجمالي التكلفة</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in items"
            :key="item.stock_id || index"
            class="border-b border-slate-200 hover:bg-slate-50/50 break-inside-avoid"
          >
            <td
              class="p-2 border border-slate-200 text-center font-mono font-bold text-slate-500 text-xs"
            >
              {{ index + 1 }}
            </td>
            <td class="p-2 border border-slate-200 text-slate-900">
              <div class="flex flex-col gap-0.5">
                <span class="text-[13px] font-black text-slate-900 leading-snug">
                  {{ item.item_name }}
                </span>
                <span
                  v-if="item.item_id"
                  class="text-[10px] text-slate-500 font-mono font-semibold"
                >
                  كود: #{{ item.item_id }}
                </span>
              </div>
            </td>
            <td class="p-2 border border-slate-200 text-slate-700 font-medium text-xs">
              {{ item.store_name || 'غير محدد' }}
            </td>
            <td
              class="p-2 border border-slate-200 text-center font-mono font-bold text-slate-900 text-xs whitespace-nowrap"
            >
              {{ formatNumber(item.current_quantity_base) }}
              <span v-if="item.unit1_name" class="text-[10px] font-normal text-slate-500 mr-0.5"
                >({{ item.unit1_name }})</span
              >
            </td>
            <td
              class="p-2 border border-slate-200 text-center font-mono text-slate-700 text-xs whitespace-nowrap"
            >
              {{ formatNumber(item.unit_cost) }}
            </td>
            <td
              class="p-2 border border-slate-200 text-center font-mono font-black text-xs whitespace-nowrap"
              :class="
                Number(item.profit_margin_percentage) >= 0 ? 'text-emerald-700' : 'text-rose-700'
              "
            >
              {{ formatNumber(item.profit_margin_percentage) }}%
            </td>
            <td
              class="p-2 border border-slate-200 text-center font-mono font-bold text-slate-800 text-xs whitespace-nowrap"
            >
              {{ formatNumber(item.unit_price) }}
            </td>
            <td
              class="p-2 border border-slate-200 text-left font-mono font-black text-slate-900 text-xs whitespace-nowrap"
            >
              {{ formatNumber(item.total_cost_value) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- التوقيعات والاعتمادات -->
    <div
      class="mt-8 grid grid-cols-3 gap-4 text-center pt-4 border-t border-slate-200 break-inside-avoid"
    >
      <div class="space-y-6">
        <p class="font-bold text-slate-700 text-xs">أمين المستودع</p>
        <div class="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
      </div>
      <div class="space-y-6">
        <p class="font-bold text-slate-700 text-xs">المراجعة والتدقيق المالي</p>
        <div class="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
      </div>
      <div class="space-y-6">
        <p class="font-bold text-slate-700 text-xs">يعتمد / المدير العام</p>
        <div class="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const backendUrl = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : ''
const reportLogoUrl = `${backendUrl}/storage/ReportLogo.png`
const fallbackLogoUrl = '/PandaRep.png'
const companyName = import.meta.env.VITE_COMPANY_NAME || ''

const logoSrc = ref(reportLogoUrl)
const handleLogoError = () => {
  if (logoSrc.value !== fallbackLogoUrl) {
    logoSrc.value = fallbackLogoUrl
  }
}

const reportTitle = ref('تقرير جرد الأرصدة وتقييم المخزون اللحظي')
const summary = ref(null)
const items = ref([])

const currentDate = new Date().toLocaleDateString('ar-EG')
const currentTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })

onMounted(() => {
  const savedData = sessionStorage.getItem('printData')
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData)
      reportTitle.value =
        parsed.reportTitle || parsed.grandSummary?.title_override || reportTitle.value
      summary.value = parsed.summary || {
        total_items: parsed.grandSummary?.total_companies || 0,
        grand_total_quantity: parsed.grandSummary?.grand_total_due_value || 0,
        grand_total_cost_value: parsed.grandSummary?.grand_total_contract_value || 0,
        grand_total_sale_value: parsed.grandSummary?.grand_total_remaining || 0,
      }
      items.value = parsed.items || parsed.companiesSummary || []
    } catch (e) {
      console.error('فشل قراءة بيانات الطباعة:', e)
    }

    setTimeout(() => {
      window.print()
    }, 600)
  }
})

const formatNumber = (value) => {
  if (value === undefined || value === null || isNaN(Number(value))) return '0'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value)))
}
</script>

<style scoped>
@media print {
  @page {
    size: A4 portrait;
    margin: 8mm;
  }

  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    margin: 0;
  }
}

.print-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

.break-inside-avoid {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
