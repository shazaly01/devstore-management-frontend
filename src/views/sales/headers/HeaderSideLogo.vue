<!--src/views/sales/headers/HeaderSideLogo.vue-->
<template>
  <div class="header-side-logo pb-2 border-b border-slate-200">
    <!-- الشريط العلوي الملون -->
    <div class="w-full flex h-1.5 overflow-hidden rounded-t mb-2">
      <div class="w-8/12 bg-gradient-to-r from-orange-600 to-orange-500"></div>
      <div class="w-1/12 bg-amber-400"></div>
      <div class="w-3/12 bg-slate-700"></div>
    </div>

    <div class="flex justify-between items-center gap-4">
      <!-- الشعار التجاري (الجانب الأيمن) - مع مساحة مخصصة للكليشات العريضة -->
      <div class="flex items-center justify-start flex-shrink-0">
        <img
          v-if="logo"
          :src="logo"
          alt="شعار الشركة"
          :class="isA5 ? 'h-20 max-w-[220px]' : 'h-28 max-w-[320px]'"
          class="w-auto object-contain"
          onerror="this.style.display='none'"
        />
      </div>

      <!-- اسم الشركة (إن وجد منفصلاً عن الشعار) -->
      <div class="text-center flex-1 px-2" v-if="companyName">
        <h1 :class="isA5 ? 'text-base' : 'text-xl'" class="font-black text-slate-900 tracking-wide">
          {{ companyName }}
        </h1>
      </div>

      <!-- بيانات توثيق الفاتورة (الجانب الأيسر) -->
      <div class="text-right space-y-1 flex-shrink-0">
        <div class="flex justify-end">
          <span
            class="bg-gradient-to-l from-slate-50 to-orange-50/50 px-2.5 py-0.5 rounded border-r-2 border-orange-500 text-xs font-black text-orange-600 inline-block"
          >
            {{
              sale.invoice_type_lbl ||
              (sale.invoice_type === 'sale' ? 'فاتورة مبيعات' : 'مردود مبيعات')
            }}
          </span>
        </div>

        <div class="flex items-center justify-end gap-1.5 text-xs">
          <span class="font-bold text-slate-500">رقم الفاتورة:</span>
          <span class="font-mono font-black bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">
            {{ sale.invoice_number || `#${sale.id}` }}
          </span>
        </div>

        <div class="flex items-center justify-end gap-1.5 text-xs">
          <span class="font-bold text-slate-500">التاريخ:</span>
          <span class="font-mono font-bold text-slate-800">
            {{ formatDateOnly(sale.invoice_date) }}
          </span>
        </div>

        <div class="flex items-center justify-end gap-1.5 text-xs">
          <span class="font-bold text-slate-500">نوع البيع:</span>
          <span
            class="font-mono font-bold px-1.5 py-0.5 rounded-full border text-[10px]"
            :class="
              sale.sale_type === 'indoor'
                ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                : 'text-amber-700 border-amber-300 bg-amber-50'
            "
          >
            {{ sale.sale_type === 'indoor' ? 'داخلي' : 'خارجي' }}
          </span>
          <span class="font-bold text-slate-500 mr-1">الدفع:</span>
          <span class="font-bold text-slate-800">{{ sale.payment_type_lbl || '-' }}</span>
        </div>
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
