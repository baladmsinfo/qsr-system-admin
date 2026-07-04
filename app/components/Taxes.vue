<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-sheet class="d-flex align-center justify-space-between mb-6 bg-transparent">
      <div>
        <h2 class="text-h5 font-weight-bold mb-0">Tax Rates</h2>
        <p class="text-body-2 text-medium-emphasis">Manage GST / VAT / Other tax rates</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Add Tax</v-btn>
    </v-sheet>

    <!-- Tax List -->
    <v-card>
      <v-data-table
        :items="taxStore.taxes"
        :loading="taxStore.loading"
        :headers="headers"
        class="elevation-1"
      >
        <template #item.actions="{ item }">
          <v-btn size="small" icon="mdi-pencil-outline" variant="text" @click="editTax(item)" />
          <v-btn
            size="small"
            icon="mdi-delete-outline"
            variant="text"
            color="error"
            @click="deleteTax(item.id)"
          />
        </template>

        <template #loading>
          <v-progress-linear indeterminate color="primary" />
        </template>

        <template #no-data>
          <v-alert type="info" class="ma-4">No tax rates found.</v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ isEdit ? 'Edit Tax Rate' : 'Add Tax Rate' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="valid" lazy-validation>
            <v-text-field
              v-model="form.name"
              label="Tax Name"
              :rules="[v => !!v || 'Name is required']"
              outlined dense
            />
            <v-text-field
              v-model="form.rate"
              label="Rate (%)"
              type="number"
              :rules="[v => v >= 0 || 'Rate must be positive']"
              outlined dense
            />
            <v-select
              v-model="form.type"
              :items="['GST', 'VAT', 'Service Tax', 'Other']"
              label="Tax Type"
              outlined dense
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!valid" @click="saveTax">
            {{ isEdit ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTaxStore } from '@/stores/tax'

const taxStore = useTaxStore()

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Rate (%)', key: 'rate' },
  { title: 'Type', key: 'type' },
  { title: 'Actions', key: 'actions', align: 'end' },
]

const dialog = ref(false)
const formRef = ref(null)
const valid = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const form = ref({
  name: '',
  rate: '',
  type: '',
})

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