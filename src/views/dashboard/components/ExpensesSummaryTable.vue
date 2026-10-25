<!-- src/views/dashboard/components/ExpensesSummaryTable.vue -->
<template>
  <AppCard class="flex flex-col h-full font-sans" dir="rtl">
    <!-- رأس الكرت: العنوان والمؤشرات العلوية -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <!-- أيقونة تعبر عن المصروفات وتدفق الأموال للخارج -->
        <div class="p-2.5 bg-danger/10 text-danger rounded-xl border border-danger/20 shadow-sm">
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            ></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-black text-text-primary tracking-tight">المصروفات التشغيلية</h3>
          <p class="text-xs text-text-muted mt-0.5">تحليل بنود الصرف للفترة المحددة</p>
        </div>
      </div>

      <!-- شارة توضح عدد البنود المسجلة -->
      <div
        class="text-[11px] font-bold text-danger bg-danger/10 px-3 py-1.5 rounded-lg border border-danger/20"
      >
        {{ expenses.list?.length || 0 }} بنود
      </div>
    </div>

    <!-- حاوية الجدول: متجاوبة مع الجوال عبر التمرير الأفقي -->
    <div
      class="flex-1 overflow-x-auto rounded-xl border border-surface-border bg-surface-ground mb-5"
    >
      <table class="w-full text-right whitespace-nowrap">
        <thead class="bg-surface-section text-xs text-text-secondary sticky top-0 z-10">
          <tr>
            <th class="px-5 py-3.5 font-bold border-b border-surface-border">بند المصروف</th>
            <th class="px-5 py-3.5 font-bold border-b border-surface-border w-32 text-left">
              المبلغ المستهلك
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border text-sm bg-surface-section">
          <!-- حالة عدم وجود بيانات (Empty State) بتصميم هادئ -->
          <tr v-if="!expenses.list || expenses.list.length === 0">
            <td colspan="2" class="px-5 py-10 text-center text-text-muted">
              <div class="flex flex-col items-center gap-3">
                <div class="p-3 rounded-full bg-surface-ground">
                  <svg
                    class="w-6 h-6 opacity-40 text-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M20 12H4M8 16l-4-4 4-4"
                    ></path>
                  </svg>
                </div>
                <span class="text-sm">لا توجد حركات صرف مسجلة في هذا النطاق الزمني.</span>
              </div>
            </td>
          </tr>

          <!-- تكرار البيانات الواردة -->
          <tr
            v-for="expense in expenses.list"
            :key="expense.expense_id"
            class="hover:bg-surface-ground transition-colors duration-150 group"
          >
            <td class="px-5 py-3.5 text-text-primary font-medium flex items-center gap-2.5">
              <span
                class="w-1.5 h-1.5 rounded-full bg-danger/60 group-hover:bg-danger transition-colors duration-150"
              ></span>
              {{ expense.expense_name }}
            </td>
            <td class="px-5 py-3.5 font-bold text-danger font-mono tracking-tight text-left">
              {{ formatCurrency(expense.total_spent) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- التذييل: الإجمالي العام (Footer) مثبت في الأسفل -->
    <div
      class="mt-auto pt-4 border-t border-surface-border flex items-center justify-between bg-danger/5 rounded-lg px-3 py-2"
    >
      <span class="text-sm font-bold text-text-secondary flex items-center gap-2">
        <svg class="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          ></path>
        </svg>
        إجمالي المصروفات:
      </span>
      <span class="text-xl md:text-2xl font-black text-danger tracking-tight font-mono">
        {{ formatCurrency(expenses.grand_total) }}
      </span>
    </div>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/ui/AppCard.vue'

defineProps({
  expenses: {
    type: Object,
    required: true,
    default: () => ({ list: [], grand_total: 0 }),
  },
})

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
</script>
