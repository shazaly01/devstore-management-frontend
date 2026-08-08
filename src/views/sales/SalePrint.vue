<!--src\views\sales\SalePrint.vue--->
<template>
  <div
    class="print-container min-h-screen bg-slate-50 text-slate-800 p-4 r2l relative flex flex-col justify-between"
    dir="rtl"
  >
    <!-- خلفية زخرفية خفيفة (تظهر فقط على الشاشة) -->
    <div
      class="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl no-print"
    ></div>

    <!-- حالة التحميل -->
    <div v-if="loading" class="flex flex-col items-center justify-center flex-1 no-print">
      <div class="relative w-16 h-16">
        <div
          class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"
        ></div>
        <div
          class="absolute top-1 left-1 animate-ping rounded-full h-14 w-14 border border-orange-200"
        ></div>
      </div>
      <p class="text-sm text-slate-600 mt-6 font-bold tracking-wide animate-pulse">
        جاري تحضير مستند الطباعة...
      </p>
    </div>

    <!-- حالة الخطأ -->
    <div
      v-else-if="error || !currentSale"
      class="p-8 text-center max-w-md mx-auto my-20 bg-white rounded-2xl shadow-lg border border-slate-200 no-print"
    >
      <div
        class="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <span class="text-orange-500 text-xl">⚠️</span>
      </div>
      <p class="font-bold text-base text-slate-700 mb-4">
        {{ error || 'لم يتم العثور على بيانات الفاتورة المطلوبة.' }}
      </p>
      <button
        @click="window.close()"
        class="px-5 py-2 bg-slate-800 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all duration-200"
      >
        إغلاق النافذة
      </button>
    </div>

    <!-- الفاتورة النهائية -->
    <div
      v-else
      class="invoice-box max-w-[21cm] mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative flex flex-col justify-between flex-1 w-full p-4"
    >
      <div class="flex-1 flex flex-col justify-between gap-4">
        <div>
          <!-- الشريط العلوي الملون -->
          <div class="w-full flex h-2 overflow-hidden rounded-t mb-2">
            <div class="w-8/12 bg-gradient-to-r from-orange-600 to-orange-500"></div>
            <div class="w-1/12 bg-amber-400"></div>
            <div class="w-3/12 bg-slate-700"></div>
          </div>

          <!-- رأس الفاتورة (معدل: شعار أكبر وفراغات موزونة) -->
          <div
            class="px-3 py-1 flex justify-between items-center gap-4 border-b border-slate-200 pb-2"
          >
            <!-- الشعار -->
            <div class="flex items-center justify-center">
              <img
                :src="reportLogoUrl"
                alt="شعار الشركة"
                class="h-24 w-auto max-w-[200px] object-contain"
                onerror="this.style.display='none'"
              />
            </div>

            <!-- اسم الشركة مرن في الوسط -->
            <div class="text-center flex-1 px-2">
              <h1 v-if="companyName" class="text-2xl font-black text-slate-900 tracking-wide">
                {{ companyName }}
              </h1>
            </div>

            <!-- تفاصيل الفاتورة -->
            <div class="text-right space-y-0.5">
              <div
                class="bg-gradient-to-l from-slate-50 to-orange-50/50 px-2.5 py-0.5 rounded border-r-2 border-orange-500 inline-block"
              >
                <span class="text-xs font-black text-orange-600">{{
                  currentSale.invoice_type_lbl
                }}</span>
              </div>
              <div class="flex items-center justify-end gap-2 text-xs">
                <span class="font-bold text-slate-500">رقم الفاتورة:</span>
                <span
                  class="font-mono font-black bg-slate-100 px-1.5 py-0.5 rounded text-slate-900"
                  >{{ currentSale.invoice_number }}</span
                >
              </div>
              <div class="flex items-center justify-end gap-2 text-xs">
                <span class="font-bold text-slate-500">التاريخ:</span>
                <span class="font-mono font-bold text-slate-800">{{
                  formatDateOnly(currentSale.invoice_date)
                }}</span>
              </div>
              <div class="flex items-center justify-end gap-2 text-xs">
                <span class="font-bold text-slate-500">نوع البيع:</span>
                <span
                  class="font-mono font-bold px-2 py-0.5 rounded-full border text-[10px]"
                  :class="
                    currentSale.sale_type === 'indoor'
                      ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                      : 'text-amber-700 border-amber-300 bg-amber-50'
                  "
                >
                  {{ currentSale.sale_type === 'indoor' ? 'داخلي' : 'خارجي' }}
                </span>
                <span class="font-bold text-slate-500">طريقة الدفع:</span>
                <span class="font-bold text-slate-800">{{ currentSale.payment_type_lbl }}</span>
              </div>
            </div>
          </div>

          <!-- معلومات العميل والموظف -->
          <div class="px-3 py-3">
            <div
              class="grid grid-cols-2 gap-4 text-xs bg-slate-50 rounded-lg p-3 border border-slate-200"
            >
              <div class="text-right space-y-1">
                <span class="text-xs font-bold text-orange-600">تفاصيل العميل:</span>
                <p class="font-black text-slate-900 text-sm">
                  {{ currentSale.customer_name || '-' }}
                </p>
                <p v-if="currentSale.customer_name_text" class="text-orange-600 font-bold text-xs">
                  {{ currentSale.customer_name_text }}
                </p>
                <p class="text-slate-500 text-xs">
                  الموظف المسؤول: {{ currentSale.user_name || '-' }}
                </p>
              </div>
              <div class="text-left space-y-1">
                <span class="text-xs font-bold text-slate-400">ملاحظات الفاتورة:</span>
                <p class="text-xs text-slate-600 leading-relaxed" v-if="currentSale.notes">
                  {{ currentSale.notes }}
                </p>
                <p class="text-xs text-slate-400 italic" v-else>لا توجد ملاحظات</p>
              </div>
            </div>
          </div>

          <!-- جدول الأصناف -->
          <div class="px-3 py-2">
            <div class="border border-slate-300 rounded-lg overflow-hidden">
              <table class="w-full text-right border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                    <th class="p-2.5 text-center w-10">#</th>
                    <th class="p-2.5 text-right">الصنف التجاري</th>
                    <th class="p-2.5 text-center">الوحدة</th>
                    <th class="p-2.5 text-center">الكمية</th>
                    <th class="p-2.5 text-center">سعر الوحدة</th>
                    <th class="p-2.5 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in currentSale.items"
                    :key="item.id"
                    class="border-b border-slate-200 hover:bg-slate-50/50"
                  >
                    <td class="p-2.5 text-center font-mono text-slate-500">{{ index + 1 }}</td>
                    <td class="p-2.5 font-bold text-slate-900">{{ item.item_name }}</td>
                    <td class="p-2.5 text-center text-slate-600">{{ item.unit_name || '-' }}</td>
                    <td class="p-2.5 text-center font-black text-slate-900">{{ item.quantity }}</td>
                    <td class="p-2.5 text-center font-mono text-slate-600">
                      {{ formatCurrency(item.unit_price) }}
                    </td>
                    <td class="p-2.5 text-left font-mono font-bold text-slate-900">
                      {{ formatCurrency(item.grand_total) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- الجزء السفلي: الإجماليات والتوقيعات -->
        <div>
          <!-- الإجماليات -->
          <div class="px-3 py-2">
            <div
              class="flex justify-end items-center gap-6 bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs"
            >
              <div class="flex items-center gap-1.5">
                <span class="text-slate-600">الفرعي:</span>
                <span class="font-mono font-bold text-slate-900">{{
                  formatCurrency(currentSale.subtotal || 0)
                }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-rose-600">
                <span>الخصم:</span>
                <span class="font-mono font-bold"
                  >-{{ formatCurrency(currentSale.discount_amount || 0) }}</span
                >
              </div>
              <div class="flex items-center gap-1.5 text-blue-600">
                <span>الضريبة:</span>
                <span class="font-mono font-bold">{{
                  formatCurrency(currentSale.tax_amount || 0)
                }}</span>
              </div>
              <div
                class="flex items-center gap-2 bg-orange-100 px-4 py-1.5 rounded-lg border border-orange-300"
              >
                <span class="font-black text-slate-900 text-xs">الصافي الفعلي:</span>
                <span class="font-mono font-black text-orange-600 text-base">{{
                  formatCurrency(currentSale.grand_total || 0)
                }}</span>
              </div>
            </div>
          </div>

          <!-- التوقيعات -->
          <div class="px-3 py-6 grid grid-cols-3 gap-4 text-center text-xs text-slate-500">
            <div>
              <p class="font-bold text-slate-700">توقيع المصمم</p>
              <div class="border-b border-dashed border-slate-300 mx-auto w-24 pt-4"></div>
            </div>
            <div>
              <p class="font-bold text-slate-700">توقيع المحاسب</p>
              <div class="border-b border-dashed border-slate-300 mx-auto w-24 pt-4"></div>
            </div>
            <div>
              <p class="font-bold text-slate-700">توقيع المستلم</p>
              <div class="border-b border-dashed border-slate-300 mx-auto w-24 pt-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useSaleStore } from '@/stores/saleStore'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const saleStore = useSaleStore()

const { currentSale, loading, error } = storeToRefs(saleStore)

const backendUrl = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : ''
const reportLogoUrl = `${backendUrl}/storage/ReportLogo.png`
const companyName = import.meta.env.VITE_COMPANY_NAME || ''

const formatDateOnly = (dateString) => {
  if (!dateString) return '-'
  return dateString.split(' ')[0]
}

const triggerBrowserPrint = async () => {
  await nextTick()
  if (!loading.value && currentSale.value) {
    setTimeout(() => {
      window.print()
    }, 600)
  }
}

onMounted(async () => {
  const saleId = route.params.id
  if (saleId) {
    await saleStore.fetchSale(saleId)
    await triggerBrowserPrint()
  }
})

watch(currentSale, async (newVal) => {
  if (newVal) {
    await triggerBrowserPrint()
  }
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  body,
  .print-container {
    background-color: #ffffff !important;
    color: #000000 !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: auto !important;
  }

  .invoice-box {
    max-width: 100% !important;
    width: 100% !important;
    border: none !important;
    padding: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    min-height: auto !important;
  }

  /* ضمان عدم انقطاع الجداول بين الصفحات */
  table {
    page-break-inside: auto;
  }
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  thead {
    display: table-header-group;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

.invoice-box {
  font-family: inherit;
}
</style>
