<!--src/views/sales/headers/HeaderFullBanner.vue-->
<template>
  <div class="header-full-banner pb-2 border-b border-slate-300">
    <!-- شريط البانر الممتد المتدرج -->
    <div
      class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-lg p-2.5 sm:p-3 flex justify-between items-center shadow-sm"
    >
      <!-- الشعار بخلفية بيضاء واضحة تمنع بهتان الألوان -->
      <div class="flex items-center gap-3">
        <div class="bg-white p-1 rounded-md shadow flex items-center justify-center">
          <img
            v-if="logo"
            :src="logo"
            alt="شعار الشركة"
            :class="isA5 ? 'h-16 max-w-[200px]' : 'h-24 max-w-[300px]'"
            class="w-auto object-contain"
            onerror="this.style.display='none'"
          />
        </div>
        <div class="text-right" v-if="companyName">
          <h1 :class="isA5 ? 'text-base' : 'text-xl'" class="font-black text-white tracking-wide">
            {{ companyName }}
          </h1>
          <p class="text-slate-300 text-[10px] font-medium tracking-wider">سند مالي ومخزني معتمد</p>
        </div>
      </div>

      <!-- تصنيف السند -->
      <div class="text-left flex-shrink-0">
        <div
          class="bg-orange-500 text-white font-black px-3 py-1 rounded text-xs tracking-wider shadow-sm text-center"
        >
          {{
            sale.invoice_type_lbl ||
            (sale.invoice_type === 'sale' ? 'فاتورة مبيعات' : 'مردود مبيعات')
          }}
        </div>
        <div class="text-slate-300 text-[11px] font-mono mt-1 text-left">
          {{ sale.invoice_number || `#${sale.id}` }}
        </div>
      </div>
    </div>

    <!-- شريط بيانات الفاتورة المدمج أسفل البانر -->
    <div
      class="mt-2 grid grid-cols-4 gap-2 bg-slate-100 p-2 rounded-md text-xs border border-slate-200"
    >
      <div class="text-right">
        <span class="text-slate-500 text-[10px] block font-bold">تاريخ التحرير:</span>
        <span class="font-mono font-bold text-slate-800">{{
          formatDateOnly(sale.invoice_date)
        }}</span>
      </div>

      <div class="text-right">
        <span class="text-slate-500 text-[10px] block font-bold">نوع البيع:</span>
        <span
          class="font-bold text-[10px] px-1.5 py-0.2 rounded"
          :class="
            sale.sale_type === 'indoor'
              ? 'text-emerald-700 bg-emerald-100'
              : 'text-amber-700 bg-amber-100'
          "
        >
          {{ sale.sale_type === 'indoor' ? 'داخلي' : 'خارجي' }}
        </span>
      </div>

      <div class="text-right">
        <span class="text-slate-500 text-[10px] block font-bold">طريقة السداد:</span>
        <span class="font-bold text-slate-800">{{ sale.payment_type_lbl || '-' }}</span>
      </div>

      <div class="text-left font-mono font-bold text-slate-700 flex items-center justify-end">
        <span>رقم المعرف: #{{ sale.id }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sale: { type: Object, required: true },
  logo: { type: String, default: '' },
  companyName: { type: String, default: '' },
  paperSize: { type: String, default: 'a4' },
})

const isA5 = computed(() => props.paperSize === 'a5')

const formatDateOnly = (dateString) => {
  if (!dateString) return '-'
  return String(dateString).split(' ')[0]
}
</script>
