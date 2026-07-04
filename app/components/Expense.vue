<template>
    <v-container fluid class="pa-6">

        <!-- ░░ HEADER ░░ -->
        <v-sheet class="d-flex align-center justify-space-between bg-surface px-4 py-4 rounded-lg mb-6" elevation="0">
            <div>
                <h2 class="text-h5 font-weight-bold mb-1">Expenses</h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                    Track & manage all expense transactions
                </p>
            </div>

            <v-btn color="primary" class="rounded-lg" prepend-icon="mdi-plus" @click="openDialog()">
                Add Expense
            </v-btn>
        </v-sheet>

        <!-- ░░ FILTERS CARD ░░ -->
        <v-card elevation="2" class="mb-6">
            <v-card-text>

                <v-row align="center" justify="center" class="g-4">

                    <!-- Category -->
                    <v-col cols="12" md="3">
                        <v-select v-model="filters.category" :items="categoryOptions" item-title="name"
                            item-value="name" label="Category" clearable />
                    </v-col>

                    <!-- From Date -->
                    <v-col cols="12" md="3">
                        <v-text-field v-model="filters.fromDate" label="From Date" type="date" density="comfortable" />
                    </v-col>

                    <!-- To Date -->
                    <v-col cols="12" md="3">
                        <v-text-field v-model="filters.toDate" label="To Date" type="date" density="comfortable" />
                    </v-col>

                    <!-- Buttons -->
                    <v-col cols="12" md="3" class="d-flex align-center justify-end">
                        <v-btn color="primary" class="rounded-lg mr-2" @click="applyFilters">
                            Apply
                        </v-btn>

                        <v-btn color="grey-darken-1" variant="tonal" class="rounded-lg" @click="clearFilters">
                            Clear
                        </v-btn>
                    </v-col>

                </v-row>

            </v-card-text>
        </v-card>

        <!-- ░░ EXPENSE TABLE ░░ -->
        <v-card elevation="2">
            <v-data-table-server :headers="headers" :items="expenseStore.expenses" :loading="expenseStore.loading"
                v-model:page="expenseStore.pagination.page" v-model:items-per-page="expenseStore.pagination.take"
                :items-length="expenseStore.pagination.total" :items-per-page-options="[5, 10, 20, 50]"
                @update:page="expenseStore.setPage" @update:items-per-page="expenseStore.setItemsPerPage">

                <template #item.category="{ item }">
                    <span class="font-weight-medium">
                        {{ item.category }}
                    </span>
                </template>

                <template #item.amount="{ item }">
                    {{ $formatPrice(item.amount) }}
                </template>

                <template #item.date="{ item }">
                    {{ formatDate(item.date) }}
                </template>

                <template #item.description="{ item }">
                    {{ item.description?.toLocaleString() }}
                </template>

                <template #item.proof="{ item }">
                    <v-btn v-if="item.images?.length" icon="mdi-image-outline" variant="text"
                        @click="openImage(item.images)" />
                    <span v-else class="text-caption text-medium-emphasis">—</span>
                </template>

            </v-data-table-server>
        </v-card>
        <v-dialog v-model="imageDialog" max-width="520">
            <v-card class="rounded-xl">

                <!-- HEADER -->
                <v-card-title class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                        <span class="text-subtitle-1 font-weight-semibold">
                            Expense Proof
                        </span>
                        <v-chip v-if="selectedImages.length" size="small" class="ml-3" color="primary" variant="tonal">
                            {{ selectedImages.length }} image{{ selectedImages.length > 1 ? 's' : '' }}
                        </v-chip>
                    </div>

                    <!-- CLOSE -->
                    <v-btn icon variant="text" @click="imageDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider />

                <!-- CONTENT -->
                <v-card-text class="pa-4" style="max-height: 60vh; overflow-y: auto">
                    <v-row dense>
                        <v-col v-for="(img, index) in selectedImages" :key="img.id" cols="12">
                            <v-card elevation="0" class="pa-2 rounded-lg bg-surface">
                                <v-img :src="img.url" aspect-ratio="1.6" class="rounded-lg" cover />
                                <div class="text-caption text-medium-emphasis mt-1 text-center">
                                    Image {{ index + 1 }}
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-divider />

                <!-- ACTIONS -->
                <v-card-actions class="justify-end pa-3">
                    <v-btn variant="tonal" color="grey-darken-1" @click="imageDialog = false">
                        Cancel
                    </v-btn>
                </v-card-actions>

            </v-card>
        </v-dialog>

        <!-- ░░ ADD / EDIT DIALOG ░░ -->
        <v-dialog v-model="dialog" width="650" persistent>
            <v-card class="rounded-xl pa-6" elevation="1">

                <!-- Header -->
                <div class="d-flex justify-space-between align-center mb-4">
                    <div>
                        <h2 class="text-h6 font-weight-bold mb-1">New Expense</h2>
                        <p class="text-caption text-medium-emphasis">Add a new expense entry</p>
                    </div>
                    <v-btn icon variant="text" @click="closeDialog">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>

                <v-divider class="mb-6"></v-divider>

                <v-form ref="formRef" v-model="valid">

                    <!-- Row 1 -->
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <v-card
                                class="upload-card d-flex mb-4 flex-column align-center justify-center text-center pa-4"
                                height="160" elevation="0">
                                <input ref="fileInput" type="file" accept="image/*" class="d-none"
                                    @change="onFileChange" />

                                <v-icon icon="mdi-receipt-text-outline" size="36" color="primary" class="mb-2" />

                                <div class="text-body-2 font-weight-medium mb-1">
                                    Add Expense Proof
                                </div>

                                <div class="text-caption text-medium-emphasis mb-3">
                                    Upload bill or receipt image
                                </div>

                                <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-upload"
                                    @click="$refs.fileInput.click()">
                                    {{ form.imageUrl ? "Reupload Image" : "Upload Image" }}
                                </v-btn>
                            </v-card>
                        </v-col>

                        <!-- Preview Column -->
                        <v-col cols="12" md="6">
                            <v-card class="preview-card d-flex align-center justify-center" height="160" elevation="0">
                                <template v-if="form.imageUrl">
                                    <v-img :src="form.imageUrl" max-height="140" max-width="100%" class="rounded-lg"
                                        cover />
                                </template>

                                <template v-else>
                                    <div class="text-caption text-medium-emphasis text-center">
                                        No proof uploaded yet
                                    </div>
                                </template>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select v-model="form.category" :items="categoryOptions" item-title="name"
                                item-value="name" label="Category" density="comfortable" variant="outlined"
                                :rules="[rules.required]" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.date" type="date" label="Date" density="comfortable"
                                variant="outlined" :max="today" :rules="[rules.required, rules.dateNotFuture]"
                                prepend-inner-icon="mdi-calendar" />
                        </v-col>
                    </v-row>

                    <!-- Row 2 -->
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.amount" label="Amount" type="number" density="comfortable"
                                variant="outlined" :rules="[rules.required]" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select v-model="form.taxRateId" :items="taxStore.taxes" item-title="name" item-value="id"
                                label="Tax Rate" density="comfortable" variant="outlined" />
                        </v-col>

                        <v-col cols="12" md="6"></v-col>
                    </v-row>

                    <!-- Description -->
                    <v-textarea v-model="form.description" label="Note" rows="2" density="comfortable"
                        variant="outlined" class="mt-2" />

                </v-form>

                <!-- Actions -->
                <v-divider class="my-4"></v-divider>
                <div class="d-flex justify-end">
                    <v-btn variant="text" class="mr-2" @click="closeDialog">Cancel</v-btn>
                    <v-btn color="primary" class="rounded-lg px-6" @click="submitForm">
                        Save Expense
                    </v-btn>
                </div>

            </v-card>
        </v-dialog>

    </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useExpenseStore } from "@/stores/expense";
import { useTaxStore } from "@/stores/tax";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const Auth = useAuthStore();
const { userInfo } = storeToRefs(Auth);

const { $formatPrice } = useNuxtApp();

const taxStore = useTaxStore();

const expenseStore = useExpenseStore();

const dialog = ref(false);
const valid = ref(false);
const formRef = ref(null);

const imageDialog = ref(false)
const selectedImages = ref([])

const openImage = (images) => {
    selectedImages.value = images
    imageDialog.value = true
}

const today = new Date().toISOString().split("T")[0]
const isAdmin = computed(() => userInfo.value?.role === "SUPERADMIN");

const form = ref({
    category: "",
    date: today,
    amount: "",
    description: "",
    taxRateId: null,
    branchId: null,
    imageId: null,
    imageUrl: null,
});

const rules = {
    required: v => !!v || "Required",
    dateNotFuture: v =>
        v <= today || "Future dates are not allowed"
}

const categoryOptions = ref([]);

const filters = ref({
    category: null,
    fromDate: null,
    toDate: null,
});

const headers = [
    { title: "Category", key: "category" },
    { title: "Expense Date", key: "date" },
    { title: "Amount", key: "amount" },
    { title: "Notes", key: "description" },
    { title: "Proof", key: "proof" }
];

const fileInput = ref(null)

const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
        const res = await expenseStore.uploadImage(formData)

        if (res?.data?.id && res?.data?.url) {
            form.value.imageId = res.data.id
            form.value.imageUrl = res.data.url
        }
    } catch (err) {
        console.error("Image upload failed", err)
    }
}

const formatDate = (d) => new Date(d).toLocaleDateString("en-IN");

const fetchExpenseOptions = async () => {
    await expenseStore.fetchExpenseOptions();
    categoryOptions.value = expenseStore.expenseOptions;
};

const fetchData = async () => {
    await expenseStore.fetchExpenses(filters.value);
};

const applyFilters = () => {
    expenseStore.applyFilters(filters.value)
}

const clearFilters = () => {
    filters.value = { category: null, fromDate: null, toDate: null }
    expenseStore.applyFilters(filters.value)
}

const openDialog = () => {
    form.value = { category: "", date: today, amount: "", description: "", taxRateId: null };
    dialog.value = true;
};

const closeDialog = () => (dialog.value = false);

const submitForm = async () => {
    const isValid = await formRef.value.validate();
    if (!isValid.valid) return;

    const payload = {
        category: form.value.category,
        date: form.value.date,
        amount: Number(form.value.amount),
        description: form.value.description,
        taxRateId: form.value.taxRateId,
        branchId: isAdmin.value ? null : userInfo.value?.branchId || null,
        imageId: form.value.imageId,
        imageUrl: form.value.imageUrl,
    };

    await expenseStore.createExpense(payload);

    dialog.value = false;
    fetchData();
};

onMounted(async () => {
    await fetchExpenseOptions()
    await taxStore.fetchTaxes()
    expenseStore.fetchExpenses()
})

onMounted(async () => {

    if (!Auth.userInfo && !Auth.token) {
        await Auth.fetchMe();
        await Auth.restoreToken();

        console.log("User role if", Auth.role);
    }
});

</script>