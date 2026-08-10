import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSaleStore } from '@/stores/saleStore'
import { useItemStore } from '@/stores/itemStore'
import { useAuthStore } from '@/stores/authStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
import { useToast } from 'vue-toastification'

export function useSaleFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const saleStore = useSaleStore()
  const itemStore = useItemStore()
  const authStore = useAuthStore()
  const customerStore = useCustomerStore()

  const isEdit = computed(() => !!route.params.id)

  // تحديد ما إذا كانت الشاشة مفتوحة لإنشاء مردود من فاتورة مباعة
  const isReturnFromInvoice = computed(() => !!route.query.return_from)

  // بوابة التحكم الهندسية لحالة استعداد البيانات في دورة الحياة (Lifecycle Guard)
  const isFormLoaded = ref(false)

  const form = ref({
    invoice_type: 'sale',
    parent_id: null,
    store_id: '',
    treasury_id: '',
    bank_id: '',
    customer_id: '',
    invoice_date: new Date().toISOString().substr(0, 10),
    payment_type: 'card',
    discount_amount: 0,
    tax_amount: 0,
    customer_name_text: null,
    notes: '',
  })

  const items = ref([])

  // مراقبة طريقة الدفع وإعادة شحن القيم للمستند الجديد أو المستند المعدل
  watch(
    () => form.value.payment_type,
    (newType) => {
      if (newType === 'cash') {
        form.value.bank_id = ''
        form.value.treasury_id =
          isEdit.value && saleStore.currentSale?.treasury_id
            ? saleStore.currentSale.treasury_id
            : authStore.user?.treasury_id || ''
      } else if (newType === 'card') {
        form.value.treasury_id = ''
        form.value.bank_id =
          isEdit.value && saleStore.currentSale?.bank_id
            ? saleStore.currentSale.bank_id
            : authStore.user?.bank_id || ''
      } else if (newType === 'credit') {
        form.value.treasury_id = ''
        form.value.bank_id = ''
      }
    },
  )

  const detailSchema = [
    // أعمدة مخفية
    {
      key: 'item_id',
      extractFromItem: (item) => item.id,
    },
    {
      key: 'available_units',
      defaultValue: [],
      extractFromItem: (item) => item.units || [],
    },
    {
      key: 'base_stock',
      extractFromItem: (item) => parseFloat(item.current_stock) || 0,
    },

    // أعمدة مرئية بالترتيب المحدث لنظام مبيعات التجزئة
    {
      key: 'item_id_display',
      label: 'رقم الصنف',
      widthClass: 'w-[15%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => (item.id ? `PRD-${item.id}` : ''),
    },
    {
      key: 'item_name',
      label: 'اسم الصنف التجاري المعتمد',
      widthClass: 'w-[30%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => item.name || '',
    },
    {
      key: 'item_unit_id',
      label: 'وحدة البيع',
      slot: 'cell-item_unit_id',
      widthClass: 'w-[15%]',
      type: 'text',
      extractFromItem: (item) => item.units?.[0]?.id || '',
    },
    {
      key: 'quantity',
      label: 'الكمية المباعة',
      type: 'number',
      defaultValue: 1,
      widthClass: 'w-[12%]',
      slot: 'cell-quantity',
    },
    {
      key: 'unit_price',
      label: 'سعر الوحدة',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[13%]',
      // استخراج السعر المبدئي تلقائياً بناءً على فئة العميل المختار
      extractFromItem: (item) => {
        const matchedUnit = item.units?.[0]
        if (!matchedUnit) return 0

        const currentCustomer = customerStore.customers?.find(
          (c) => c.id === form.value.customer_id,
        )
        const priceListId = currentCustomer ? currentCustomer.price_list_id : null

        const matchedPriceEntry =
          priceListId && matchedUnit.prices
            ? matchedUnit.prices.find((p) => p.price_list_id === priceListId)
            : null

        if (
          matchedPriceEntry &&
          matchedPriceEntry.price !== null &&
          matchedPriceEntry.price !== undefined
        ) {
          return matchedPriceEntry.price
        }

        return matchedUnit.price || 0
      },
      slot: 'cell-unit_price',
    },
    {
      key: 'grand_total',
      label: 'الإجمالي',
      type: 'calculated',
      readonly: true,
      summary: true,
      widthClass: 'w-[15%]',
      formula: (row) => {
        const q = parseFloat(row.quantity) || 0
        const p = parseFloat(row.unit_price) || 0
        return parseFloat((q * p).toFixed(4))
      },
      slot: 'cell-grand_total',
    },
    {
      key: 'available_stock',
      label: 'المخزون المتاح',
      type: 'calculated',
      readonly: true,
      widthClass: 'w-[10%]',
      formula: (row) => {
        if (row.base_stock === null || row.base_stock === undefined) return 0
        const matchedUnit = row.available_units?.find((u) => u.id === row.item_unit_id)
        const factor = matchedUnit ? parseFloat(matchedUnit.conversion_factor) || 1 : 1
        return parseFloat((row.base_stock / factor).toFixed(2))
      },
    },
  ]

  const visibleTableSchema = computed(() => detailSchema.filter((col) => col.label))

  // ربط useDynamicDetails بالـ ref الأصلي
  const { createEmptyRow, handleItemSelected, removeRow } = useDynamicDetails(items, detailSchema, {
    uniqueKeys: ['item_id', 'item_unit_id'],
    mergeQtyKey: 'quantity',
  })

  const triggerAddNewEmptyLine = () => {
    items.value.push(createEmptyRow())
  }

  const handleGlobalItemSelect = (selectedItem) => {
    if (!selectedItem) return
    handleItemSelected(selectedItem)
  }

  const headerSubtotal = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.grand_total) || 0), 0)
  })

  const headerGrandTotal = computed(() => {
    const sub = headerSubtotal.value
    const disc = parseFloat(form.value.discount_amount) || 0
    const tax = parseFloat(form.value.tax_amount) || 0
    return parseFloat(Math.max(0, sub - disc + tax).toFixed(4))
  })

  const getValidationError = (path) => {
    return saleStore.validationErrors?.[path]?.[0] || null
  }

  onMounted(async () => {
    // جلب العملاء لضمان مطابقة الفئات السعرية بأمان
    await customerStore.fetchCustomers(1, { is_active: 1 })

    if (isEdit.value) {
      await saleStore.fetchSale(route.params.id)
      if (saleStore.currentSale) {
        const cur = saleStore.currentSale

        form.value = {
          invoice_type: cur.invoice_type,
          parent_id: cur.parent_id,
          store_id: cur.store_id || '',
          treasury_id: cur.treasury_id || '',
          bank_id: cur.bank_id || '',
          customer_id: cur.customer_id,
          invoice_date: cur.invoice_date.substr(0, 10),
          payment_type: cur.payment_type,
          discount_amount: cur.discount_amount || 0,
          tax_amount: cur.tax_amount || 0,
          customer_name_text: cur.customer_name_text || null,
          notes: cur.notes || '',
        }

        items.value = cur.items.map((it) => {
          return {
            item_id_display: it.item_id ? `PRD-${it.item_id}` : '',
            item_name: it.item_name || '',
            item_id: it.item_id,
            item_unit_id: it.item_unit_id,
            quantity: it.quantity,
            unit_price: it.unit_price,
            grand_total: it.grand_total,
            available_units: it.available_units || [],
            base_stock: parseFloat(it.current_stock) || 0,
            _flashing: false,
          }
        })

        if (cur.store_id) {
          await itemStore.fetchItems(1, { is_active: 1, store_id: cur.store_id, all: true })

          // حقن مصفوفة الوحدات والأسعار المحدثة لكل صنف تم تحميله تاريخياً
          items.value.forEach((row) => {
            const matchedStoreItem = itemStore.items?.find((it) => it.id === row.item_id)
            if (matchedStoreItem) {
              row.available_units = matchedStoreItem.units || []
            }
          })
        }
      }
    } else if (route.query.return_from) {
      // وضعية المردود التلقائي
      await saleStore.fetchSale(route.query.return_from)
      if (saleStore.currentSale) {
        const cur = saleStore.currentSale

        form.value = {
          invoice_type: 'return',
          parent_id: cur.id,
          store_id: cur.store_id || '',
          treasury_id: cur.treasury_id || '',
          bank_id: cur.bank_id || '',
          customer_id: cur.customer_id,
          invoice_date: new Date().toISOString().substr(0, 10),
          payment_type: cur.payment_type,
          discount_amount: 0,
          tax_amount: 0,
          customer_name_text: cur.customer_name_text || null,
          notes: `مردود مبيعات تلقائي ناتج عن الفاتورة المرجعية رقم: ${cur.invoice_number || cur.id}`,
        }

        // نسخ عناصر وأسطر الفاتورة
        items.value = cur.items.map((it) => {
          return {
            item_id_display: it.item_id ? `PRD-${it.item_id}` : '',
            item_name: it.item_name || '',
            item_id: it.item_id,
            item_unit_id: it.item_unit_id,
            quantity: it.quantity,
            unit_price: it.unit_price,
            grand_total: it.grand_total,
            available_units: it.available_units || [],
            base_stock: parseFloat(it.current_stock) || 0,
            _flashing: false,
          }
        })

        if (cur.store_id) {
          await itemStore.fetchItems(1, { is_active: 1, store_id: cur.store_id, all: true })

          items.value.forEach((row) => {
            const matchedStoreItem = itemStore.items?.find((it) => it.id === row.item_id)
            if (matchedStoreItem) {
              row.available_units = matchedStoreItem.units || []
            }
          })
        }
      }
    } else {
      if (authStore.user) {
        form.value.store_id = authStore.user.store_id || ''
        form.value.treasury_id = authStore.user.treasury_id || ''
        form.value.bank_id = authStore.user.bank_id || ''
        form.value.customer_name_text = null
      }

      // 1. تأكيد اختيار طريقة الدفع (شبكة / دفع إلكتروني) وتعيين البنك المربوط ببيانات المستخدم
      form.value.payment_type = 'card'
      if (authStore.user?.bank_id) {
        form.value.bank_id = authStore.user.bank_id
      }

      // 2. البحث عن عميل عام أو عميل مباشر واختياره تلقائياً من قائمة العملاء
      const defaultCustomer = customerStore.customers?.find((c) => {
        const name = (c.name || c.display_label || '').trim()
        return name.includes('عميل عام') || name.includes('عميل مباشر')
      })

      if (defaultCustomer) {
        form.value.customer_id = defaultCustomer.id
      }
    }

    isFormLoaded.value = true
  })

  const handleSubmit = async () => {
    const dynamicItemsPayload = items.value
      .filter((row) => row.item_id && row.item_unit_id)
      .map((row) => {
        return {
          item_id: row.item_id,
          item_unit_id: row.item_unit_id,
          quantity: parseFloat(row.quantity) || 0,
          unit_price: parseFloat(row.unit_price) || 0,
          subtotal: parseFloat(row.grand_total) || 0,
          discount_amount: 0,
          grand_total: parseFloat(row.grand_total) || 0,
        }
      })

    const finalPayload = {
      ...form.value,
      subtotal: headerSubtotal.value,
      grand_total: headerGrandTotal.value,
      items: dynamicItemsPayload,
    }

    try {
      if (isEdit.value) {
        await saleStore.updateSale(route.params.id, finalPayload)
        toast.success('تم تحديث ومزامنة مستند المبيعات بنجاح.')
      } else {
        await saleStore.createSale(finalPayload)
        toast.success(
          form.value.invoice_type === 'return'
            ? 'تم ترحيل مستند مردود المبيعات وإدخال الأرصدة للمخازن بنجاح.'
            : 'تم ترحيل فاتورة المبيعات واقتطاع الأرصدة بنجاح.',
        )
      }
      router.push('/app/sales')
    } catch {
      toast.error('فشلت عملية الحفظ، يرجى التحقق من نواقص الكميات والأخطاء.')
    }
  }

  const handleCancel = () => {
    router.push('/app/sales')
  }

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return ''
    const num = Number(value)
    if (isNaN(num)) return ''
    const options = {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    }
    return new Intl.NumberFormat('en-US', options).format(num)
  }

  const unformatNumber = (text) => {
    if (!text) return 0
    const cleaned = text.replace(/[^0-9.]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  return {
    isFormLoaded,
    isEdit,
    isReturnFromInvoice,
    form,
    items,
    detailSchema,
    visibleTableSchema,
    headerSubtotal,
    headerGrandTotal,
    getValidationError,
    handleSubmit,
    handleCancel,
    formatNumber,
    unformatNumber,
    removeRow,
    triggerAddNewEmptyLine,
    handleGlobalItemSelect,
    saleStore,
    itemStore,
  }
}
