<!--src/views/sales/headers/HeaderFullLogo.vue-->
<template>
  <div class="header-full-logo pb-1.5 border-b border-slate-200">
    <!-- منطقة الشعار فقط مع تحكم رقمي دقيق بالارتفاع والحفاظ على التناسق -->
    <div v-if="logo" class="w-full flex justify-center items-center overflow-hidden">
      <img
        :src="logo"
        alt="شعار الشركة"
        :style="{ height: `${logoHeight}px` }"
        class="w-auto max-w-full object-contain block"
        onerror="this.style.display='none'"
      />
    </div>

    <!-- شريط البيانات المدمج في سطر واحد صغير أسفل الشعار -->
    <div
      class="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-600 px-1"
    >
      <!-- يمين: رقم الفاتورة -->
      <div class="flex items-center gap-1">
        <span class="font-bold text-slate-500">رقم الفاتورة:</span>
        <span class="font-mono font-black text-slate-900">
          {{ sale.invoice_number || `#${sale.id}` }}
        </span>
      </div>

      <!-- وسط: التاريخ -->
      <div class="flex items-center gap-1">
        <span class="font-bold text-slate-500">التاريخ:</span>
        <span class="font-mono font-bold text-slate-800">
          {{ formatDateOnly(sale.invoice_date) }}
        </span>
      </div>

      <!-- يسار: طريقة السداد -->
      <div class="flex items-center gap-1">
        <span class="font-bold text-slate-500">طريقة السداد:</span>
        <span class="font-bold text-slate-800">
          {{ formattedPaymentType }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sale: {
    type: Object,
    required: true,
  },
  logo: {
    type: String,
    default: '',
  },
  companyName: {
    type: String,
    default: '',
  },
  paperSize: {
    type: String,
    default: 'a4',
  },
  logoHeight: {
    type: Number,
    default: 110,
  },
})

const formatDateOnly = (dateString) => {
  if (!dateString) return '-'
  return String(dateString).split(' ')[0]
}

const formattedPaymentType = computed(() => {
  const lbl = props.sale?.payment_type_lbl
  if (!lbl) return '-'
  if (lbl.trim() === 'شبكة / دفع إلكتروني') return 'سداد بنكي'
  return lbl
})
</script>
