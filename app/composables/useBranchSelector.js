import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'

/**
 * SUPERADMIN can operate on any branch and must pick one; branch-scoped
 * staff (BRANCHADMIN/KITCHEN/CASHIER/WAITER/ACCOUNTANT) are pinned to their
 * own branch and never see the selector.
 */
export function useBranchSelector() {
  const auth = useAuthStore()
  const company = useCompanyStore()

  const isSuperAdmin = computed(() => auth.userInfo?.role === 'SUPERADMIN')
  const selectedBranchId = ref(auth.userInfo?.branchId || null)

  const branchOptions = computed(() =>
    (company.branches || []).map((b) => ({ title: b.name, value: b.id }))
  )

  onMounted(async () => {
    if (isSuperAdmin.value) {
      await company.fetchBranchOptions()
      if (!selectedBranchId.value && company.branches?.length) {
        selectedBranchId.value = company.branches[0].id
      }
    }
  })

  return { isSuperAdmin, selectedBranchId, branchOptions }
}
