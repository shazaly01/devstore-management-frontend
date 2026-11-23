<!--src/views/sales/SalePrint.vue-->
<template>
  <div
    class="print-page-wrapper min-h-screen bg-slate-100 text-slate-800 p-2 sm:p-4 r2l relative flex flex-col items-center"
    :class="`paper-${selectedPaperSize}`"
    dir="rtl"
  >
    <!-- شريط التحكم والتخصيص (مخفي بالكامل أثناء الطباعة) -->
    <div
      class="no-print w-full max-w-4xl bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-4 text-xs"
    >
      <!-- الصف الأول: القوائم الأساسية يميناً وأزرار الطباعة يساراً -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <!-- اختيار شكل الترويسة والشعار -->
          <div class="flex items-center gap-2">
            <label class="font-bold text-slate-600 whitespace-nowrap">شكل الترويسة:</label>
            <select
              v-model="selectedHeader"
              @change="savePreferences"
              class="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 hover:bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition cursor-pointer"
            >
              <option value="side">شعار جانبي (النمط الكلاسيكي)</option>
              <option value="centered">شعار بالمنتصف (نمط متوازن)</option>
              <option value="banner">ترويسة كاملة (نمط بانر)</option>
              <option value="full-logo">شعار كامل</option>
            </select>
          </div>

          <!-- اختيار مقاس الورق -->
          <div class="flex items-center gap-2">
            <label class="font-bold text-slate-600 whitespace-nowrap">مقاس الورق:</label>
            <select
              v-model="selectedPaperSize"
              @change="savePreferences"
              class="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 hover:bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition cursor-pointer"
            >
              <option value="a4">A4 قياسي (مكتبي)</option>
              <option value="a5">A5 طولي (مخصص للموبايل والورق الموفر)</option>
            </select>
          </div>
        </div>

        <!-- أزرار الإجراءات -->
        <div class="flex items-center gap-2 mr-auto">
          <button
            @click="executePrint"
            class="flex items-center gap-1.5 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition shadow-sm cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>طباعة الفاتورة</span>
          </button>

          <button
            @click="closeWindow"
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>

      <!-- الصف الثاني: شريط التحكم بارتفاع الشعار (يظهر فقط عند اختيار شعار كامل) -->
      <div
        v-if="selectedHeader === 'full-logo'"
        class="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/70"
      >
        <label
          for="logo-height-slider"
          class="font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5"
        >
          <span class="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
          <span>ارتفاع الشعار:</span>
        </label>

        <input
          id="logo-height-slider"
          type="range"
          v-model.number="logoHeight"
          min="50"
          max="240"
          step="5"
          @input="savePreferences"
          class="flex-1 h-1.5 bg-slate-200 rounded-lg accent-orange-600 cursor-pointer"
        />

        <div class="flex items-center gap-2 flex-shrink-0">
          <span
            dir="ltr"
            class="font-mono font-bold text-[11px] text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md min-w-[52px] text-center"
          >
            {{ logoHeight }}px
          </span>
          <button
            type="button"
            @click="resetLogoHeight"
            title="إعادة الارتفاع الافتراضي"
            class="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-600 text-[11px] font-bold text-slate-600 transition cursor-pointer"
          >
            افتراضي
          </button>
        </div>
      </div>
    </div>

    <!-- حالة التحميل -->
    <div v-if="loading" class="flex flex-col items-center justify-center flex-1 my-20 no-print">
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
        @click="closeWindow"
        class="px-5 py-2 bg-slate-800 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all duration-200"
      >
        إغلاق النافذة
      </button>
    </div>

    <!-- كتلة الفاتورة المطبوعة -->
    <div
      v-else
      class="invoice-box bg-white shadow-xl border border-slate-200 overflow-hidden relative flex flex-col justify-between"
      :class="[selectedPaperSize === 'a5' ? 'max-w-[14.8cm] p-3' : 'max-w-[21cm] p-4', 'w-full']"
    >
      <div class="flex-1 flex flex-col justify-between gap-3">
        <div>
          <!-- استدعاء مكون الترويسة المختار ديناميكياً -->
          <component
            :is="activeHeaderComponent"
            :sale="currentSale"
            :logo="reportLogoUrl"
            :company-name="companyName"
            :paper-size="selectedPaperSize"
            :logo-height="logoHeight"
          />

          <!-- تفاصيل العميل والموظف المعتمد -->
          <div :class="selectedPaperSize === 'a5' ? 'my-2' : 'my-3'">
            <div
              class="relative bg-gradient-to-r from-orange-50/40 via-white to-slate-50/80 rounded-lg border border-slate-200 border-t-2 border-t-orange-500 border-r-4 border-r-orange-500 shadow-sm overflow-hidden"
              :class="selectedPaperSize === 'a5' ? 'p-2' : 'p-3'"
            >
              <div class="grid grid-cols-2 gap-3 text-xs">
                <!-- بيانات العميل والموظف -->
                <div class="text-right space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span>
                    <span class="text-[11px] font-bold text-orange-600">بيانات العميل:</span>
                  </div>
                  <p
                    class="font-black text-slate-900 pr-2.5"
                    :class="selectedPaperSize === 'a5' ? 'text-xs' : 'text-sm'"
                  >
                    <span>{{
                      currentSale.customer_name || currentSale.customer?.name || '-'
                    }}</span>
                    <template
                      v-if="
                        currentSale.customer_name_text &&
                        String(currentSale.customer_name_text).trim()
                      "
                    >
                      <span class="mx-1 text-slate-700">:</span>
                      <span>{{ String(currentSale.customer_name_text).trim() }}</span>
                    </template>
                  </p>
                  <p class="text-slate-500 text-[10px] pr-2.5">
                    الموظف المسؤول: {{ currentSale.user_name || currentSale.user?.name || '-' }}
                  </p>
                </div>

                <!-- ملاحظات الفاتورة -->
                <div class="text-left space-y-1 border-r border-slate-200 pr-3">
                  <span class="text-[11px] font-bold text-slate-400 block">ملاحظات الفاتورة:</span>
                  <p
                    class="text-[11px] text-slate-700 leading-snug font-medium"
                    v-if="currentSale.notes"
                  >
                    {{ currentSale.notes }}
                  </p>
                  <p class="text-[11px] text-slate-400 italic" v-else>لا توجد ملاحظات إضافية</p>
                </div>
              </div>
            </div>
          </div>

          <!-- جدول بنود الأصناف -->
          <div class="mb-2">
            <div class="border border-slate-300 rounded-lg overflow-hidden shadow-sm">
              <table class="w-full text-right border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                    <th
                      :class="selectedPaperSize === 'a5' ? 'p-1.5 w-6' : 'p-2.5 w-10'"
                      class="text-center"
                    >
                      #
                    </th>
                    <th :class="selectedPaperSize === 'a5' ? 'p-1.5' : 'p-2.5'" class="text-right">
                      الصنف التجاري
                    </th>
                    <th
                      :class="selectedPaperSize === 'a5' ? 'p-1.5 w-14' : 'p-2.5 w-20'"
                      class="text-center"
                    >
                      الوحدة
                    </th>
                    <th
                      :class="selectedPaperSize === 'a5' ? 'p-1.5 w-12' : 'p-2.5 w-16'"
                      class="text-center"
                    >
                      الكمية
                    </th>
                    <th
                      :class="selectedPaperSize === 'a5' ? 'p-1.5 w-20' : 'p-2.5 w-28'"
                      class="text-center"
                    >
                      السعر
                    </th>
                    <th
                      :class="selectedPaperSize === 'a5' ? 'p-1.5 w-24' : 'p-2.5 w-32'"
                      class="text-left"
                    >
                      الإجمالي
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in currentSale.items"
                    :key="item.id || index"
                    class="border-b border-slate-200 hover:bg-slate-50/50"
                  >
                    <td
                      :class="selectedPaperSize === 'a5' ? 'p-1.5' : 'p-2.5'"
                      class="text-center font-mono text-slate-500"
                    >
                      {{ index + 1 }}
                    </td>
                    <td
                      :class="selectedPaperSize === 'a5' ? 'p-1.5' : 'p-2.5'"
                      class="font-bold text-slate-900"
                    >
                      {{ item.item_name }}
                    </td>
                    <td
                      :class="selectedPaperSize === 'a5' ? 'p-1.5 text-[10px]' : 'p-2.5'"
                      class="text-center text-slate-600"
                    >
                      {{ item.unit_name || '-' }}
                    </td>
                    <td
                      :class="selectedPaperSize === 'a5' ? 'p-1.5' : 'p-2.5'"
                      class="text-center font-black text-slate-900"
                    >
                      {{ item.quantity }}
                    </td>
                    <td
                      :class="selectedPaperSize === 'a5' ? 'p-1.5' : 'p-2.5'"
                      class="text-center font-mono font-medium text-slate-700"
                    >
                      {{ formatNumber(item.unit_price) }}
                    </td>
                    <td
                      :class="selectedPaperSize === 'a5' ? 'p-1.5' : 'p-2.5'"
                      class="text-left font-mono font-bold text-slate-900"
                    >
                      {{ formatNumber(item.grand_total) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- التذييل المالي -->
        <div>
          <!-- شريط الإجماليات المالية المنسق هندسياً والمحاذى جهة اليسار موازياً لعمود الإجمالي -->
          <div
            class="relative bg-gradient-to-r from-orange-50/30 via-white to-slate-50/60 rounded-lg border border-slate-200 border-t-2 border-t-orange-500 border-r-4 border-r-orange-500 shadow-sm flex justify-end items-center text-xs"
            :class="selectedPaperSize === 'a5' ? 'p-2' : 'p-3'"
          >
            <!-- كتلة الإجماليات محاذاة في أقصى اليسار تحت عمود الإجمالي مباشرة -->
            <div :class="selectedPaperSize === 'a5' ? 'w-48' : 'w-60'" class="space-y-1 text-xs">
              <!-- المجموع الفرعي -->
              <div class="flex justify-between items-center px-1">
                <span class="text-slate-500 font-bold text-[11px]">المجموع الفرعي:</span>
                <span class="font-mono font-bold text-slate-800 text-left">
                  {{ formatNumber(currentSale.subtotal || 0) }}
                </span>
              </div>

              <!-- الخصم (إن وجد) -->
              <div class="flex justify-between items-center px-1 text-rose-600">
                <span class="font-bold text-[11px]">الخصم:</span>
                <span class="font-mono font-bold text-left">
                  -{{ formatNumber(currentSale.discount_amount || 0) }}
                </span>
              </div>

              <!-- الضريبة (إن وجدت) -->
              <div class="flex justify-between items-center px-1 text-blue-600">
                <span class="font-bold text-[11px]">الضريبة:</span>
                <span class="font-mono font-bold text-left">
                  {{ formatNumber(currentSale.tax_amount || 0) }}
                </span>
              </div>

              <!-- الصافي الفعلي النهائي -->
              <div
                class="flex justify-between items-center bg-orange-500 text-white rounded-md px-2.5 py-1.5 shadow-sm mt-1"
              >
                <span class="font-black text-xs">الصافي الفعلي:</span>
                <div
                  class="flex items-center gap-1 font-mono font-black"
                  :class="selectedPaperSize === 'a5' ? 'text-xs' : 'text-sm'"
                >
                  <span>{{ formatNumber(currentSale.grand_total || 0) }}</span>
                  <span class="font-sans font-bold text-[10px] text-orange-100">جنيه</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSaleStore } from '@/stores/saleStore'
import { storeToRefs } from 'pinia'

// استيراد مكونات الترويسة المعزولة
import HeaderSideLogo from './headers/HeaderSideLogo.vue'
import HeaderCenteredLogo from './headers/HeaderCenteredLogo.vue'
import HeaderFullBanner from './headers/HeaderFullBanner.vue'
import HeaderFullLogo from './headers/HeaderFullLogo.vue'

const route = useRoute()
const saleStore = useSaleStore()
const { currentSale, loading, error } = storeToRefs(saleStore)

// استدعاء الشعار المباشر
const reportLogoUrl = '/ReportLogo.png'
const companyName = import.meta.env.VITE_COMPANY_NAME || ''

// التفضيلات المحلية المحفوظة
const STORAGE_KEY_HEADER = 'panda_invoice_header_layout'
const STORAGE_KEY_PAPER = 'panda_invoice_paper_size'
const STORAGE_KEY_LOGO_HEIGHT = 'panda_invoice_logo_height'
const DEFAULT_LOGO_HEIGHT = 110

const selectedHeader = ref('side')
const selectedPaperSize = ref('a4')
const logoHeight = ref(DEFAULT_LOGO_HEIGHT)

// دالة تنسيق الأرقام بدون كتابة العملة
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  if (isNaN(num)) return value
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

// تعيين المكون النشط ديناميكياً
const activeHeaderComponent = computed(() => {
  switch (selectedHeader.value) {
    case 'centered':
      return HeaderCenteredLogo
    case 'banner':
      return HeaderFullBanner
    case 'full-logo':
      return HeaderFullLogo
    case 'side':
    default:
      return HeaderSideLogo
  }
})

const resetLogoHeight = () => {
  logoHeight.value = DEFAULT_LOGO_HEIGHT
  savePreferences()
}

const savePreferences = () => {
  localStorage.setItem(STORAGE_KEY_HEADER, selectedHeader.value)
  localStorage.setItem(STORAGE_KEY_PAPER, selectedPaperSize.value)
  localStorage.setItem(STORAGE_KEY_LOGO_HEIGHT, String(logoHeight.value))
}

const loadPreferences = () => {
  const savedHeader = localStorage.getItem(STORAGE_KEY_HEADER)
  const savedPaper = localStorage.getItem(STORAGE_KEY_PAPER)
  const savedLogoHeight = localStorage.getItem(STORAGE_KEY_LOGO_HEIGHT)
  if (savedHeader) selectedHeader.value = savedHeader
  if (savedPaper) selectedPaperSize.value = savedPaper
  if (savedLogoHeight !== null) {
    const parsed = Number(savedLogoHeight)
    if (!isNaN(parsed) && parsed >= 50 && parsed <= 240) {
      logoHeight.value = parsed
    }
  }
}

const executePrint = () => {
  window.print()
}

const closeWindow = () => {
  window.close()
}

onMounted(async () => {
  loadPreferences()
  const saleId = route.params.id
  if (saleId) {
    await saleStore.fetchSale(saleId)
  }
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  body,
  .print-page-wrapper {
    background-color: #ffffff !important;
    color: #000000 !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: auto !important;
  }

  .invoice-box {
    width: 100% !important;
    max-width: 100% !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 2mm !important;
    min-height: auto !important;
  }

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

/* ضبط حجم الصفحة المطبوعة ديناميكياً بحسب مقاس الورق المختار */
.paper-a4 {
  --page-print-size: A4 portrait;
}
.paper-a5 {
  --page-print-size: A5 portrait;
}

@page {
  size: var(--page-print-size, A4 portrait);
  margin: 5mm;
}
</style>
