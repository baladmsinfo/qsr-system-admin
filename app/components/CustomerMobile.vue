<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Customers" subtitle="Guests who have dined in or ordered via QR" />

    <div class="pa-4">
      <MobileEmptyState v-if="!displayedCustomers.length" icon="mdi-account-group-outline" title="No customers yet"
        description="Tap Add Customer below to create your first record.">
        <template #action>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Add Customer</v-btn>
        </template>
      </MobileEmptyState>

      <div v-for="c in displayedCustomers" :key="c.id" class="app-card pa-4 mb-3">
        <div class="d-flex justify-space-between align-start mb-2">
          <div class="font-weight-bold text-body-1">{{ c.name }}</div>
          <ActionMenu :actions="customerMenuActions(c)">
            <template #activator="{ props }">
              <v-btn size="small" variant="text" icon="mdi-dots-vertical" v-bind="props" />
            </template>
          </ActionMenu>
        </div>
        <div class="text-body-2 text-medium-emphasis mb-1">{{ c.email || '—' }}</div>
        <div class="text-body-2 text-medium-emphasis">{{ c.phone || '—' }}</div>
      </div>

      <div v-if="displayedCustomers.length < customerStore.total" class="d-flex justify-center mt-2 mb-4">
        <v-btn variant="outlined" class="load-more-btn" :loading="customerStore.loading" @click="page += 1">View More</v-btn>
      </div>
    </div>

    <MobileActionBar v-if="displayedCustomers.length">
      <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="openDialog()">
        Add Customer
      </v-btn>
    </MobileActionBar>

    <!-- ADD/EDIT -->
    <MobileBottomSheet v-model="dialog" :title="form.id ? 'Edit Customer' : 'Add Customer'">
      <v-form ref="formRef" v-model="valid" lazy-validation>
        <v-text-field v-model="form.name" label="Customer Name" :rules="[rules.required]" required class="mb-2" />
        <v-text-field v-model="form.email" label="Email" :rules="[rules.email]" class="mb-2" />
        <v-text-field v-model="form.phone" label="Phone Number" class="mb-3" />
      </v-form>
      <v-btn block size="large" color="primary" class="font-weight-bold" :loading="customerStore.loading" @click="submitForm">
        {{ form.id ? "Update" : "Create" }}
      </v-btn>
    </MobileBottomSheet>

    <!-- VIEW DETAILS -->
    <MobileFullscreenDialog v-model="viewDialog" title="Customer Details">
      <div v-if="!customerStore.selectedCustomer" class="d-flex align-center justify-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <template v-else>
        <div class="app-card pa-4 mb-4">
          <h2 class="text-subtitle-1 font-weight-bold mb-1">{{ customerStore.selectedCustomer.name }}</h2>
          <div class="text-caption text-medium-emphasis mb-2">
            <v-icon size="14">mdi-phone</v-icon> {{ customerStore.selectedCustomer.phone || '-' }}
            &nbsp;&bull;&nbsp;
            <v-icon size="14">mdi-email</v-icon> {{ customerStore.selectedCustomer.email || '-' }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Customer since {{ new Date(customerStore.selectedCustomer.createdAt).toLocaleDateString() }}
          </div>
        </div>

        <div class="mobile-stat-grid mb-4">
          <MobileStatCard label="Total Orders" :value="customerStore.orders.length" />
          <MobileStatCard label="Total Spent" :value="$formatPrice(customerStore.orders.reduce((s, o) => s + o.totalAmount, 0))" />
        </div>

        <div class="mobile-section-title mb-3">Order History</div>

        <MobileEmptyState v-if="!customerStore.orders.length" icon="mdi-receipt-text-outline" title="No orders yet" />

        <MobileOrderCard v-for="order in customerStore.orders" :key="order.id"
          :title="order.table?.tableNo || 'Takeaway'" :subtitle="new Date(order.createdAt).toLocaleString()" class="mb-3">
          <template #status>
            <v-chip size="small" variant="tonal">{{ order.status }}</v-chip>
          </template>
          <div v-for="item in order.orderItems" :key="item.id" class="d-flex justify-space-between">
            <span>{{ item.quantity }} &times; {{ item.menuItem?.name }}</span>
            <span>{{ $formatPrice(item.total) }}</span>
          </div>
          <v-divider class="my-2" />
          <div class="d-flex justify-space-between font-weight-bold">
            <span>Total</span><span>{{ $formatPrice(order.totalAmount) }}</span>
          </div>
        </MobileOrderCard>
      </template>
    </MobileFullscreenDialog>

    <!-- DELETE CONFIRM -->
    <MobileBottomSheet v-model="deleteDialog" title="Confirm Delete">
      <p class="text-body-2 text-medium-emphasis mb-4">
        Are you sure you want to delete <strong>{{ selectedCustomer?.name }}</strong>?
      </p>
      <v-btn block size="large" color="error" class="font-weight-bold" @click="deleteCustomer">Delete</v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useCustomerStore } from "@/stores/customer";
import ActionMenu from "@/components/ActionMenu.vue";

const customerStore = useCustomerStore();

const dialog = ref(false);
const deleteDialog = ref(false);
const viewDialog = ref(false);
const selectedCustomer = ref(null);
const valid = ref(false);
const formRef = ref(null);
const page = ref(1);

const form = ref({ id: null, name: "", email: "", phone: "" });

const rules = {
  required: (v) => !!v || "Required",
  email: (v) => !v || /.+@.+\..+/.test(v) || "Invalid email",
};

const displayedCustomers = ref([]);
watch(() => customerStore.customers, (list) => {
  displayedCustomers.value = page.value === 1 ? list : [...displayedCustomers.value, ...list];
});

const viewCustomer = async (id) => {
  viewDialog.value = true;
  await customerStore.fetchCustomerById(id);
  await customerStore.fetchCustomerOrders(id, { take: 10 });
};

const fetchData = async () => {
  await customerStore.fetchCustomers(page.value);
};

const openDialog = (item = null) => {
  form.value = item ? { ...item } : { id: null, name: "", email: "", phone: "" };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
};

const submitForm = async () => {
  const isValid = await formRef.value?.validate();
  if (!isValid.valid) return;

  if (form.value.id) await customerStore.updateCustomer(form.value.id, form.value);
  else await customerStore.createCustomer(form.value);

  closeDialog();
  fetchData();
};

const confirmDelete = (item) => {
  selectedCustomer.value = item;
  deleteDialog.value = true;
};

function customerMenuActions(c) {
  return [
    { icon: "mdi-eye", color: "#2563EB", label: "View Details", onClick: () => viewCustomer(c.id) },
    { icon: "mdi-pencil", color: "#7C3AED", label: "Edit", onClick: () => openDialog(c) },
    { icon: "mdi-delete", color: "#DC2626", label: "Delete", onClick: () => confirmDelete(c), dividerBefore: true, danger: true },
  ];
}

const deleteCustomer = async () => {
  if (selectedCustomer.value) {
    await customerStore.deleteCustomer(selectedCustomer.value.id);
  }
  deleteDialog.value = false;
  fetchData();
};

watch(page, (newPage) => {
  customerStore.fetchCustomers(newPage, customerStore.take);
});

watch(
  () => customerStore.take,
  (newTake) => {
    page.value = 1;
    customerStore.fetchCustomers(1, newTake);
  }
);

onMounted(fetchData);
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
