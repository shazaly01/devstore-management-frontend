import apiClient from './apiClient'

const resource = '/import'

export default {
  // إرسال مصفوفة بيانات العملاء المستوردة للباك إند وتحديث الأرصدة
  importCustomers(customers) {
    return apiClient.post(`${resource}/customers`, {
      customers,
    })
  },

  // إرسال مصفوفة بيانات الموردين المستوردة للباك إند وتحديث الأرصدة
  importSuppliers(suppliers) {
    return apiClient.post(`${resource}/suppliers`, {
      suppliers,
    })
  },

  // إرسال مصفوفة بيانات الأصناف ومصفوفات الأسعار والوحدات
  importItems(items) {
    return apiClient.post(`${resource}/items`, {
      items,
    })
  },
}
