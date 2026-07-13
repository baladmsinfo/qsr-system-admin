<template>
    <div class="pa-4">

        <!-- ========================================================= -->
        <!-- HEADER -->
        <!-- ========================================================= -->
        <div class="app-header-bar d-flex flex-wrap justify-space-between align-center mb-6 px-5 py-4 ga-3">
            <div>
                <h1 class="text-h5 font-weight-bold mb-0">Branch Management</h1>
                <p class="text-body-2 text-medium-emphasis mb-0">All branches under your business</p>
            </div>

            <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
                Add Branch
            </v-btn>
        </div>

        <!-- ========================================================= -->
        <!-- SEARCH BAR -->
        <!-- ========================================================= -->
        <v-text-field v-model="search" label="Search branches..." prepend-inner-icon="mdi-magnify" clearable
            class="mb-6" density="comfortable" />

        <!-- ========================================================= -->
        <!-- BRANCH CARDS -->
        <!-- ========================================================= -->
        <v-row>
            <v-col v-for="item in displayedBranches" :key="item.id" cols="12" sm="6" lg="4">
                <div class="app-card pa-5 h-100 d-flex flex-column">
                    <div class="d-flex justify-space-between align-start mb-2">
                        <div class="font-weight-bold text-subtitle-1">{{ item.name }}</div>
                        <div>
                            <v-btn size="small" variant="text" icon="mdi-pencil" color="primary" @click="openEditDialog(item)" />
                            <v-btn size="small" variant="text" icon="mdi-delete" color="error" @click="openDeleteDialog(item)" />
                        </div>
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                        {{ item.addressLine1 }}<span v-if="item.addressLine2">, {{ item.addressLine2 }}</span><br>
                        {{ item.city }}, {{ item.state }} - {{ item.pincode }}
                    </div>
                </div>
            </v-col>

            <v-col v-if="!displayedBranches.length" cols="12">
                <div class="app-card pa-10 text-center text-medium-emphasis">No branches found</div>
            </v-col>
        </v-row>

        <div v-if="displayedBranches.length < meta.total" class="d-flex justify-center mt-6">
            <v-btn variant="outlined" class="load-more-btn" :loading="loading" @click="loadMore">View More</v-btn>
        </div>

        <!-- ========================================================= -->
        <!-- MODERN ADD / EDIT DIALOG -->
        <!-- ========================================================= -->
        <v-dialog v-model="dialog" max-width="600px" transition="dialog-bottom-transition">
            <v-card class="rounded-xl elevation-3">

                <!-- Header -->
                <v-card-title class="py-4 px-6 d-flex align-center">
                    <v-icon size="28" color="primary" class="mr-3">
                        {{ isEdit ? "mdi-pencil" : "mdi-source-branch-plus" }}
                    </v-icon>

                    <span class="text-h6 font-weight-bold">
                        {{ isEdit ? "Edit Branch" : "Add Branch" }}
                    </span>
                </v-card-title>

                <v-divider />

                <v-card-text class="pa-6">
                    <v-form ref="formRef" v-model="valid" class="d-flex flex-column gap-4">

                        <!-- Branch Admin Section -->
                        <div v-if="!isEdit" class="mt-2">
                            <h4 class="text-subtitle-1 font-weight-bold mb-3">
                                Branch Admin Details
                            </h4>

                            <v-text-field v-model="form.user.name" label="Branch Admin Name" variant="outlined"
                                density="comfortable" :rules="[rules.required, rules.name]" />

                            <v-text-field v-model="form.user.email" label="Branch Email" variant="outlined"
                                density="comfortable" :rules="[rules.required, rules.email]" />
<!-- 
                            <v-text-field type="password" v-model="form.user.password" label="Branch Password"
                                variant="outlined" density="comfortable" :rules="[rules.required, rules.password]" /> -->
                        </div>

                        <!-- Branch Section -->
                        <div class="mt-2">
                            <h4 class="text-subtitle-1 font-weight-bold mb-3">
                                Branch Details
                            </h4>

                            <v-text-field v-model="form.name" label="Branch Name" variant="outlined"
                                density="comfortable" :rules="[rules.required]" />

                            <v-text-field v-model="form.addressLine1" label="Address Line 1" variant="outlined"
                                density="comfortable" :rules="[rules.required]" />

                            <v-text-field v-model="form.addressLine2" label="Address Line 2" variant="outlined"
                                density="comfortable" />

                            <v-text-field v-model="form.addressLine3" label="Address Line 3" variant="outlined"
                                density="comfortable" />

                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="form.city" label="City" variant="outlined"
                                        density="comfortable" :rules="[rules.required]" />
                                </v-col>

                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="form.state" label="State" variant="outlined"
                                        density="comfortable" :rules="[rules.required]" />
                                </v-col>
                            </v-row>

                            <v-text-field v-model="form.pincode" label="Pincode" variant="outlined"
                                density="comfortable" :rules="[rules.required, rules.pincode]" />

                        </div>

                        <!-- Business Operations Section -->
                        <div class="mt-2">
                            <h4 class="text-subtitle-1 font-weight-bold mb-3">
                                Business Operations
                            </h4>

                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="form.gstNumber" label="GST Number" variant="outlined"
                                        density="comfortable" />
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="form.phone" label="Phone" variant="outlined"
                                        density="comfortable" />
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="form.openingTime" label="Opening Time" placeholder="07:00"
                                        variant="outlined" density="comfortable" />
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="form.closingTime" label="Closing Time" placeholder="22:00"
                                        variant="outlined" density="comfortable" />
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model.number="form.deliveryRadiusKm" label="Delivery Radius (km)"
                                        type="number" variant="outlined" density="comfortable" />
                                </v-col>
                            </v-row>

                            <div v-if="isEdit" class="d-flex flex-wrap ga-4 mt-2">
                                <v-switch v-model="form.isOnline" label="Online" color="success" density="compact"
                                    hide-details />
                                <v-switch v-model="form.acceptOrders" label="Accepting Orders" color="success"
                                    density="compact" hide-details />
                                <v-switch v-model="form.kitchenEnabled" label="Kitchen Enabled" color="primary"
                                    density="compact" hide-details />
                                <v-switch v-model="form.posEnabled" label="POS Enabled" color="primary"
                                    density="compact" hide-details />
                            </div>
                        </div>
                    </v-form>
                </v-card-text>

                <!-- Footer -->
                <v-divider />

                <v-card-actions class="px-6 py-4 d-flex justify-end gap-3">
                    <v-btn variant="text" class="text-medium-emphasis" @click="closeDialog">
                        Cancel
                    </v-btn>

                    <v-btn color="primary" class="rounded-lg" @click="saveBranch">
                        {{ isEdit ? "Update Branch" : "Create Branch" }}
                    </v-btn>
                </v-card-actions>

            </v-card>
        </v-dialog>

        <!-- ========================================================= -->
        <!-- FIXED + MODERN DELETE CONFIRMATION -->
        <!-- ========================================================= -->
        <v-dialog v-model="deleteDialog" max-width="420px" transition="dialog-bottom-transition">
            <v-card class="rounded-xl">

                <!-- Content -->
                <v-card-text class="pt-6 pb-2 px-6 text-center">

                    <v-icon color="error" size="50" class="mb-4">
                        mdi-alert-circle
                    </v-icon>

                    <div class="text-h6 font-weight-bold mb-2">
                        Delete Branch?
                    </div>

                    <div class="text-body-2 text-medium-emphasis mb-6">
                        This action cannot be undone. Are you sure you want to delete this branch?
                    </div>

                </v-card-text>

                <!-- Buttons -->
                <v-card-actions class="px-6 pb-4">
                    <v-row class="w-100" dense>
                        <v-col cols="6">
                            <v-btn block variant="tonal" @click="deleteDialog = false" class="rounded-lg">
                                Cancel
                            </v-btn>
                        </v-col>

                        <v-col cols="6">
                            <v-btn block color="error" class="rounded-lg" @click="deleteBranchConfirm">
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

// 🔒 Validation Rules
const rules = {
    required: v => !!v || "This field is required",

    name: v =>
        /^[a-zA-Z\s]{3,50}$/.test(v) || "Enter a valid name (letters only)",

    email: v =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address",

    pincode: v =>
        /^[1-9][0-9]{5}$/.test(v) || "Enter valid 6-digit pincode"
};

/* ========================================================= */
/* ADD / EDIT */
/* ========================================================= */
const dialog = ref(false);
const deleteDialog = ref(false);
const isEdit = ref(false);
const valid = ref(false);
const formRef = ref(null);

const form = reactive({
    id: null,
    name: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    phone: "",
    openingTime: "",
    closingTime: "",
    deliveryRadiusKm: null,
    isOnline: true,
    acceptOrders: true,
    kitchenEnabled: true,
    posEnabled: true,
    user: {
        name: "",
        email: "",
    }
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

function closeDialog() {
    dialog.value = false;
}

function resetForm() {
    Object.assign(form, {
        id: null,
        name: "",
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        city: "",
        state: "",
        pincode: "",
        gstNumber: "",
        phone: "",
        openingTime: "",
        closingTime: "",
        deliveryRadiusKm: null,
        isOnline: true,
        acceptOrders: true,
        kitchenEnabled: true,
        posEnabled: true,
        user: { name: "", email: "" }
    });
}

async function saveBranch() {
    const isValid = await formRef.value.validate();
    if (!isValid.valid) return;

    if (isEdit.value) {
        await store.updateBranch(form.id, form);
    } else {
        await store.registerBranch(form);
    }

    dialog.value = false;
    resetAndFetch();
}

/* ========================================================= */
/* DELETE */
/* ========================================================= */
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