<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Expenses" subtitle="Track & manage all expense transactions">
      <v-btn icon="mdi-tune-variant" variant="tonal" color="primary" density="comfortable" @click="filtersOpen = true" />
    </MobilePageHeader>

    <div class="pa-4">
      <MobileEmptyState v-if="!displayedExpenses.length" icon="mdi-receipt-text-outline" title="No expenses recorded yet"
        description="Tap Add Expense below to log your first expense.">
        <template #action>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Add Expense</v-btn>
        </template>
      </MobileEmptyState>

      <MobileOrderCard v-for="item in displayedExpenses" :key="item.id" :title="item.category"
        :subtitle="formatDate(item.date)" class="mb-3">
        <template #status>
          <v-btn v-if="item.images?.length" icon="mdi-image-outline" variant="tonal" size="small"
            @click="openImage(item.images)" />
        </template>
        <span v-if="item.description">{{ item.description }}</span>
        <div class="text-subtitle-1 font-weight-bold mono-data mt-2">{{ $formatPrice(item.amount) }}</div>
      </MobileOrderCard>

      <div v-if="displayedExpenses.length < expenseStore.pagination.total" class="d-flex justify-center mt-2 mb-4">
        <v-btn variant="outlined" class="load-more-btn" :loading="expenseStore.loading" @click="loadMoreExpenses">View More</v-btn>
      </div>
    </div>

    <MobileActionBar v-if="displayedExpenses.length">
      <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="openDialog()">
        Add Expense
      </v-btn>
    </MobileActionBar>

    <!-- FILTERS -->
    <MobileBottomSheet v-model="filtersOpen" title="Filters">
      <v-select v-model="filters.category" :items="categoryOptions" item-title="name" item-value="name"
        label="Category" clearable class="mb-2" />
      <v-text-field v-model="filters.fromDate" label="From Date" type="date" class="mb-2" />
      <v-text-field v-model="filters.toDate" label="To Date" type="date" class="mb-3" />
      <div class="d-flex ga-2">
        <v-btn color="primary" class="flex-grow-1" @click="applyFilters(); filtersOpen = false">Apply</v-btn>
        <v-btn color="grey-darken-1" variant="tonal" class="flex-grow-1" @click="clearFilters()">Clear</v-btn>
      </div>
    </MobileBottomSheet>

    <!-- IMAGE PREVIEW -->
    <MobileBottomSheet v-model="imageDialog" title="Expense Proof" max-height="80vh">
      <v-chip v-if="selectedImages.length" size="small" class="mb-3" color="primary" variant="tonal">
        {{ selectedImages.length }} image{{ selectedImages.length > 1 ? 's' : '' }}
      </v-chip>
      <div v-for="(img, index) in selectedImages" :key="img.id" class="mb-3">
        <v-img :src="img.url" aspect-ratio="1.6" class="rounded-lg" cover />
        <div class="text-caption text-medium-emphasis mt-1 text-center">Image {{ index + 1 }}</div>
      </div>
    </MobileBottomSheet>

    <!-- ADD EXPENSE -->
    <MobileFullscreenDialog v-model="dialog" title="New Expense">
      <v-form ref="formRef" v-model="valid">
        <v-card class="upload-card d-flex mb-4 flex-column align-center justify-center text-center pa-4" height="150" elevation="0">
          <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="onFileChange" />
          <v-icon icon="mdi-receipt-text-outline" size="30" color="primary" class="mb-2" />
          <div class="text-body-2 font-weight-medium mb-1">Add Expense Proof</div>
          <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-upload" @click="fileInput.click()">
            {{ form.imageUrl ? "Reupload Image" : "Upload Image" }}
          </v-btn>
        </v-card>

        <v-img v-if="form.imageUrl" :src="form.imageUrl" max-height="140" class="rounded-lg mb-4" cover />

        <v-select v-model="form.category" :items="categoryOptions" item-title="name" item-value="name"
          label="Category" :rules="[rules.required]" class="mb-2" />
        <v-text-field v-model="form.date" type="date" label="Date" :max="today"
          :rules="[rules.required, rules.dateNotFuture]" prepend-inner-icon="mdi-calendar" class="mb-2" />
        <v-text-field v-model="form.amount" label="Amount" type="number" :rules="[rules.required]" class="mb-2" />
        <v-select v-model="form.taxRateId" :items="taxStore.taxes" item-title="name" item-value="id" label="Tax Rate" class="mb-2" />
        <v-textarea v-model="form.description" label="Note" rows="2" class="mt-1" />
      </v-form>

      <template #footer>
        <v-btn block size="large" color="primary" class="font-weight-bold" @click="submitForm">Save Expense</v-btn>
      </template>
    </MobileFullscreenDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
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
const filtersOpen = ref(false);

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
  dateNotFuture: v => v <= today || "Future dates are not allowed"
}

const categoryOptions = ref([]);

const filters = ref({
  category: null,
  fromDate: null,
  toDate: null,
});

const displayedExpenses = ref([]);
watch(() => expenseStore.expenses, (list) => {
  displayedExpenses.value = expenseStore.pagination.page === 1 ? list : [...displayedExpenses.value, ...list];
});

function loadMoreExpenses() {
  expenseStore.setPage(expenseStore.pagination.page + 1);
}

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
  expenseStore.pagination.page = 1;
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
  }
});
</script>

<style scoped>
.upload-card {
  border: 1.5px dashed #D8D2E8;
  border-radius: 12px;
}
</style>
