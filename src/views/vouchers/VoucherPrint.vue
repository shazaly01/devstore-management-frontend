<!--src/views/vouchers/VoucherPrint.vue-->
<template>
  <div
    class="print-container min-h-screen bg-surface-ground py-4 text-slate-900 font-sans"
    dir="rtl"
  >
    <!-- حالة التحميل قبل جلب البيانات -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[10cm] no-print">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <p class="text-xs text-text-muted mt-2 font-bold">جاري رندرة السند المالي الرسمي...</p>
    </div>

    <!-- حالة وجود خطأ في النظام -->
    <div v-else-if="error || !currentVoucher" class="p-6 text-center text-danger no-print">
      <p class="font-black text-sm">{{ error || 'لم يتم العثور على بيانات المستند.' }}</p>
      <button
        @click="window.close()"
        class="mt-4 px-4 py-2 bg-surface-section border border-surface-border text-text-primary hover:bg-surface-ground rounded-lg text-xs font-bold transition-colors cursor-pointer"
      >
        إغلاق النافذة
      </button>
    </div>

    <!-- السند المالي الاحترافي بهيكل الدفاتر المحاسبية الرسمية المعزولة -->
    <div v-else class="voucher-master-frame shadow-md">
      <!-- أولاً: الترويسة العلوية المتوازنة -->
      <table class="w-full header-table mb-4">
        <tr>
          <!-- جهة اليمين: هيدر المنشأة والبيانات القانونية -->
          <td class="w-1/3 text-right align-top space-y-1">
            <h2 class="text-base font-black tracking-wide text-slate-900">
              [اسم الشركة / المؤسسة الافتراضي]
            </h2>
            <p class="text-[10px] text-slate-600 font-medium">قسم الشؤون المالية والمحاسبية</p>
            <p class="text-[10px] text-slate-500 font-mono">الرقم الضريبي: 300000000000003</p>
            <p class="text-[10px] text-slate-500">العنوان: المملكة العربية السعودية، الرياض</p>
          </td>

          <!-- المنتصف: شعار الشركة المتوازن والمحكوم ميكانيكياً -->
          <td class="w-1/3 text-center align-middle">
            <div class="logo-wrapper mx-auto">
              <img
                src="/ReportLogo.png"
                alt="شعار المؤسسة"
                class="main-logo"
                onerror="this.style.display='none'; this.nextSibling.style.display='block';"
              />
              <span class="hidden text-[10px] font-black text-slate-400">LOGO</span>
            </div>
          </td>

          <!-- جهة اليسار: بيانات السند المحاسبي المعزول -->
          <td class="w-1/3 text-left align-top">
            <div class="voucher-meta-box inline-block text-right">
              <h1 class="voucher-title">{{ currentVoucher.voucher_type_lbl }}</h1>
              <table class="w-full text-[11px] mt-2 font-bold text-slate-800">
                <tr>
                  <td class="pl-2 text-slate-500">رقم السند:</td>
                  <td class="font-mono text-xs text-slate-900 text-left">
                    {{ currentVoucher.voucher_number }}
                  </td>
                </tr>
                <tr>
                  <td class="pl-2 text-slate-500">تاريخ القيد:</td>
                  <td class="font-mono text-xs text-slate-900 text-left">
                    {{ formatDateOnly(currentVoucher.voucher_date) }}
                  </td>
                </tr>
                <tr>
                  <td class="pl-2 text-slate-500">رقم اليومية:</td>
                  <td class="font-mono text-xs text-slate-900 text-left">
                    #{{ currentVoucher.journal_entry_no || currentVoucher.id }}
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>

      <!-- ثانياً: المصفوفة الجدولية المصمتة (Ledger Matrix Table) -->
      <table class="w-full ledger-table mb-4">
        <!-- السطر الأول: المستفيد الفعلي / الحساب المساعد -->
        <tr>
          <td class="cell-label w-[140px]">
            {{
              currentVoucher.voucher_type === 'payment'
                ? 'إصرفوا للمكرم / السادة:'
                : 'استلمنا من المكرم / السادة:'
            }}
          </td>
          <td class="cell-value font-black text-slate-900 text-sm">
            {{ currentVoucher.sub_ledger_name || currentVoucher.account_name || '-' }}
          </td>
        </tr>

        <!-- السطر الثاني: القيمة المالية بالأرقام وكتلة العملة المدمجة -->
        <tr>
          <td class="cell-label">مبلغ وقدره الأصلي:</td>
          <td class="cell-value">
            <div class="flex items-center justify-between">
              <span
                class="font-mono font-black text-base text-slate-950 bg-slate-100/80 px-3 py-0.5 border border-slate-300 rounded"
              >
                {{ formatCurrency(currentVoucher.amount || 0) }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium font-sans">
                * القيمة المحتسبة خاضعة للتدقيق المالي الداخلي في دفاتر اليومية العامة.
              </span>
            </div>
          </td>
        </tr>

        <!-- السطر الثالث: التوجيه المحاسبي -->
        <tr>
          <td class="cell-label">قيداً على حساب الموازنة:</td>
          <td class="cell-value font-bold text-slate-800">
            {{ currentVoucher.account_name }}
            <span class="text-xs font-mono text-slate-400"
              >({{ currentVoucher.account_id || '-' }})</span
            >
          </td>
        </tr>

        <!-- السطر الرابع: الخزينة الفرعية أو البنك المحرك للسيولة -->
        <tr>
          <td class="cell-label">طريقة وقناة النقدية:</td>
          <td class="cell-value text-xs font-medium">
            مستند مالي
            <span class="font-bold text-slate-800">[{{ currentVoucher.payment_method_lbl }}]</span>
            <span class="text-slate-300 mx-3">|</span>
            <span class="text-slate-600 font-bold">المستقر والخزينة الفرعية:</span>
            <span class="text-slate-900 font-black mr-1">
              {{
                currentVoucher.treasury_name ||
                currentVoucher.bank_name ||
                currentVoucher.fund_account_name ||
                '-'
              }}
            </span>
          </td>
        </tr>

        <!-- السطر الخامس: البيان والشرح المالي -->
        <tr>
          <td class="cell-label align-top pt-2">وذلك مقابل / البيان:</td>
          <td
            class="cell-value align-top font-bold text-slate-800 text-[11px] leading-relaxed py-2 min-h-[45px]"
          >
            {{ currentVoucher.notes || 'لا توجد ملاحظات أو شرح مضاف لهذا السند المالي في النظام.' }}
          </td>
        </tr>
      </table>

      <!-- ثالثاً: خط وطبقة التواقيع الكلاسيكية الأفقية -->
      <table class="w-full signatures-table mt-8">
        <tr>
          <td class="w-1/4 text-center">
            <p class="sig-title">أعده / منشئ السند</p>
            <p class="sig-meta font-mono">الموظف: {{ currentVoucher.user_name || '-' }}</p>
            <div class="sig-line"></div>
          </td>
          <td class="w-1/4 text-center">
            <p class="sig-title">توقيع المستلم الفعلي</p>
            <p class="sig-meta">رقم الهوية: .........................</p>
            <div class="sig-line"></div>
          </td>
          <td class="w-1/4 text-center">
            <p class="sig-title">المراجعة والتدقيق المحاسبي</p>
            <p class="sig-meta">إدارة القيود المالية</p>
            <div class="sig-line"></div>
          </td>
          <td class="w-1/4 text-center">
            <p class="sig-title">الاعتماد والختم الرسمي</p>
            <p class="sig-meta">المدير العام / المدير المالي</p>
            <div class="sig-line"></div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useVoucherStore } from '@/stores/voucherStore'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const voucherStore = useVoucherStore()

const { currentVoucher, loading, error } = storeToRefs(voucherStore)

const formatDateOnly = (dateString) => {
  if (!dateString) return '-'
  return dateString.split(' ')[0]
}

const triggerBrowserPrint = async () => {
  await nextTick()
  if (!loading.value && currentVoucher.value) {
    setTimeout(() => {
      window.print()
    }, 500)
  }
}

onMounted(async () => {
  const voucherId = route.params.id
  if (voucherId) {
    await voucherStore.fetchVoucher(voucherId)
    await triggerBrowserPrint()
  }
})

watch(currentVoucher, async (newVal) => {
  if (newVal) {
    await triggerBrowserPrint()
  }
})
</script>

<style scoped>
.voucher-master-frame {
  max-width: 19.5cm;
  margin: 0 auto;
  background-color: #ffffff;
  padding: 0.4cm;
  border: 1px solid #94a3b8;
  border-radius: 6px;
}

.header-table {
  border-collapse: collapse;
}

.logo-wrapper {
  width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  background-color: #f8fafc;
  border-radius: 6px;
}

.main-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.voucher-meta-box {
  border: 2px solid #0f172a;
  border-radius: 4px;
  padding: 8px 12px;
  background-color: #f8fafc;
  min-width: 210px;
}

.voucher-title {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
  text-align: center;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 4px;
  margin-bottom: 4px;
}

.ledger-table {
  border-collapse: collapse;
  width: 100%;
  border: 2px solid #0f172a;
}

.ledger-table td {
  border: 1px solid #1e293b;
  padding: 6px 10px;
}

.cell-label {
  background-color: #f1f5f9;
  font-weight: 800;
  font-size: 11px;
  color: #334155;
  text-align: right;
}

.cell-value {
  background-color: #ffffff;
  text-align: right;
}

.signatures-table {
  border-collapse: collapse;
  table-layout: fixed;
}

.sig-title {
  font-size: 11px;
  font-weight: 800;
  color: #1e293b;
}

.sig-meta {
  font-size: 9px;
  color: #64748b;
  margin-top: 1px;
}

.sig-line {
  margin: 18px auto 0 auto;
  width: 80%;
  border-bottom: 1px dotted #475569;
}

@media print {
  .no-print {
    display: none !important;
  }

  html,
  body,
  .print-container {
    background-color: #ffffff !important;
    color: #000000 !important;
    padding: 0 !important;
    margin: 0 !important;
    height: auto !important;
  }

  @page {
    size: A5 landscape !important;
    margin: 0.5cm !important;
  }

  .voucher-master-frame {
    max-width: 100% !important;
    width: 100% !important;
    border: 2px solid #000000 !important;
    border-radius: 0 !important;
    padding: 0.3cm !important;
    box-shadow: none !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
