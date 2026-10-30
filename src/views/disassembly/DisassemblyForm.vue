<!--src/views/disassembly/DisassemblyForm.vue-->
<script setup>
import { useDisassemblyFormLogic } from '@/composables/useDisassemblyFormLogic'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'

import DisassemblyHeader from './components/DisassemblyHeader.vue'
import DisassemblyItemsTable from './components/DisassemblyItemsTable.vue'
import DisassemblyFooter from './components/DisassemblyFooter.vue'

const {
  isEdit,
  form,
  items,
  sourceAvailableUnits,
  sourceAvailableStock,
  totalOutputsWeight,
  weightDifference,
  totalAllocatedCost,
  costDifference,
  disassemblyStore,
  addEmptyRow,
  removeRow,
  selectItemForRow,
  handleOutputUnitChange,
  recalculateOutputCosts,
  handleSubmit,
  handleCancel,
  formatNumber,
  getValidationError,
} = useDisassemblyFormLogic()
</script>

<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <!-- شريط العنوان الرئيسي -->
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ isEdit ? 'تعديل إذن تفكيك وتجزئة' : 'إذن تفكيك وتجزئة دواجن جديد' }}
        </h1>
        <p class="text-[11px] text-text-secondary mt-0.5">
          صرف الدجاج الكامل الخام وتوليد الأجزاء الناتجة وتوزيع التكلفة بالأوزان والقيم البيعية
          آلياً.
        </p>
      </div>
    </div>

    <!-- تنبيه الخطأ العام الصادر من الخادم -->
    <div
      v-if="disassemblyStore.error"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ disassemblyStore.error }}
    </div>

    <!-- 1. رأس المستند (المستودع، التاريخ، الصنف الخام المصروف) -->
    <DisassemblyHeader
      v-model="form"
      :source-available-units="sourceAvailableUnits"
      :source-available-stock="sourceAvailableStock"
      :validation-errors="disassemblyStore.validationErrors"
    />

    <!-- 2. جدول الأجزاء الناتجة مع البحث المباشر وتوزيع التكلفة اللحظي -->
    <AppCard>
      <DisassemblyItemsTable
        :items="items"
        :source-item-id="form.source_item_id"
        :format-number="formatNumber"
        :get-validation-error="getValidationError"
        :select-item-for-row="selectItemForRow"
        :add-empty-row="addEmptyRow"
        @unit-changed="handleOutputUnitChange"
        @recalculate="recalculateOutputCosts"
        @remove-row="removeRow"
      />
    </AppCard>

    <!-- 3. تذييل المطابقة (ميزان الأوزان وميزان التكلفة والملاحظات) -->
    <DisassemblyFooter
      v-model:wasteQuantity="form.waste_quantity"
      v-model:notes="form.notes"
      :source-quantity="form.source_quantity"
      :total-outputs-weight="totalOutputsWeight"
      :weight-difference="weightDifference"
      :source-total-cost="form.source_total_cost"
      :total-allocated-cost="totalAllocatedCost"
      :cost-difference="costDifference"
      :validation-errors="disassemblyStore.validationErrors"
      @recalculate="recalculateOutputCosts"
    />

    <!-- 4. شريط الأزرار والتحكم السفلي الثابت (Fixed Bottom Bar) -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        اعتماد هذا الإذن سيقوم بصرف الصنف الخام وتوريد الأجزاء الناتجة وتحديث تكاليفها الدفترية
        فوراً.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>
        <AppButton
          type="button"
          size="sm"
          :disabled="disassemblyStore.loading"
          @click="handleSubmit"
        >
          <span v-if="disassemblyStore.loading">جاري ترحيل ومعالجة الإذن...</span>
          <span v-else>{{
            isEdit ? 'تحديث ومزامنة إذن التفكيك' : 'اعتماد وترحيل إذن التفكيك النهائي'
          }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>
