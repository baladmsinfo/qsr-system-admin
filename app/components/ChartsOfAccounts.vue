<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Chart of Accounts</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">View all accounts grouped by type</p>
      </div>
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="loadAccounts" :disabled="loading">
        Refresh
      </v-btn>
    </div>

    <div v-if="accounts">
      <div v-for="(list, type) in accounts" :key="type">
        <div class="d-flex justify-space-between align-center mb-3 mt-6">
          <h3 class="text-subtitle-1 font-weight-bold">{{ formatHeader(type) }}</h3>
          <v-btn color="primary" size="small" variant="tonal" prepend-icon="mdi-plus" @click="openAddDialog(type)">
            Add {{ formatHeader(type) }}
          </v-btn>
        </div>

        <div class="app-card mb-2">
          <div v-for="(acc, idx) in list" :key="acc.id" class="d-flex justify-space-between align-center px-5 py-3 cursor-pointer"
            :class="{ 'account-row--selected': selectedAccountId === acc.id }"
            :style="idx > 0 ? 'border-top: 1px solid #EAE6F2' : ''" @click="selectedAccountId = acc.id">
            <div class="d-flex align-center ga-2">
              <span class="font-weight-medium">{{ acc.name }}</span>
              <v-btn v-if="selectedAccountId === acc.id && !protectedAccounts.includes(acc.name)" color="error"
                size="small" variant="text" @click.stop="deleteAccount(acc)">Delete</v-btn>
            </div>
            <span class="font-weight-medium mono-data">
              {{
                acc.balance === 0
                  ? $formatPrice(acc.balance)
                  : acc.balance > 0
                    ? `${$formatPrice(acc.balance)} DR`
                    : `${$formatPrice(Math.abs(acc.balance))} CR`
              }}
            </span>
          </div>

          <div v-if="!list.length" class="text-center text-medium-emphasis py-6">No accounts in this group</div>
        </div>
      </div>
    </div>

    <div v-else class="app-card pa-10 text-center text-medium-emphasis">
      No accounts found.
    </div>

      <!-- ➕ ADD ACCOUNT DIALOG -->
      <v-dialog v-model="addDialog" max-width="450">
        <v-card class="pa-4">
          <h3 class="text-h6 font-weight-bold mb-3">
            Add Account ({{ formatHeader(selectedType) }})
          </h3>

          <v-text-field v-model="newAccountName" label="Account Name" variant="outlined" density="comfortable"
            class="mb-3" />

          <v-text-field v-model="newAccountCode" label="Account Code" variant="outlined" density="comfortable"
            class="mb-3" placeholder="Example: 5300" />

          <div class="d-flex justify-end mt-4">
            <v-btn variant="text" class="me-2" @click="addDialog = false">Cancel</v-btn>

            <v-btn color="primary" variant="flat" :loading="submitting" @click="submitNewAccount">
              Save
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
  </v-container>
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
  "Cash",
  "Bank",
  "Accounts Receivable",
  "Tax Receivable",
  "Accounts Payable",
  "Tax Payable",
  "Sales Revenue",
  "Purchases",
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

  const payload = {
    type: selectedType.value,
    name: newAccountName.value,
    code: newAccountCode.value,
  }

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
.account-row--selected {
  background: #F3F1F8;
}
</style>