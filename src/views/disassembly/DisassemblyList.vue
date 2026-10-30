<!--src/views/disassembly/DisassemblyList.vue-->
<template>
  <div class="space-y-6">
    <!-- ترويسة الصفحة وزر الإضافة -->
    <div class="flex justify-between items-center mb-6">
      <div class="text-right" dir="rtl">
        <h1 class="text-2xl font-black text-text-primary">إدارة أذونات التفكيك والتجزئة</h1>
        <p class="text-xs text-text-secondary mt-1">
          استعراض، تتبع، وفلترة حركة تفكيك وتقطيع الدواجن ومراقبة تأثيرها اللحظي على المخازن وتوزيع
          التكاليف.
        </p>
      </div>
      <AppButton type="button" @click="goToCreatePage"> إذن تفكيك جديد </AppButton>
    </div>

    <!-- شريط تصفية البيانات والبحث -->
    <DisassemblyFilters
      v-model:searchQuery="searchQuery"
      v-model:storeFilter="storeFilter"
      v-model:fromDateFilter="fromDateFilter"
      v-model:toDateFilter="toDateFilter"
      @update:searchQuery="onSearch"
      @update:storeFilter="handlePageChange(1)"
      @update:fromDateFilter="handlePageChange(1)"
      @update:toDateFilter="handlePageChange(1)"
    />

    <!-- جدول عرض الأذونات والترقيم -->
    <DisassemblyTable
      :disassemblies="disassemblies"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-disassembly="goToEditPage"
      @delete-disassembly="openDeleteDialog"
      @row-clicked="goToEditPage"
    />

    <!-- حوار تأكيد الحذف والإلغاء المخزني -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد إلغاء وحذف إذن التفكيك"
      :message="`هل أنت متأكد تماماً من رغبتك في حذف وإلغاء إذن التفكيك رقم '${disassemblyToDelete?.document_number}'؟ سيترتب على هذا الإجراء عكس فوري لكافة الحركات المخزنية، وشطب توريد الأجزاء الناتجة، وإعادة رصيد الصنف الخام المصروف إلى المستودع.`"
      @confirmed="deleteSelectedDisassembly"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisassemblyStore } from '@/stores/disassemblyStore'
import { useStoreStore } from '@/stores/storeStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import DisassemblyFilters from './DisassemblyFilters.vue'
import DisassemblyTable from './DisassemblyTable.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const router = useRouter()
const toast = useToast()

const disassemblyStore = useDisassemblyStore()
const storeStore = useStoreStore()

const { disassemblies, loading, pagination } = storeToRefs(disassemblyStore)

const searchQuery = ref('')
const storeFilter = ref('')
const fromDateFilter = ref('')
const toDateFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    store_id: storeFilter.value,
    from_date: fromDateFilter.value,
    to_date: toDateFilter.value,
  }

  disassemblyStore.fetchDisassemblies(page, filters).catch(() => {
    toast.error('فشل النظام في جلب أذونات التفكيك المحدثة من الخادم.')
  })
}

onMounted(async () => {
  handlePageChange(1)
  await storeStore.fetchStores(1, { is_active: 1 })
})

const goToCreatePage = () => {
  router.push('/app/disassemblies/create')
}

const goToEditPage = (disassembly) => {
  router.push(`/app/disassemblies/${disassembly.id}/edit`)
}

const isDeleteDialogOpen = ref(false)
const disassemblyToDelete = ref(null)

const openDeleteDialog = (disassembly) => {
  disassemblyToDelete.value = disassembly
  isDeleteDialogOpen.value = true
}

const deleteSelectedDisassembly = async () => {
  if (disassemblyToDelete.value) {
    try {
      await disassemblyStore.deleteDisassembly(disassemblyToDelete.value.id)
      toast.success(
        `تم حذف وإلغاء إذن التفكيك رقم '${disassemblyToDelete.value.document_number}' وعكس أثره المخزني بنجاح.`,
      )

      if (disassemblies.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch {
      const errorMessage = disassemblyStore.error || 'فشلت عملية إلغاء وحذف إذن التفكيك من النظام.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      disassemblyToDelete.value = null
    }
  }
}
</script>
