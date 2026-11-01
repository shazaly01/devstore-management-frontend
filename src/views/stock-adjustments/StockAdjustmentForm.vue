<!--src/views/stock-adjustments/StockAdjustmentForm.vue-->
<script setup>
import { useStockAdjustmentFormLogic } from '@/composables/useStockAdjustmentFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'

import StockAdjustmentHeader from './components/StockAdjustmentHeader.vue'
import StockAdjustmentFooter from './components/StockAdjustmentFooter.vue'
import StockAdjustmentItemsTable from './components/StockAdjustmentItemsTable.vue'

const {
  isEdit,
  form,
  items,
  visibleTableSchema,
  totalShortageValue,
  totalSurplusValue,
  getValidationError,
  handleSubmit,
  handleCancel,
  removeRow,
  triggerAddNewEmptyLine,
  handleGlobalItemSelect,
  syncUnitCostAndFields,
  stockAdjustmentStore,
} = useStockAdjustmentFormLogic()
</script>

<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <!-- شريط العنوان الرئيسي -->
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ isEdit ? 'تعديل مستند التسوية الجردية' : 'مستند تسوية جردية جديد' }}
        </h1>
      </div>
    </div>

    <!-- تنبيه الخطأ العام الصادر من الخادم -->
    <div
      v-if="stockAdjustmentStore.error"
      class="p-3 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-bold shadow-sm"
    >
      {{ stockAdjustmentStore.error }}
    </div>

    <!-- 1. ترويسة التسوية الجردية (المستودع، تاريخ الجرد) -->
    <StockAdjustmentHeader
      v-model="form"
      :validation-errors="stockAdjustmentStore.validationErrors"
      :is-edit="isEdit"
    />

    <!-- 2. جدول إدخال وبحث بنود التسوية الجردية (النمط المزدوج: كلاسيكي / حديث سطري) -->
    <AppCard>
      <StockAdjustmentItemsTable
        :items="items"
        :form="form"
        :visible-table-schema="visibleTableSchema"
        :get-validation-error="getValidationError"
        :remove-row="removeRow"
        :trigger-add-new-empty-line="triggerAddNewEmptyLine"
        :handle-global-item-select="handleGlobalItemSelect"
        :sync-unit-cost-and-fields="syncUnitCostAndFields"
      />
    </AppCard>

    <!-- 3. تذييل التسوية الجردية (إجمالي العجز، إجمالي الفائض، والملاحظات) -->
    <StockAdjustmentFooter
      v-model:notes="form.notes"
      :total-items="items.filter((r) => r.item_id).length"
      :total-shortage="totalShortageValue"
      :total-surplus="totalSurplusValue"
      :validation-errors="stockAdjustmentStore.validationErrors"
    />

    <!-- 4. شريط التحكم السفلي الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        تنبيه: حركات التسوية الجردية قيود تسوية فوارق تقييم مخزنية آلية وتؤثر مباشرة على حساب
        أرباح/خسائر الجرد.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>
        <AppButton
          type="button"
          size="sm"
          :disabled="stockAdjustmentStore.loading"
          @click="handleSubmit"
        >
          <span v-if="stockAdjustmentStore.loading">جاري ترحيل ومعالجة الفروقات الجردية...</span>
          <span v-else>{{
            isEdit ? 'تحديث ومزامنة مستند التسوية' : 'ترحيل وإقفال الجرد النهائي'
          }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>
