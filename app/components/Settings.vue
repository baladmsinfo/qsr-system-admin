<template>
  <v-container fluid class="pa-6">

    <!-- Header -->
    <v-sheet elevation="0" class="d-flex align-center justify-space-between mb-6 px-4 py-3 bg-surface rounded-lg">
      <div>
        <h2 class="text-h5 font-weight-bold mb-0">Branches</h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage and add multiple branches easily
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog">
        Add Branch
      </v-btn>
    </v-sheet>

    <!-- Search -->
    <v-text-field v-model="search" label="Search branch" density="compact" prepend-inner-icon="mdi-magnify" class="mb-4"
      @input="handleSearch" />

    <v-data-table :headers="headers" :items="company.branches" :loading="company.loading" :page="company.meta.page"
      :items-per-page="company.meta.limit" :server-items-length="company.meta.total" @update:page="changePage"
      class="elevation-1 rounded-lg" show-expand>
      <template #item.users="{ item }">
        <v-chip color="primary" variant="tonal">
          {{ item.users?.length ?? 0 }} Users
        </v-chip>
      </template>

      <!-- FULL-WIDTH EXPANDED CONTENT -->
      <template #expanded-row="{ item, columns }">
        <tr>
          <td :colspan="columns.length" class="pa-0">
            <v-sheet class="pa-6 bg-background">

              <!-- Branch Details -->
              <v-row class="mb-1">
                <v-col cols="12">
                  <h4 class="text-h7 font-weight-bold mb-2">Branch Details</h4>
                  <v-card class="pa-4 elevation-0">
                    <p class="text-body-2 mb-1">
                      <strong>Address:</strong>
                      {{ item.addressLine1 }}, {{ item.addressLine2 }}, {{ item.addressLine3 }}
                    </p>
                    <p class="text-body-2 mb-1">
                      <strong>City:</strong> {{ item.city }}
                      <span class="mx-1">|</span>
                      <strong>State:</strong> {{ item.state }}
                      <span class="mx-1">|</span>
                      <strong>Pincode:</strong> {{ item.pincode }}
                    </p>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Users -->
              <v-row>
                <v-col cols="12">
                  <h4 class="text-h7 font-weight-bold mb-3">Users</h4>

                  <v-table density="compact" class="bg-white elevation-1">
                    <thead>
                      <tr>
                        <th class="py-3 px-4">Name</th>
                        <th class="py-3 px-4">Email</th>
                        <th class="py-3 px-4">Role</th>
                        <th class="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="user in item.users" :key="user.id">
                        <td class="py-3 px-4">{{ user.name }}</td>
                        <td class="py-3 px-4">{{ user.email }}</td>
                        <td class="py-3 px-4">{{ user.role }}</td>
                        <td class="py-3 px-4 text-center">
                          <v-btn color="primary" variant="text" size="small" prepend-icon="mdi-lock-reset"
                            @click="resetPassword(user)">
                            Reset Password
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-col>
              </v-row>

            </v-sheet>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- Create Branch Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card rounded="lg">
        <v-card-title class="font-weight-bold text-h6">
          Create Branch
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-text-field v-model="form.branchName" label="Branch Name" /></v-col>
            <v-col cols="12"><v-text-field v-model="form.addressLine1" label="Address Line 1" /></v-col>
            <v-col cols="12"><v-text-field v-model="form.addressLine2" label="Address Line 2" /></v-col>
            <v-col cols="12"><v-text-field v-model="form.addressLine3" label="Address Line 3" /></v-col>
            <v-col cols="6"><v-text-field v-model="form.city" label="City" /></v-col>
            <v-col cols="6"><v-text-field v-model="form.state" label="State" /></v-col>
            <v-col cols="12"><v-text-field v-model="form.pincode" label="Pincode" type="number" /></v-col>
          </v-row>

          <v-divider class="my-4" />

          <p class="font-weight-medium mb-2">Store Admin Details</p>
          <v-row dense>
            <v-col cols="12"><v-text-field v-model="form.name" label="Full Name" /></v-col>
            <v-col cols="12"><v-text-field v-model="form.email" label="Email" type="email" /></v-col>
            <v-col cols="12"><v-text-field v-model="form.password" label="Password" type="password" /></v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="company.loading" @click="submitForm">
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script setup>
import { ref, reactive, onMounted } from "vue";
import { useCompanyStore } from "~/stores/company";

// Store
const company = useCompanyStore();

// Pagination + search
const search = ref("");
let debounceSearchTimeout;

// dialog
const dialog = ref(false);
const openDialog = () => (dialog.value = true);

// Form payload → strictly matches backend expected type
const form = reactive({
  branchName: "",
  addressLine1: "",
  addressLine2: "",
  addressLine3: "",
  city: "",
  state: "",
  pincode: "",
  name: "",
  email: "",
  password: ""
});

const headers = [
  { title: "Branch Name", key: "name" },
  { title: "City", key: "city" },
  { title: "State", key: "state" },
  { title: "Users", key: "users", align: "center" }
];

const resetPassword = async (user) => {
  try {
    const confirm = window.confirm(`Reset password for ${user.email}?`);
    if (!confirm) return;

    await company.resetUserPassword(user.id);
    alert("Password reset link sent to email!");
  } catch (e) {
    console.error(e);
    alert("Failed to reset password");
  }
};

// Fetch branches initially
onMounted(() => company.fetchBranches());

// Page change handler
const changePage = (newPage) => {
  company.fetchBranches(newPage, company.meta.limit, search.value);
};

// Search with debounce
const handleSearch = () => {
  clearTimeout(debounceSearchTimeout);
  debounceSearchTimeout = setTimeout(() => {
    company.fetchBranches(1, company.meta.limit, search.value);
  }, 400);
};

// Submit form
const submitForm = async () => {
  try {
    await company.registerBranch({
      name: form.branchName,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2,
      addressLine3: form.addressLine3,
      city: form.city,
      state: form.state,
      pincode: Number(form.pincode),
      user: {
        name: form.name,
        email: form.email,
        password: form.password
      }
    });

    dialog.value = false;
    resetForm();
  } catch (e) {
    console.error(e);
  }
};

const resetForm = () => {
  Object.keys(form).forEach((k) => (form[k] = ""));
};
</script>