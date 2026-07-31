<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Tax Rates" subtitle="Manage GST / VAT / Other tax rates" />

    <div class="pa-4">
      <MobileEmptyState v-if="!taxStore.taxes.length && !taxStore.loading" icon="mdi-percent-outline" title="No tax rates found">
        <template #action>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Add Tax</v-btn>
        </template>
      </MobileEmptyState>

      <MobileLoading v-else-if="taxStore.loading && !taxStore.taxes.length" :count="3" type="card" />

      <div v-else class="mobile-tax-grid">
        <div v-for="item in taxStore.taxes" :key="item.id" class="app-card pa-3">
          <div class="d-flex justify-space-between align-start mb-1">
            <div class="font-weight-bold text-body-2">{{ item.name }}</div>
            <div class="flex-shrink-0">
              <v-btn size="x-small" icon="mdi-pencil-outline" variant="text" @click="editTax(item)" />
              <v-btn size="x-small" icon="mdi-delete-outline" variant="text" color="error" @click="deleteTax(item.id)" />
            </div>
          </div>
          <v-chip size="x-small" variant="tonal" class="mb-2">{{ item.type }}</v-chip>
          <div class="text-h6 font-weight-bold mono-data">{{ item.rate }}%</div>
        </div>
      </div>
    </div>

    <MobileActionBar v-if="taxStore.taxes.length">
      <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="openDialog()">
        Add Tax
      </v-btn>
    </MobileActionBar>

    <MobileBottomSheet v-model="dialog" :title="isEdit ? 'Edit Tax Rate' : 'Add Tax Rate'">
      <v-form ref="formRef" v-model="valid" lazy-validation>
        <v-text-field v-model="form.name" label="Tax Name" :rules="[v => !!v || 'Name is required']" class="mb-2" />
        <v-text-field v-model="form.rate" label="Rate (%)" type="number" :rules="[v => v >= 0 || 'Rate must be positive']" class="mb-2" />
        <v-select v-model="form.type" :items="['GST', 'VAT', 'Service Tax', 'Other']" label="Tax Type" class="mb-3" />
      </v-form>
      <v-btn block size="large" color="primary" class="font-weight-bold" :disabled="!valid" @click="saveTax">
        {{ isEdit ? 'Update' : 'Save' }}
      </v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTaxStore } from '@/stores/tax'

const taxStore = useTaxStore()

const dialog = ref(false)
const formRef = ref(null)
const valid = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const form = ref({ name: '', rate: '', type: '' })

onMounted(() => {
  taxStore.fetchTaxes()
})

function openDialog() {
  form.value = { name: '', rate: '', type: '' }
  isEdit.value = false
  dialog.value = true
}

function editTax(item) {
  form.value = { name: item.name, rate: item.rate, type: item.type }
  isEdit.value = true
  editId.value = item.id
  dialog.value = true
}

async function saveTax() {
  if (!formRef.value.validate()) return
  const payload = { ...form.value, rate: parseFloat(form.value.rate) }
  if (isEdit.value) await taxStore.updateTax(editId.value, payload)
  else await taxStore.addTax(payload)
  dialog.value = false
}

async function deleteTax(id) {
  if (confirm('Are you sure you want to delete this tax rate?')) {
    await taxStore.deleteTax(id)
  }
}
</script>

<style scoped>
.mobile-tax-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding-bottom: 88px;
}
.mobile-tax-grid > * {
  min-width: 0;
}
</style>
