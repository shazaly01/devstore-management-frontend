<!--src/views/sales/headers/HeaderCenteredLogo.vue-->
<template>
  <div class="header-centered-logo pb-2 border-b border-slate-200">
    <!-- الشريط العلوي الملون -->
    <div class="w-full flex h-1.5 overflow-hidden rounded-t mb-2">
      <div class="w-7/12 bg-gradient-to-r from-orange-600 to-orange-500"></div>
      <div class="w-2/12 bg-amber-400"></div>
      <div class="w-3/12 bg-slate-700"></div>
    </div>

    <!-- التوزيع المتوازن: يمين - وسط - يسار -->
    <div class="flex items-center justify-between gap-3">
      <!-- الجانب الأيمن: رقم السند وتاريخ التحرير -->
      <div class="w-1/4 space-y-1.5 text-right flex-shrink-0">
        <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <span class="text-slate-500 block text-[10px] font-bold">رقم السند:</span>
          <span class="font-mono font-black text-slate-900 text-xs">
            {{ sale.invoice_number || `#${sale.id}` }}
          </span>
        </div>

        <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <span class="text-slate-500 block text-[10px] font-bold">تاريخ التحرير:</span>
          <span class="font-mono font-bold text-slate-800 text-xs">
            {{ formatDateOnly(sale.invoice_date) }}
          </span>
        </div>
      </div>

      <!-- المنتصف: الشعار التجاري وتصنيف الفاتورة -->
      <div class="flex-1 flex flex-col items-center justify-center text-center px-1">
        <img
          v-if="logo"
          :src="logo"
          alt="شعار الشركة"
          :class="isA5 ? 'h-20 max-w-[220px]' : 'h-28 max-w-[340px]'"
          class="w-auto object-contain transition-all"
          onerror="this.style.display='none'"
        />

        <h1
          v-if="companyName"
          :class="isA5 ? 'text-xs' : 'text-sm'"
          class="font-black text-slate-900 tracking-wide mt-1"
        >
          {{ companyName }}
        </h1>

        <div
          class="mt-1 inline-block bg-orange-50 border border-orange-200 px-4 py-0.5 rounded-full font-black text-xs text-orange-600 shadow-sm"
        >
          {{
            sale.invoice_type_lbl ||
            (sale.invoice_type === 'sale' ? 'فاتورة مبيعات' : 'مردود مبيعات')
          }}
        </div>
      </div>

      <!-- الجانب الأيسر: طبيعة البيع وطريقة السداد -->
      <div class="w-1/4 space-y-1.5 text-right flex-shrink-0">
        <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <span class="text-slate-500 block text-[10px] font-bold">طبيعة البيع:</span>
          <span
            class="font-bold inline-block px-2 py-0.5 rounded text-[10px] border mt-0.5"
            :class="
              sale.sale_type === 'indoor'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-amber-700 bg-amber-50 border-amber-200'
            "
          >
            {{ sale.sale_type === 'indoor' ? 'مبيعات داخلية' : 'مبيعات خارجية' }}
          </span>
        </div>

        <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <span class="text-slate-500 block text-[10px] font-bold">طريقة السداد:</span>
          <span class="font-bold text-slate-800 text-xs mt-0.5 block truncate">
            {{ sale.payment_type_lbl || '-' }}
          </span>
        </div>
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
})

const isA5 = computed(() => props.paperSize === 'a5')

const formatDateOnly = (dateString) => {
  if (!dateString) return '-'
  return String(dateString).split(' ')[0]
}
</script>
