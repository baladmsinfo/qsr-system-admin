<template>
  <v-container fluid class="pa-6">
    <v-card elevation="2" class="rounded-lg">

      <!-- 🔹 Header -->
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        <div>
          Chart of Accounts
          <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
            View all accounts grouped by type
          </p>
        </div>

        <v-btn color="primary" variant="flat" @click="loadAccounts" :disabled="loading">
          REFRESH
        </v-btn>
      </v-card-title>

      <v-divider />

      <div v-if="accounts" class="pa-4">

        <template v-for="(list, type) in accounts" :key="type">

          <div class="d-flex justify-space-between align-center mt-6 mb-2">
            <h3 class="text-body-1 font-weight-bold">
              {{ formatHeader(type) }}
            </h3>

            <v-btn color="primary" size="small" variant="flat" class="rounded-pill" @click="openAddDialog(type)">
              <v-icon left>mdi-plus</v-icon>
              Add {{ formatHeader(type) }}
            </v-btn>
          </div>

          <table class="pl-table">
            <tbody>
              <tr v-for="acc in list" :key="acc.id" @click="selectedAccountId = acc.id"
                :class="{ selectedRow: selectedAccountId === acc.id }" class="cursor-pointer">
                <td>{{ acc.name }}
                  <v-btn v-if="selectedAccountId === acc.id && !protectedAccounts.includes(acc.name)" color="red"
                    size="small" variant="text" class="ms-2" @click.stop="deleteAccount(acc)"> Delete Account </v-btn>
                </td>

                <td class="text-end">
                  {{
                    acc.balance === 0
                      ? $formatPrice(acc.balance)
                      : acc.balance > 0
                        ? `${$formatPrice(acc.balance)} DR`
                  : `${$formatPrice(Math.abs(acc.balance))} CR`
                  }}
                </td>
              </tr>
            </tbody>
          </table>

        </template>

      </div>

      <v-alert v-else type="info" variant="tonal" border="start" class="ma-4">
        No accounts found.
      </v-alert>

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

    </v-card>
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
.pl-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-bottom: 20px;
}

.pl-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #eee;
}

.text-end {
  text-align: right;
}
</style>