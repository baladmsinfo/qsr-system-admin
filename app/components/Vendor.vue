<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-sheet elevation="0" class="d-flex align-center justify-space-between mb-6 px-4 py-3 bg-surface rounded-lg">
      <div>
        <h2 class="text-h5 font-weight-bold mb-0">Vendors</h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage all your suppliers and purchase partners
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">
        Add Vendor
      </v-btn>
    </v-sheet>

    <!-- Vendor Table -->
    <v-data-table-server :headers="headers" :items="vendorStore.vendors" :items-length="vendorStore.total"
      v-model:page="page" v-model:items-per-page="vendorStore.take" :loading="vendorStore.loading"
      class="elevation-1 rounded-lg">
      <template #item.actions="{ item }">
        <v-icon size="20" color="primary" class="me-2" @click="openDialog(item)">
          mdi-pencil
        </v-icon>
        <v-icon size="20" color="primary" class="me-2" @click="viewVendor(item.id)">
          mdi-eye
        </v-icon>
        <v-icon size="20" color="error" @click="confirmDelete(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table-server>

    <v-dialog v-model="viewDialog" fullscreen transition="dialog-bottom-transition">
      <v-card class="bg-grey-lighten-5">

        <!-- HEADER -->
        <v-toolbar flat color="primary">
          <v-btn icon @click="viewDialog = false">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>

          <v-toolbar-title class="font-weight-bold">
            Vendor Details
          </v-toolbar-title>
        </v-toolbar>

        <!-- LOADING STATE -->
        <v-container v-if="!vendorStore.selectedVendor" class="fill-height d-flex align-center justify-center">
          <v-progress-circular indeterminate color="primary" />
        </v-container>

        <!-- VENDOR CONTENT -->
        <v-container v-else class="pa-6">

          <!-- VENDOR HERO -->
          <v-card class="pa-6 mb-6 rounded-xl" elevation="3">
            <v-row align="center">
              <v-col cols="12" md="8">
                <h2 class="text-h5 font-weight-bold mb-1">
                  {{ vendorStore.selectedVendor.name }}
                </h2>

                <div class="text-medium-emphasis mb-2">
                  <v-icon size="16">mdi-phone</v-icon>
                  {{ vendorStore.selectedVendor.phone || '-' }}
                  &nbsp;•&nbsp;
                  <v-icon size="16">mdi-email</v-icon>
                  {{ vendorStore.selectedVendor.email || '-' }}
                </div>

                <v-chip size="small" color="primary" variant="tonal">
                  GSTIN: {{ vendorStore.selectedVendor.gstin || 'NA' }}
                </v-chip>
              </v-col>

              <v-col cols="12" md="4" class="text-md-right">
                <div class="text-caption text-medium-emphasis">Vendor Since</div>
                <div class="font-weight-medium">
                  {{ new Date(vendorStore.selectedVendor.createdAt).toLocaleDateString() }}
                </div>
              </v-col>
            </v-row>
          </v-card>

          <!-- STATS -->
          <v-row class="mb-6">
            <v-col cols="12" md="6">
              <v-card class="pa-5 rounded-xl" elevation="1">
                <div class="text-caption text-medium-emphasis">Total Purchases</div>
                <h3 class="text-h6 font-weight-bold">
                  {{ vendorStore.selectedVendor.purchases?.length || 0 }}
                </h3>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card class="pa-5 rounded-xl" elevation="1">
                <div class="text-caption text-medium-emphasis">Total Spent</div>
                <h3 class="text-h6 font-weight-bold">
                  {{$formatPrice(vendorStore.selectedVendor.purchases?.reduce((s, p) => s + p.totalAmount, 0) || 0)}}
                </h3>
              </v-card>
            </v-col>
          </v-row>

          <!-- ADDRESS -->
          <v-card class="pa-6 mb-6 rounded-xl" elevation="2">
            <h3 class="text-subtitle-1 font-weight-bold mb-4">Address</h3>

            <div v-if="vendorStore.selectedVendor.address" class="d-flex align-start">
              <v-icon size="20" class="me-3 text-medium-emphasis">
                mdi-map-marker
              </v-icon>
              <div class="text-body-2">
                {{ vendorStore.selectedVendor.address }}
              </div>
            </div>

            <div v-else class="text-body-2 text-medium-emphasis">
              No address provided
            </div>
          </v-card>

          <!-- PURCHASE HISTORY -->
          <v-card class="pa-6 rounded-xl" elevation="2">
            <h3 class="text-subtitle-1 font-weight-bold mb-6">Purchase History</h3>

            <!-- DATE FILTER -->
            <v-card class="pa-5 rounded-xl mb-6" elevation="1">
              <v-row align="stretch" dense>
                <v-col cols="12" md="4">
                  <v-menu v-model="startMenu" :close-on-content-click="false">
                    <template #activator="{ props }">
                      <v-text-field v-model="startDateFormatted" label="Start Date" variant="outlined"
                        prepend-inner-icon="mdi-calendar" readonly hide-details v-bind="props" class="fill-height" />
                    </template>
                    <v-date-picker v-model="startDate" @update:modelValue="startMenu = false" />
                  </v-menu>
                </v-col>

                <v-col cols="12" md="4">
                  <v-menu v-model="endMenu" :close-on-content-click="false">
                    <template #activator="{ props }">
                      <v-text-field v-model="endDateFormatted" label="End Date" variant="outlined"
                        prepend-inner-icon="mdi-calendar" readonly hide-details v-bind="props" class="fill-height" />
                    </template>
                    <v-date-picker v-model="endDate" :min="startDate" @update:modelValue="endMenu = false" />
                  </v-menu>
                </v-col>

                <v-col cols="12" md="4">
                  <v-btn size="large" block class="rounded-lg text-white fill-height"
                    style="background: linear-gradient(135deg, #5b2fb5, #7b4de8)" @click="applyPurchaseFilter">
                    Apply Filter
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>

            <v-row>
              <v-col v-for="p in vendorStore.purchases" :key="p.id" cols="12">
                <v-card class="pa-5 rounded-xl mb-4" elevation="1">
                  <div class="d-flex justify-space-between align-start mb-4">
                    <div class="text-caption text-medium-emphasis">
                      {{ new Date(p.date).toLocaleDateString() }}
                      <span v-if="p.note"> &middot; {{ p.note }}</span>
                    </div>
                    <v-chip v-if="p.taxRate" size="small" variant="tonal">
                      {{ p.taxRate.name }} ({{ p.taxRate.rate }}%)
                    </v-chip>
                  </div>

                  <v-row>
                    <v-col cols="12" md="4">
                      <div class="text-caption text-medium-emphasis">Amount</div>
                      <div class="font-weight-medium">{{ $formatPrice(p.amount) }}</div>
                    </v-col>
                    <v-col cols="12" md="4">
                      <div class="text-caption text-medium-emphasis">Tax</div>
                      <div class="font-weight-medium">{{ $formatPrice(p.taxAmount) }}</div>
                    </v-col>
                    <v-col cols="12" md="4">
                      <div class="text-caption text-medium-emphasis">Total</div>
                      <div class="font-weight-bold text-primary">{{ $formatPrice(p.totalAmount) }}</div>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>

              <v-col v-if="!vendorStore.purchases.length" cols="12" class="text-center text-medium-emphasis py-6">
                No purchases recorded yet
              </v-col>
            </v-row>
          </v-card>

        </v-container>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6">
            {{ form.id ? "Edit Vendor" : "Add Vendor" }}
          </span>
          <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" v-model="valid" lazy-validation>
            <v-text-field v-model="form.name" label="Name" :rules="[rules.required]" required />
            <v-text-field v-model="form.email" label="Email" :rules="[rules.email]" />
            <v-text-field v-model="form.phone" label="Phone" />
            <v-textarea v-model="form.address" label="Address" auto-grow rows="2" />
            <v-text-field v-model="form.gstin" label="GSTIN" :rules="[rules.required]" required />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="vendorStore.loading" @click="submitForm">
            {{ form.id ? "Update" : "Create" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ selectedVendor?.name }}</strong>?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteVendor">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useVendorStore } from '@/stores/vendor'

const vendorStore = useVendorStore()

const dialog = ref(false)
const deleteDialog = ref(false)
const selectedVendor = ref(null)
const valid = ref(false)
const formRef = ref(null)
const page = ref(1)

const startMenu = ref(false)
const endMenu = ref(false)

const startDate = ref(null)
const endDate = ref(null)

const formatDate = d =>
  d ? new Date(d).toLocaleDateString('en-GB') : ''

const startDateFormatted = computed({
  get: () => formatDate(startDate.value),
  set: val => (startDate.value = val),
})

const endDateFormatted = computed({
  get: () => formatDate(endDate.value),
  set: val => (endDate.value = val),
})

const applyPurchaseFilter = async () => {
  if (!startDate.value || !endDate.value) return

  await vendorStore.fetchVendorPurchases(
    vendorStore.selectedVendor.id,
    {
      startDate: startDate.value,
      endDate: endDate.value,
    }
  )
}

const form = ref({
  id: null,
  name: '',
  email: '',
  phone: '',
  address: '',
  gstin: '',
})

const rules = {
  required: v => !!v || 'Required',
  email: v => !v || /.+@.+\..+/.test(v) || 'Invalid email',
}

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
  { title: 'GSTIN', key: 'gstin' },
  { title: 'Address', key: 'address' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const fetchData = async () => {
  await vendorStore.fetchVendors(page.value)
}

const openDialog = (item = null) => {
  if (item) form.value = { ...item }
  else
    form.value = {
      id: null,
      name: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
    }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
}

const submitForm = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid.valid) return

  if (form.value.id)
    await vendorStore.updateVendor(form.value.id, form.value)
  else await vendorStore.createVendor(form.value)

  closeDialog()
}

const viewDialog = ref(false)

const viewVendor = async (id) => {
  viewDialog.value = true

  await vendorStore.fetchVendorById(id)
  await vendorStore.fetchVendorPurchases(id, { take: 10 })
}

const confirmDelete = item => {
  selectedVendor.value = item
  deleteDialog.value = true
}

const deleteVendor = async () => {
  if (selectedVendor.value) {
    await vendorStore.deleteVendor(selectedVendor.value.id)
  }
  deleteDialog.value = false
}

watch(page, (newPage) => {
  vendorStore.fetchVendors(newPage, vendorStore.take)
})

watch(
  () => vendorStore.take,
  (newTake) => {
    page.value = 1
    vendorStore.fetchVendors(1, newTake)
  }
)

onMounted(fetchData)
</script>
