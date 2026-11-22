// src/stores/roleStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import roleService from '@/services/roleService'

export const useRoleStore = defineStore('roles', () => {
  // --- State ---
  const roles = ref([])
  const permissions = ref({ modules: [], actions: [] })
  const pagination = ref({})
  const loading = ref(false)
  const error = ref(null)

  // --- Helper ---
  function _updateOrAddInList(updatedRole) {
    const index = roles.value.findIndex((r) => r.id === updatedRole.id)
    if (index !== -1) {
      roles.value[index] = { ...roles.value[index], ...updatedRole }
    } else {
      fetchRoles(pagination.value.current_page || 1)
    }
  }

  // --- Actions ---
  async function fetchRoles(page = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await roleService.get(page)
      roles.value = response.data.data || []
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'Failed to fetch roles.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchPermissions() {
    try {
      if (permissions.value.modules && permissions.value.modules.length > 0) return

      const response = await roleService.getAllPermissions()
      permissions.value = response.data
    } catch (err) {
      console.error('Failed to fetch permissions:', err)
    }
  }

  async function createRole(roleData) {
    loading.value = true
    try {
      await roleService.create(roleData)
      await fetchRoles()
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function editRoleName(id, roleData) {
    loading.value = true
    try {
      const response = await roleService.update(id, roleData)
      _updateOrAddInList(response.data.data)
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateRole(id, roleData) {
    loading.value = true
    try {
      const response = await roleService.update(id, roleData)
      _updateOrAddInList(response.data.data)
    } catch (err) {
      console.error('Failed to update role:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteRole(id) {
    loading.value = true
    try {
      await roleService.delete(id)
      await fetchRoles(pagination.value.current_page || 1)
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function submitRole(roleData) {
    loading.value = true
    try {
      let response
      if (roleData.id) {
        response = await roleService.update(roleData.id, { name: roleData.name })
      } else {
        response = await roleService.create({ name: roleData.name })
      }
      _updateOrAddInList(response.data.data)
      await fetchRoles()
    } catch (err) {
      console.error('Failed to submit role:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    roles,
    permissions,
    pagination,
    loading,
    error,
    fetchRoles,
    fetchPermissions,
    createRole,
    editRoleName,
    updateRole,
    deleteRole,
    submitRole,
  }
})
