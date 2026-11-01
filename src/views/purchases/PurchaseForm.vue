<!--src/views/purchases/PurchaseForm.vue-->
<script setup>
import { usePurchaseFormLogic } from '@/composables/usePurchaseFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'

import PurchaseHeader from './components/PurchaseHeader.vue'
import PurchaseFooter from './components/PurchaseFooter.vue'
import PurchaseItemsTable from './components/PurchaseItemsTable.vue'

const {
  isEdit,
  isFormLoaded,
  form,
  items,
  visibleTableSchema,
  globalProfitMargin,
  applyGlobalProfitMargin,
  headerSubtotal,
  headerGrandTotal,
  getValidationError,
  handleSubmit,
  handleCancel,
  formatNumber,
  unformatNumber,
  handleForeignUnitCostInput,
  handleUnitCostInput,
  handleSellingPriceInput,
  removeRow,
  triggerAddNewEmptyLine,
  handleGlobalItemSelect,
  syncUnitCostPrice,
  purchaseStore,
} = usePurchaseFormLogic()
</script>

<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <!-- شريط العنوان الرئيسي -->
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ isEdit ? 'تعديل مستند المشتريات' : 'فاتورة مشتريات جديدة' }}
        </h1>
      </div>
    </div>

    <!-- تنبيه الخطأ العام الصادر من الخادم -->
    <div
      v-if="purchaseStore.error"
      class="p-3 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-bold shadow-sm"
    >
      {{ purchaseStore.error }}
    </div>

    <!-- 1. ترويسة فاتورة المشتريات (المستودع، المورد، التاريخ، العملة، وطريقة الدفع) -->
    <PurchaseHeader v-model="form" :validation-errors="purchaseStore.validationErrors" />

    <!-- 2. جدول إدخال وبحث بنود المشتريات (النمط الكلاسيكي والحديث المزدوج) -->
    <AppCard>
      <PurchaseItemsTable
        :items="items"
        :form="form"
        :visible-table-schema="visibleTableSchema"
        v-model:global-profit-margin="globalProfitMargin"
        :apply-global-profit-margin="applyGlobalProfitMargin"
        :get-validation-error="getValidationError"
        :format-number="formatNumber"
        :unformat-number="unformatNumber"
        :handle-foreign-unit-cost-input="handleForeignUnitCostInput"
        :handle-unit-cost-input="handleUnitCostInput"
        :handle-selling-price-input="handleSellingPriceInput"
        :remove-row="removeRow"
        :trigger-add-new-empty-line="triggerAddNewEmptyLine"
        :handle-global-item-select="handleGlobalItemSelect"
        :sync-unit-cost-price="syncUnitCostPrice"
      />
    </AppCard>

    <!-- 3. تذييل الفاتورة (الخصم، الضريبة، المجاميع، والملاحظات) -->
    <PurchaseFooter
      v-model:notes="form.notes"
      v-model:discountAmount="form.discount_amount"
      v-model:taxAmount="form.tax_amount"
      :subtotal="headerSubtotal"
      :grand-total="headerGrandTotal"
      :validation-errors="purchaseStore.validationErrors"
    />

    <!-- 4. شريط التحكم السفلي الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        مستند المشتريات والمدخلات المالية الحالية تخضع للمراقبة الجردية والتدقيق اللحظي للأرصدة
        وتكلفة الاستبدال.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>
        <AppButton type="button" size="sm" :disabled="purchaseStore.loading" @click="handleSubmit">
          <span v-if="purchaseStore.loading">جاري حفظ المستند الحالي...</span>
          <span v-else>{{
            isEdit ? 'تحديث ومزامنة الفاتورة' : 'ترحيل وحفظ الفاتورة النهائية'
          }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>
