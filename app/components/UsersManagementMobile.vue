<template>
  <div class="mobile-shell-page">
    <div class="mobile-sticky-stack">
      <MobilePageHeader title="Staff & Users" subtitle="Manage branch staff accounts and roles" :sticky="false" />
      <MobileSearchBar v-model="search" placeholder="Search branches..." :sticky="false" />
    </div>

    <div class="pa-4">
      <MobileEmptyState v-if="!branches.length" icon="mdi-account-multiple-outline" title="No branches found" />

      <div v-for="item in branches" :key="item.id" class="app-card mb-3">
        <div class="pa-4">
          <div class="font-weight-bold text-body-1 mb-1">{{ item.name }}</div>
          <div class="text-caption text-medium-emphasis mb-3">
            {{ item.addressLine1 }}<span v-if="item.addressLine2">, {{ item.addressLine2 }}</span>,
            {{ item.city }}, {{ item.state }} - {{ item.pincode }}
          </div>
          <div class="d-flex align-center ga-2">
            <v-btn size="small" variant="tonal" :prepend-icon="expanded[item.id] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              class="flex-grow-1" @click="toggleExpand(item.id)">
              {{ item.users.length }} Staff
            </v-btn>
            <v-btn size="small" variant="text" icon="mdi-account-plus" color="primary" @click="openCreateUserDialog(item.id)" />
            <v-btn size="small" variant="text" icon="mdi-delete" color="error" @click="openDeleteDialog(item)" />
          </div>
        </div>

        <v-expand-transition>
          <div v-if="expanded[item.id]" class="px-4 pb-4">
            <v-divider class="mb-3" />
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2">Branch Staff</div>

            <div v-if="!item.users.length" class="text-center text-medium-emphasis py-4 text-body-2">No users found</div>

            <div v-for="u in item.users" :key="u.id" class="d-flex justify-space-between align-center pa-3 mb-2 staff-row">
              <div style="min-width: 0">
                <div class="font-weight-medium text-body-2 text-truncate">{{ u.name }}</div>
                <div class="text-caption text-medium-emphasis text-truncate">{{ u.email }}</div>
                <div class="mt-1 d-flex align-center ga-2">
                  <v-chip size="x-small" variant="tonal">{{ u.role }}</v-chip>
                  <span class="text-caption text-medium-emphasis">{{ new Date(u.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
              <v-btn icon="mdi-delete" color="error" variant="text" size="small" class="flex-shrink-0" @click="deleteUser(item.id, u.id)" />
            </div>
          </div>
        </v-expand-transition>
      </div>

      <div v-if="branches.length < meta.total" class="d-flex justify-center mt-2 mb-4">
        <v-btn variant="outlined" class="load-more-btn" :loading="loading" @click="loadMore">View More</v-btn>
      </div>
    </div>

    <!-- ADD USER -->
    <MobileBottomSheet v-model="createDialog" title="Add Staff User">
      <v-text-field label="Name" v-model="newUser.name" class="mb-2" />
      <v-text-field label="Email" v-model="newUser.email" type="email" class="mb-2" />
      <v-select label="Role" v-model="newUser.role" :items="staffRoles" class="mb-3" />
      <v-btn block size="large" color="primary" class="font-weight-bold" @click="createUser">Create</v-btn>
    </MobileBottomSheet>

    <!-- DELETE BRANCH -->
    <MobileBottomSheet v-model="deleteDialog" title="Delete Branch?">
      <p class="text-body-2 text-medium-emphasis mb-4">This action cannot be undone.</p>
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
const branches = computed(() => displayedBranches.value);
const meta = computed(() => store.meta);
const loading = computed(() => store.loading);

const expanded = reactive({});
function toggleExpand(id) {
  expanded[id] = !expanded[id];
}

async function fetch() {
  await store.fetchBranchesWithUsers(page.value, limit.value, search.value);
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

const createDialog = ref(false);
const selectedBranchId = ref(null);
const staffRoles = ["BRANCHADMIN", "KITCHEN", "CASHIER", "WAITER", "ACCOUNTANT"];
const newUser = ref({ name: "", email: "", role: "WAITER" });

const openCreateUserDialog = (branchId) => {
  selectedBranchId.value = branchId;
  newUser.value = { name: "", email: "", role: "WAITER" };
  createDialog.value = true;
};

const createUser = async () => {
  await store.createBranchUser(selectedBranchId.value, newUser.value);
  createDialog.value = false;
  resetAndFetch();
};

const deleteUser = async (branchId, userId) => {
  if (confirm("Are you sure you want to delete this user?")) {
    await store.deleteBranchUser(branchId, userId);
    resetAndFetch();
  }
};

const deleteDialog = ref(false);
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

<style scoped>
.staff-row {
  background: #FBFAFD;
  border: 1px solid #EEE9F7;
  border-radius: 12px;
}
</style>
