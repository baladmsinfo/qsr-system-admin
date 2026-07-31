<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Chart of Accounts" subtitle="View all accounts grouped by type">
      <v-btn icon="mdi-refresh" variant="tonal" color="primary" density="comfortable" @click="loadAccounts" :disabled="loading" />
    </MobilePageHeader>

    <div class="pa-4">
      <div v-if="accounts">
        <div v-for="(list, type) in accounts" :key="type" class="mb-5">
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="mobile-section-title">{{ formatHeader(type) }}</div>
            <v-btn color="primary" size="small" variant="tonal" prepend-icon="mdi-plus" @click="openAddDialog(type)">
              Add
            </v-btn>
          </div>

          <div class="app-card mb-2">
            <div v-for="(acc, idx) in list" :key="acc.id" class="d-flex justify-space-between align-center px-4 py-3"
              :class="{ 'account-row--selected': selectedAccountId === acc.id }"
              :style="idx > 0 ? 'border-top: 1px solid #EEE9F7' : ''" @click="selectedAccountId = acc.id">
              <div class="d-flex align-center ga-2" style="min-width: 0">
                <span class="font-weight-medium text-body-2 text-truncate">{{ acc.name }}</span>
                <v-btn v-if="selectedAccountId === acc.id && !protectedAccounts.includes(acc.name)" color="error"
                  size="x-small" variant="text" @click.stop="deleteAccount(acc)">Delete</v-btn>
              </div>
              <span class="font-weight-medium mono-data text-body-2 flex-shrink-0 ml-2">
                {{
                  acc.balance === 0
                    ? $formatPrice(acc.balance)
                    : acc.balance > 0
                      ? `${$formatPrice(acc.balance)} DR`
                      : `${$formatPrice(Math.abs(acc.balance))} CR`
                }}
              </span>
            </div>

            <div v-if="!list.length" class="text-center text-medium-emphasis py-6 text-body-2">No accounts in this group</div>
          </div>
        </div>
      </div>

      <MobileEmptyState v-else icon="mdi-file-chart-outline" title="No accounts found" />
    </div>

    <MobileBottomSheet v-model="addDialog" :title="`Add Account (${formatHeader(selectedType)})`">
      <v-text-field v-model="newAccountName" label="Account Name" variant="outlined" density="comfortable" class="mb-2" />
      <v-text-field v-model="newAccountCode" label="Account Code" variant="outlined" density="comfortable"
        class="mb-3" placeholder="Example: 5300" />
      <v-btn block size="large" color="primary" class="font-weight-bold" :loading="submitting" @click="submitNewAccount">
        Save
      </v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAccountsStore } from '~/stores/accounts'

const { $formatPrice } = useNuxtApp();

const accountsStore = useAccountsStore()

const accounts = ref(null)
const loading = ref(false)
const addDialog = ref(false)
const selectedType = ref(null)
const selectedAccountId = ref(null)

const newAccountName = ref("")
const newAccountCode = ref("")
const submitting = ref(false)
const protectedAccounts = [
  "Cash", "Bank", "Accounts Receivable", "Tax Receivable",
  "Accounts Payable", "Tax Payable", "Sales Revenue", "Purchases",
];

const openAddDialog = (type) => {
  selectedType.value = type
  newAccountName.value = ""
  newAccountCode.value = ""
  addDialog.value = true
}

const deleteAccount = async (acc) => {
  if (!confirm(`Delete account "${acc.name}"?`)) return
  const success = await accountsStore.deleteAccount(acc.id)
  if (success) {
    selectedAccountId.value = null
    loadAccounts()
  }
}

const submitNewAccount = async () => {
  if (!newAccountName.value.trim() || !newAccountCode.value.trim()) return
  submitting.value = true
  const payload = { type: selectedType.value, name: newAccountName.value, code: newAccountCode.value }
  const success = await accountsStore.addAccount(payload)
  submitting.value = false
  if (success) {
    addDialog.value = false
    loadAccounts()
  }
}

const formatHeader = (type) => {
  switch (type) {
    case 'ASSET': return 'Assets'
    case 'LIABILITY': return 'Liabilities'
    case 'EQUITY': return 'Equity'
    case 'INCOME': return 'Income'
    case 'EXPENSE': return 'Expenses'
    default: return type
  }
}

const loadAccounts = async () => {
  loading.value = true
  await accountsStore.fetchGroupedAccounts()
  accounts.value = accountsStore.grouped
  loading.value = false
}

onMounted(async () => {
  await loadAccounts()
})
</script>

<style scoped>
.mobile-section-title {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
}
.account-row--selected {
  background: #F3F1F8;
}
</style>
