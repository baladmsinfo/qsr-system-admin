<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Vendors" subtitle="Manage suppliers & purchase partners" />

    <div class="pa-4">
      <MobileEmptyState v-if="!displayedVendors.length" icon="mdi-truck-outline" title="No vendors yet"
        description="Tap Add Vendor below to create your first record.">
        <template #action>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Add Vendor</v-btn>
        </template>
      </MobileEmptyState>

      <div v-for="v in displayedVendors" :key="v.id" class="app-card pa-4 mb-3">
        <div class="d-flex justify-space-between align-start mb-2">
          <div class="font-weight-bold text-body-1">{{ v.name }}</div>
          <ActionMenu :actions="vendorMenuActions(v)">
            <template #activator="{ props }">
              <v-btn size="small" variant="text" icon="mdi-dots-vertical" v-bind="props" />
            </template>
          </ActionMenu>
        </div>
        <div class="text-body-2 text-medium-emphasis mb-1">{{ v.email || '—' }}</div>
        <div class="text-body-2 text-medium-emphasis mb-3">{{ v.phone || '—' }}</div>
        <v-chip size="small" variant="tonal">GSTIN: {{ v.gstin || 'NA' }}</v-chip>
      </div>

      <div v-if="displayedVendors.length < vendorStore.total" class="d-flex justify-center mt-2 mb-4">
        <v-btn variant="outlined" class="load-more-btn" :loading="vendorStore.loading" @click="page += 1">View More</v-btn>
      </div>
    </div>

    <MobileActionBar v-if="displayedVendors.length">
      <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="openDialog()">
        Add Vendor
      </v-btn>
    </MobileActionBar>

    <!-- VIEW DETAILS -->
    <MobileFullscreenDialog v-model="viewDialog" title="Vendor Details">
      <div v-if="!vendorStore.selectedVendor" class="d-flex align-center justify-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <template v-else>
        <div class="app-card pa-4 mb-4">
          <h2 class="text-subtitle-1 font-weight-bold mb-1">{{ vendorStore.selectedVendor.name }}</h2>
          <div class="text-caption text-medium-emphasis mb-2">
            <v-icon size="14">mdi-phone</v-icon> {{ vendorStore.selectedVendor.phone || '-' }}
            &nbsp;•&nbsp;
            <v-icon size="14">mdi-email</v-icon> {{ vendorStore.selectedVendor.email || '-' }}
          </div>
          <v-chip size="small" color="primary" variant="tonal">GSTIN: {{ vendorStore.selectedVendor.gstin || 'NA' }}</v-chip>
          <div class="text-caption text-medium-emphasis mt-2">
            Vendor since {{ new Date(vendorStore.selectedVendor.createdAt).toLocaleDateString() }}
          </div>
        </div>

        <div class="mobile-stat-grid mb-4">
          <MobileStatCard label="Total Purchases" :value="vendorStore.selectedVendor.purchases?.length || 0" />
          <MobileStatCard label="Total Spent" :value="$formatPrice(vendorStore.selectedVendor.purchases?.reduce((s, p) => s + p.totalAmount, 0) || 0)" />
        </div>

        <div class="app-card pa-4 mb-4">
          <div class="text-subtitle-2 font-weight-bold mb-2">Address</div>
          <div v-if="vendorStore.selectedVendor.address" class="d-flex align-start">
            <v-icon size="18" class="me-2 text-medium-emphasis">mdi-map-marker</v-icon>
            <div class="text-body-2">{{ vendorStore.selectedVendor.address }}</div>
          </div>
          <div v-else class="text-body-2 text-medium-emphasis">No address provided</div>
        </div>

        <div class="mobile-section-title mb-3">Purchase History</div>

        <MobileBottomSheet v-model="dateFilterOpen" title="Filter by Date">
          <v-menu v-model="startMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field v-model="startDateFormatted" label="Start Date" prepend-inner-icon="mdi-calendar"
                readonly hide-details v-bind="props" class="mb-3" />
            </template>
            <v-date-picker v-model="startDate" @update:modelValue="startMenu = false" />
          </v-menu>
          <v-menu v-model="endMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field v-model="endDateFormatted" label="End Date" prepend-inner-icon="mdi-calendar"
                readonly hide-details v-bind="props" class="mb-3" />
            </template>
            <v-date-picker v-model="endDate" :min="startDate" @update:modelValue="endMenu = false" />
          </v-menu>
          <v-btn block size="large" color="primary" class="font-weight-bold" @click="applyPurchaseFilter(); dateFilterOpen = false">
            Apply Filter
          </v-btn>
        </MobileBottomSheet>

        <v-btn variant="tonal" prepend-icon="mdi-calendar-range" class="mb-3" @click="dateFilterOpen = true">
          Filter by Date
        </v-btn>

        <MobileEmptyState v-if="!vendorStore.purchases.length" icon="mdi-cart-arrow-down" title="No purchases recorded yet" />

        <MobileOrderCard v-for="p in vendorStore.purchases" :key="p.id"
          :title="new Date(p.date).toLocaleDateString()" :subtitle="p.note" class="mb-3">
          <template #status>
            <v-chip v-if="p.taxRate" size="small" variant="tonal">{{ p.taxRate.name }} ({{ p.taxRate.rate }}%)</v-chip>
          </template>
          <div class="d-flex justify-space-between mb-1"><span>Amount</span><span class="font-weight-medium">{{ $formatPrice(p.amount) }}</span></div>
          <div class="d-flex justify-space-between mb-1"><span>Tax</span><span class="font-weight-medium">{{ $formatPrice(p.taxAmount) }}</span></div>
          <div class="d-flex justify-space-between"><span>Total</span><span class="font-weight-bold text-primary">{{ $formatPrice(p.totalAmount) }}</span></div>
        </MobileOrderCard>
      </template>
    </MobileFullscreenDialog>

    <!-- ADD/EDIT -->
    <MobileBottomSheet v-model="dialog" :title="form.id ? 'Edit Vendor' : 'Add Vendor'">
      <v-form ref="formRef" v-model="valid" lazy-validation>
        <v-text-field v-model="form.name" label="Name" :rules="[rules.required]" required class="mb-2" />
        <v-text-field v-model="form.email" label="Email" :rules="[rules.email]" class="mb-2" />
        <v-text-field v-model="form.phone" label="Phone" class="mb-2" />
        <v-textarea v-model="form.address" label="Address" auto-grow rows="2" class="mb-2" />
        <v-text-field v-model="form.gstin" label="GSTIN" :rules="[rules.required]" required class="mb-3" />
      </v-form>
      <v-btn block size="large" color="primary" class="font-weight-bold" :loading="vendorStore.loading" @click="submitForm">
        {{ form.id ? "Update" : "Create" }}
      </v-btn>
    </MobileBottomSheet>

    <!-- DELETE CONFIRM -->
    <MobileBottomSheet v-model="deleteDialog" title="Confirm Delete">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Are you sure you want to delete <strong>{{ selectedVendor?.name }}</strong>?
      </p>
      <v-btn block size="large" color="error" class="font-weight-bold" @click="deleteVendor">Delete</v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useVendorStore } from '@/stores/vendor'
import ActionMenu from '@/components/ActionMenu.vue'

const vendorStore = useVendorStore()

const dialog = ref(false)
const deleteDialog = ref(false)
const selectedVendor = ref(null)
const valid = ref(false)
const formRef = ref(null)
const page = ref(1)
const dateFilterOpen = ref(false)

const startMenu = ref(false)
const endMenu = ref(false)

const startDate = ref(null)
const endDate = ref(null)

const formatDate = d => d ? new Date(d).toLocaleDateString('en-GB') : ''

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
  await vendorStore.fetchVendorPurchases(vendorStore.selectedVendor.id, { startDate: startDate.value, endDate: endDate.value })
}

const form = ref({ id: null, name: '', email: '', phone: '', address: '', gstin: '' })

const rules = {
  required: v => !!v || 'Required',
  email: v => !v || /.+@.+\..+/.test(v) || 'Invalid email',
}

const displayedVendors = ref([])
watch(() => vendorStore.vendors, (list) => {
  displayedVendors.value = page.value === 1 ? list : [...displayedVendors.value, ...list]
})

const fetchData = async () => {
  await vendorStore.fetchVendors(page.value)
}

const openDialog = (item = null) => {
  if (item) form.value = { ...item }
  else form.value = { id: null, name: '', email: '', phone: '', address: '', gstin: '' }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
}

const submitForm = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid.valid) return

  if (form.value.id) await vendorStore.updateVendor(form.value.id, form.value)
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

function vendorMenuActions(v) {
  return [
    { icon: 'mdi-eye', color: '#2563EB', label: 'View Details', onClick: () => viewVendor(v.id) },
    { icon: 'mdi-pencil', color: '#7C3AED', label: 'Edit', onClick: () => openDialog(v) },
    { icon: 'mdi-delete', color: '#DC2626', label: 'Delete', onClick: () => confirmDelete(v), dividerBefore: true, danger: true },
  ]
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

<style scoped>
.mobile-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.mobile-stat-grid > * {
  min-width: 0;
}
.mobile-section-title {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
}
</style>
