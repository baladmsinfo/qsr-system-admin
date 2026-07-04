<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Tax Rates</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Manage GST / VAT / Other tax rates</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Add Tax</v-btn>
    </div>

    <!-- Tax Cards -->
    <v-row v-if="taxStore.taxes.length">
      <v-col v-for="item in taxStore.taxes" :key="item.id" cols="12" sm="6" lg="4">
        <div class="app-card pa-5 h-100 d-flex flex-column">
          <div class="d-flex justify-space-between align-start mb-2">
            <div class="font-weight-bold text-subtitle-1">{{ item.name }}</div>
            <div>
              <v-btn size="small" icon="mdi-pencil-outline" variant="text" @click="editTax(item)" />
              <v-btn size="small" icon="mdi-delete-outline" variant="text" color="error" @click="deleteTax(item.id)" />
            </div>
          </div>
          <v-chip size="small" variant="tonal" class="align-self-start">{{ item.type }}</v-chip>
          <v-spacer />
          <div class="text-h5 font-weight-bold mono-data mt-3">{{ item.rate }}%</div>
        </div>
      </v-col>
    </v-row>

    <div v-else class="app-card pa-10 text-center text-medium-emphasis">
      <div v-if="taxStore.loading"><v-progress-circular indeterminate color="primary" /></div>
      <div v-else>No tax rates found.</div>
    </div>

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