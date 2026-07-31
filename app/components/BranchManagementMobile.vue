<template>
  <div class="mobile-shell-page">
    <div class="mobile-sticky-stack">
      <MobilePageHeader title="Branch Management" subtitle="All branches under your business" :sticky="false" />
      <MobileSearchBar v-model="search" placeholder="Search branches..." :sticky="false" />
    </div>

    <div class="pa-4">
      <MobileEmptyState v-if="!displayedBranches.length" icon="mdi-source-branch" title="No branches found"
        description="Tap Add Branch below to create your first branch.">
        <template #action>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">Add Branch</v-btn>
        </template>
      </MobileEmptyState>

      <div v-for="item in displayedBranches" :key="item.id" class="app-card pa-4 mb-3">
        <div class="d-flex justify-space-between align-start mb-2">
          <div class="font-weight-bold text-body-1">{{ item.name }}</div>
          <div class="flex-shrink-0">
            <v-btn size="small" variant="text" icon="mdi-pencil" color="primary" @click="openEditDialog(item)" />
            <v-btn size="small" variant="text" icon="mdi-delete" color="error" @click="openDeleteDialog(item)" />
          </div>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ item.addressLine1 }}<span v-if="item.addressLine2">, {{ item.addressLine2 }}</span><br />
          {{ item.city }}, {{ item.state }} - {{ item.pincode }}
        </div>
      </div>

      <div v-if="displayedBranches.length < meta.total" class="d-flex justify-center mt-2 mb-4">
        <v-btn variant="outlined" class="load-more-btn" :loading="loading" @click="loadMore">View More</v-btn>
      </div>
    </div>

    <MobileActionBar v-if="displayedBranches.length">
      <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="openAddDialog">
        Add Branch
      </v-btn>
    </MobileActionBar>

    <!-- ADD/EDIT -->
    <MobileFullscreenDialog v-model="dialog" :title="isEdit ? 'Edit Branch' : 'Add Branch'">
      <v-form ref="formRef" v-model="valid">
        <template v-if="!isEdit">
          <div class="text-subtitle-2 font-weight-bold mb-2">Branch Admin Details</div>
          <v-text-field v-model="form.user.name" label="Branch Admin Name" :rules="[rules.required, rules.name]" class="mb-2" />
          <v-text-field v-model="form.user.email" label="Branch Email" :rules="[rules.required, rules.email]" class="mb-3" />
        </template>

        <div class="text-subtitle-2 font-weight-bold mb-2">Branch Details</div>
        <v-text-field v-model="form.name" label="Branch Name" :rules="[rules.required]" class="mb-2" />
        <v-text-field v-model="form.addressLine1" label="Address Line 1" :rules="[rules.required]" class="mb-2" />
        <v-text-field v-model="form.addressLine2" label="Address Line 2" class="mb-2" />
        <v-text-field v-model="form.addressLine3" label="Address Line 3" class="mb-2" />
        <v-text-field v-model="form.city" label="City" :rules="[rules.required]" class="mb-2" />
        <v-text-field v-model="form.state" label="State" :rules="[rules.required]" class="mb-2" />
        <v-text-field v-model="form.pincode" label="Pincode" :rules="[rules.required, rules.pincode]" class="mb-3" />

        <div class="text-subtitle-2 font-weight-bold mb-2">Business Operations</div>
        <v-text-field v-model="form.gstNumber" label="GST Number" class="mb-2" />
        <v-text-field v-model="form.phone" label="Phone" class="mb-2" />
        <v-text-field v-model="form.openingTime" label="Opening Time" placeholder="07:00" class="mb-2" />
        <v-text-field v-model="form.closingTime" label="Closing Time" placeholder="22:00" class="mb-2" />
        <v-text-field v-model.number="form.deliveryRadiusKm" label="Delivery Radius (km)" type="number" class="mb-2" />

        <template v-if="isEdit">
          <v-switch v-model="form.isOnline" label="Online" color="success" density="compact" hide-details />
          <v-switch v-model="form.acceptOrders" label="Accepting Orders" color="success" density="compact" hide-details />
          <v-switch v-model="form.kitchenEnabled" label="Kitchen Enabled" color="primary" density="compact" hide-details />
          <v-switch v-model="form.posEnabled" label="POS Enabled" color="primary" density="compact" hide-details />
        </template>
      </v-form>

      <template #footer>
        <v-btn block size="large" color="primary" class="font-weight-bold" @click="saveBranch">
          {{ isEdit ? "Update Branch" : "Create Branch" }}
        </v-btn>
      </template>
    </MobileFullscreenDialog>

    <!-- DELETE CONFIRM -->
    <MobileBottomSheet v-model="deleteDialog" title="Delete Branch?">
      <p class="text-body-2 text-medium-emphasis mb-4">This action cannot be undone. Are you sure you want to delete this branch?</p>
      <v-btn block size="large" color="error" class="font-weight-bold" @click="deleteBranchConfirm">Delete</v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useCompanyStore } from "@/stores/company";

const store = useCompanyStore();

const search = ref("");
const page = ref(1);
const limit = ref(10);

const displayedBranches = ref([]);
const meta = computed(() => store.meta);
const loading = computed(() => store.loading);

async function fetch() {
  await store.fetchBranches(page.value, limit.value, search.value);
  displayedBranches.value = page.value === 1 ? store.branches : [...displayedBranches.value, ...store.branches];
}

function resetAndFetch() {
  page.value = 1;
  fetch();
}

function loadMore() {
  page.value += 1;
  fetch();
}

watch(search, resetAndFetch);

const rules = {
  required: v => !!v || "This field is required",
  name: v => /^[a-zA-Z\s]{3,50}$/.test(v) || "Enter a valid name (letters only)",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address",
  pincode: v => /^[1-9][0-9]{5}$/.test(v) || "Enter valid 6-digit pincode"
};

const dialog = ref(false);
const deleteDialog = ref(false);
const isEdit = ref(false);
const valid = ref(false);
const formRef = ref(null);

const form = reactive({
  id: null, name: "", addressLine1: "", addressLine2: "", addressLine3: "",
  city: "", state: "", pincode: "", gstNumber: "", phone: "",
  openingTime: "", closingTime: "", deliveryRadiusKm: null,
  isOnline: true, acceptOrders: true, kitchenEnabled: true, posEnabled: true,
  user: { name: "", email: "" }
});

function openAddDialog() {
  isEdit.value = false;
  resetForm();
  dialog.value = true;
}

function openEditDialog(branch) {
  isEdit.value = true;
  Object.assign(form, branch);
  dialog.value = true;
}

function resetForm() {
  Object.assign(form, {
    id: null, name: "", addressLine1: "", addressLine2: "", addressLine3: "",
    city: "", state: "", pincode: "", gstNumber: "", phone: "",
    openingTime: "", closingTime: "", deliveryRadiusKm: null,
    isOnline: true, acceptOrders: true, kitchenEnabled: true, posEnabled: true,
    user: { name: "", email: "" }
  });
}

async function saveBranch() {
  const isValid = await formRef.value.validate();
  if (!isValid.valid) return;

  if (isEdit.value) await store.updateBranch(form.id, form);
  else await store.registerBranch(form);

  dialog.value = false;
  resetAndFetch();
}

const branchToDelete = ref(null);

function openDeleteDialog(branch) {
  branchToDelete.value = branch;
  deleteDialog.value = true;
}

async function deleteBranchConfirm() {
  await store.deleteBranch(branchToDelete.value.id);
  deleteDialog.value = false;
  resetAndFetch();
}

onMounted(() => {
  fetch();
});
</script>
