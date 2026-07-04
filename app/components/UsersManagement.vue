<template>
  <div class="pa-4">

    <!-- HEADER -->
    <div class="app-header-bar d-flex align-center justify-space-between mb-6 px-5 py-4">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Staff &amp; Users</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Manage branch staff accounts and roles</p>
      </div>
    </div>

    <!-- SEARCH -->
    <v-text-field
      v-model="search"
      label="Search branches..."
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mb-6"
      density="comfortable"
    />

    <!-- BRANCH CARDS -->
    <div v-for="item in branches" :key="item.id" class="app-card mb-4">
      <div class="pa-5 d-flex flex-wrap justify-space-between align-center ga-3">
        <div>
          <div class="font-weight-bold text-subtitle-1">{{ item.name }}</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ item.addressLine1 }}<span v-if="item.addressLine2">, {{ item.addressLine2 }}</span>,
            {{ item.city }}, {{ item.state }} - {{ item.pincode }}
          </div>
        </div>
        <div class="d-flex align-center ga-1">
          <v-btn size="small" variant="tonal" :prepend-icon="expanded[item.id] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="toggleExpand(item.id)">
            {{ item.users.length }} Staff
          </v-btn>
          <v-btn size="small" variant="text" icon="mdi-account-plus" color="primary" @click="openCreateUserDialog(item.id)" />
          <v-btn size="small" variant="text" icon="mdi-delete" color="error" @click="openDeleteDialog(item)" />
        </div>
      </div>

      <v-expand-transition>
        <div v-if="expanded[item.id]" class="px-5 pb-5">
          <v-divider class="mb-4" />
          <div class="text-subtitle-2 mb-3 font-weight-bold">Branch Staff</div>

          <div v-if="!item.users.length" class="text-center text-medium-emphasis py-4">No users found</div>

          <v-row v-else dense>
            <v-col v-for="u in item.users" :key="u.id" cols="12" md="6">
              <div class="d-flex justify-space-between align-center pa-3" style="background: #FBFAFD; border: 1px solid #EAE6F2; border-radius: 12px">
                <div>
                  <div class="font-weight-medium">{{ u.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ u.email }}</div>
                  <div class="mt-1 d-flex align-center ga-2">
                    <v-chip size="x-small" variant="tonal">{{ u.role }}</v-chip>
                    <span class="text-caption text-medium-emphasis">{{ new Date(u.createdAt).toLocaleDateString() }}</span>
                  </div>
                </div>
                <v-btn icon="mdi-delete" color="error" variant="text" size="small" @click="deleteUser(item.id, u.id)" />
              </div>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </div>

    <div v-if="!branches.length" class="app-card pa-10 text-center text-medium-emphasis">No branches found</div>

    <div v-if="branches.length < meta.total" class="d-flex justify-center mt-6">
      <v-btn variant="outlined" class="load-more-btn" :loading="loading" @click="loadMore">View More</v-btn>
    </div>

    <!-- ADD USER DIALOG -->
    <v-dialog v-model="createDialog" max-width="400">
      <v-card class="rounded-xl">

        <v-card-title class="py-4 px-6">
          <span class="text-h6 font-weight-bold">Add Staff User</span>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-text-field label="Name" v-model="newUser.name" />
          <v-text-field label="Email" v-model="newUser.email" type="email" />
          <v-select label="Role" v-model="newUser.role" :items="staffRoles" />
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="createUser">Create</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- DELETE CONFIRMATION -->
    <v-dialog v-model="deleteDialog" max-width="420px">
      <v-card class="rounded-xl">

        <v-card-text class="text-center py-6">
          <v-icon color="error" size="50" class="mb-4">mdi-alert-circle</v-icon>

          <div class="text-h6 font-weight-bold mb-2">Delete Branch?</div>
          <div class="text-body-2 mb-4 text-medium-emphasis">
            This action cannot be undone.
          </div>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-row class="w-100" dense>
            <v-col cols="6">
              <v-btn block variant="tonal" @click="deleteDialog = false">
                Cancel
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn block color="error" @click="deleteBranchConfirm">
                Delete
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>

      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useCompanyStore } from "@/stores/company";

const store = useCompanyStore();

/* STATE */
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

/* FETCH */
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

/* USER CREATION */
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

/* DELETE BRANCH USER */
const deleteUser = async (branchId, userId) => {
  if (confirm("Are you sure you want to delete this user?")) {
    await store.deleteBranchUser(branchId, userId);
    resetAndFetch();
  }
};

/* DELETE BRANCH */
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