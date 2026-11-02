<!--src/views/sales/SalesList.vue-->
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-6">
      <div class="text-right" dir="rtl">
        <h1 class="text-2xl font-black text-text-primary">إدارة فواتير المبيعات</h1>
        <p class="text-xs text-text-secondary mt-1">
          استعراض، تتبع، وفلترة حركة المبيعات ومردودات المبيعات ومراقبة تأثيرها اللحظي على الأرصدة.
        </p>
      </div>
      <AppButton type="button" @click="goToCreatePage">
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>إضافة فاتورة جديدة (POS)</span>
        </span>
      </AppButton>
    </div>

    <SaleFilters
      v-model:searchQuery="searchQuery"
      v-model:invoiceTypeFilter="invoiceTypeFilter"
      v-model:storeFilter="storeFilter"
      v-model:customerFilter="customerFilter"
      v-model:fromDateFilter="fromDateFilter"
      v-model:toDateFilter="toDateFilter"
      @update:searchQuery="onSearch"
      @update:invoiceTypeFilter="handlePageChange(1)"
      @update:storeFilter="handlePageChange(1)"
      @update:customerFilter="handlePageChange(1)"
      @update:fromDateFilter="handlePageChange(1)"
      @update:toDateFilter="handlePageChange(1)"
    />

    <SaleTable
      :sales="sales"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-sale="goToEditPage"
      @delete-sale="openDeleteDialog"
      @row-clicked="goToEditPage"
      @print-sale="openPrintPage"
      @return-sale="goToReturnPage"
      @view-pdf="openPdfPage"
      @send-whatsapp="sendInvoiceToWhatsApp"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد إلغاء وحذف مستند المبيعات"
      :message="`هل أنت متأكد تماماً من رغبتك في حذف وإلغاء الفاتورة رقم '#${saleToDelete?.id}'؟ سيترتب على هذا الإجراء تراجع فوري وعكس الأثر المالي في حساب العميل واقتطاع الأرصدة المستردة من المستودع الحاضن.`"
      @confirmed="deleteSelectedSale"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSaleStore } from '@/stores/saleStore'
import { useStoreStore } from '@/stores/storeStore'
import { useCustomerStore } from '@/stores/customerStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import SaleFilters from './SaleFilters.vue'
import SaleTable from './SaleTable.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const router = useRouter()
const toast = useToast()

const saleStore = useSaleStore()
const storeStore = useStoreStore()
const customerStore = useCustomerStore()

const { sales, loading, pagination } = storeToRefs(saleStore)

const searchQuery = ref('')
const invoiceTypeFilter = ref('')
const storeFilter = ref('')
const customerFilter = ref('')
const fromDateFilter = ref('')
const toDateFilter = ref('')
let searchTimeout = null

// قناة البث للمزامنة اللحظية مع شاشة الكاشير
let posChannel = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    invoice_type: invoiceTypeFilter.value,
    store_id: storeFilter.value,
    customer_id: customerFilter.value,
    from_date: fromDateFilter.value,
    to_date: toDateFilter.value,
  }

  return saleStore.fetchSales(page, filters).catch(() => {
    toast.error('فشل النظام في جلب مستندات المبيعات المحدثة من الخادم.')
  })
}

// تحديث الجدول عند إعادة تركيز المستخدم على هذه النافذة بعد إغلاق الـ POS
const onWindowFocus = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

onMounted(async () => {
  handlePageChange(1)

  await Promise.all([
    storeStore.fetchStores(1, { is_active: 1 }),
    customerStore.fetchCustomers(1, { is_active: 1 }),
  ])

  // تفعيل الاستماع لقناة البث الحية لمزامنة المبيعات لحظة حفظها
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    posChannel = new BroadcastChannel('panda_pos_sales_channel')
    posChannel.onmessage = (event) => {
      if (event.data?.type === 'SALE_SAVED') {
        handlePageChange(1)
      }
    }
  }

  // تفعيل الاستماع لحدث تركيز النافذة
  window.addEventListener('focus', onWindowFocus)
})

onBeforeUnmount(() => {
  if (posChannel) {
    posChannel.close()
  }
  window.removeEventListener('focus', onWindowFocus)
})

// فتح شاشة الكاشير في نافذة مستقلة خارج الإطار الحالي
const goToCreatePage = () => {
  window.open('/pos', '_blank')
}

const goToEditPage = (sale) => {
  router.push(`/app/sales/${sale.id}/edit`)
}

// التوجيه الذكي للمردود: فتح صفحة الإنشاء مع حقن معرف الفاتورة المرجعية في الـ Query
const goToReturnPage = (sale) => {
  router.push(`/app/sales/create?return_from=${sale.id}`)
}

const openPrintPage = (sale) => {
  window.open(`/print/sales/${sale.id}`, '_blank')
}

// فتح ملف الـ PDF المولد والمخزن بالسيرفر مباشرة
const openPdfPage = (sale) => {
  if (sale.pdf_url) {
    window.open(sale.pdf_url, '_blank')
  } else {
    toast.error('عفواً، رابط الفاتورة غير متوفر.')
  }
}

/**
 * فحص وتنسيق هاتف العميل لحظياً بصيغة الواتساب الدولية المعتمدة
 */
const parseSudanPhoneForWhatsApp = (rawPhone) => {
  if (!rawPhone) return { valid: false, reason: 'empty' }

  let clean = rawPhone.toString().replace(/[^0-9]/g, '')
  if (!clean) return { valid: false, reason: 'empty' }

  // إزالة الأصفار الدولية 00249
  if (clean.startsWith('00249')) {
    clean = clean.substring(2)
  }

  // إذا بدأ بـ 09 أو 01 واكتمل 10 أرقام (الصيغة المحلية المعتادة)
  if ((clean.startsWith('09') || clean.startsWith('01')) && clean.length === 10) {
    return { valid: true, phone: '249' + clean.substring(1) }
  }

  // إذا أدخل 9 أرقام تبدأ بـ 9 أو 1 مباشرة
  if ((clean.startsWith('9') || clean.startsWith('1')) && clean.length === 9) {
    return { valid: true, phone: '249' + clean }
  }

  // إذا كان الرقم مسجلاً بالمفتاح الدولي 249 ومكون من 12 رقماً
  if (
    clean.startsWith('249') &&
    clean.length === 12 &&
    (clean.startsWith('2499') || clean.startsWith('2491'))
  ) {
    return { valid: true, phone: clean }
  }

  // دعم عام لأي رقم دولي مكتمل بدون أصفار في البداية (بين 10 إلى 15 رقماً)
  if (clean.length >= 10 && clean.length <= 15 && !clean.startsWith('0')) {
    return { valid: true, phone: clean }
  }

  return { valid: false, reason: 'invalid_format' }
}

/**
 * إرسال الفاتورة عبر واتساب مباشرة دون شاشات وسيطة مع فحص الهاتف
 */
const sendInvoiceToWhatsApp = (sale) => {
  if (!sale.pdf_url) {
    toast.error('عفواً، رابط الفاتورة غير متوفر.')
    return
  }

  const rawPhone = sale.customer_phone || sale.customer?.phone

  if (!rawPhone || !rawPhone.toString().trim()) {
    toast.warning('عفواً، لا يوجد رقم هاتف مسجل لهذا العميل لإرسال الفاتورة عبر واتساب.')
    return
  }

  const phoneResult = parseSudanPhoneForWhatsApp(rawPhone)

  if (!phoneResult.valid) {
    toast.error(
      `رقم الهاتف المسجل للعميل (${rawPhone}) غير صحيح، يجب أن يتكون من 10 أرقام (مثال: 0912345678 أو 0123456789).`,
    )
    return
  }

  const customerName = sale.customer_name || sale.customer_name_text || 'عميلنا العزيز'
  const invoiceNumber = sale.invoice_number || `#${sale.id}`
  const message = `مرحباً ${customerName}،\nشكراً لتعاملكم معنا. تفضل رابط استعراض وتحميل الفاتورة رقم (${invoiceNumber}):\n${sale.pdf_url}`
  const encodedText = encodeURIComponent(message)

  // كشف نوع الجهاز: هل هو هاتف محمول أم كمبيوتر مكتبي؟
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  let targetUrl = ''
  if (isMobile) {
    targetUrl = `whatsapp://send?phone=${phoneResult.phone}&text=${encodedText}`
  } else {
    targetUrl = `https://web.whatsapp.com/send?phone=${phoneResult.phone}&text=${encodedText}`
  }

  window.open(targetUrl, '_blank')
}

const isDeleteDialogOpen = ref(false)
const saleToDelete = ref(null)

const openDeleteDialog = (sale) => {
  saleToDelete.value = sale
  isDeleteDialogOpen.value = true
}

const deleteSelectedSale = async () => {
  if (saleToDelete.value) {
    try {
      await saleStore.deleteSale(saleToDelete.value.id)
      toast.success(`تم حذف وإلغاء مستند المبيعات رقم '#${saleToDelete.value.id}' وعكس أثره بنجاح.`)

      if (sales.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch {
      const errorMessage = saleStore.error || 'فشلت عملية إلغاء وحذف مستند المبيعات من النظام.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      saleToDelete.value = null
    }
  }
}
</script>
