<template>
  <div class="pa-4">

    <!-- HEADER -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-bold">Staff &amp; Users</h2>
    </div>

    <!-- SEARCH -->
    <v-text-field
      v-model="search"
      label="Search branches..."
      prepend-inner-icon="mdi-magnify"
      clearable
      @input="fetch"
      class="mb-6"
      density="comfortable"
      variant="outlined"
    />

    <!-- MAIN TABLE -->
    <v-data-table-server
      :headers="headers"
      :items="branches"
      :items-length="meta.total"
      :loading="loading"
      :page="page"
      :items-per-page="limit"
      item-value="id"
      @update:page="updatePage"
      @update:items-per-page="updateLimit"
      class="elevation-1 rounded-lg"
      density="comfortable"
      show-expand
    >

      <!-- Address Column -->
      <template #item.address="{ item }">
        <div class="text-body-2">
          {{ item.addressLine1 }},
          <span v-if="item.addressLine2">{{ item.addressLine2 }},</span>
          <span v-if="item.addressLine3">{{ item.addressLine3 }},</span><br>
          {{ item.city }}, {{ item.state }} - {{ item.pincode }}
        </div>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <v-btn
          size="small"
          variant="text"
          icon="mdi-account-plus"
          color="primary"
          @click="openCreateUserDialog(item.id)"
        />

        <v-btn
          size="small"
          variant="text"
          icon="mdi-delete"
          color="error"
          @click="openDeleteDialog(item)"
        />
      </template>

      <!-- EXPANDABLE ROW — USERS TABLE -->
      <template #expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" class="bg-grey-lighten-4 pa-4">

            <div class="text-subtitle-2 mb-3 font-weight-bold">
              Branch Staff
            </div>

            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Name</th>
                  <th class="text-left">Email</th>
                  <th class="text-left">Role</th>
                  <th class="text-left">Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>

                <tr v-if="item.users.length === 0">
                  <td colspan="5" class="text-center text-grey">
                    No users found
                  </td>
                </tr>

                <tr v-for="u in item.users" :key="u.id">
                  <td>{{ u.name }}</td>
                  <td>{{ u.email }}</td>
                  <td><v-chip size="x-small" variant="tonal">{{ u.role }}</v-chip></td>
                  <td>{{ new Date(u.createdAt).toLocaleDateString() }}</td>
                  <td class="pa-3">
                    <v-btn
                      icon="mdi-delete"
                      color="red"
                      size="small"
                      @click="deleteUser(item.id, u.id)"
                    />
                  </td>
                </tr>

              </tbody>
            </v-table>

          </td>
        </tr>
      </template>

    </v-data-table-server>

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
import { ref, onMounted, computed } from "vue";
import { useCompanyStore } from "@/stores/company";

const store = useCompanyStore();

/* TABLE HEADERS */
const headers = [
  { title: "", key: "data-table-expand" },
  { title: "Branch Name", key: "name" },
  { title: "Address", key: "address" },
  { title: "City", key: "city" },
  { title: "State", key: "state" },
  { title: "Actions", key: "actions", sortable: false }
];

/* STATE */
const search = ref("");
const page = ref(1);
const limit = ref(10);

const branches = computed(() => store.branches);
const meta = computed(() => store.meta);
const loading = computed(() => store.loading);

/* FETCH */
function fetch() {
  store.fetchBranchesWithUsers(page.value, limit.value, search.value);
}

function updatePage(p) {
  page.value = p;
  fetch();
}

function updateLimit(l) {
  limit.value = l;
  fetch();
}

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
  fetch();
};

/* DELETE BRANCH USER */
const deleteUser = async (branchId, userId) => {
  if (confirm("Are you sure you want to delete this user?")) {
    await store.deleteBranchUser(branchId, userId);
    fetch();
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
  fetch();
}

onMounted(() => {
  fetch();
});
</script>