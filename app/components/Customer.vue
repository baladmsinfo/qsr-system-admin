<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Customers</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Guests who have dined in or ordered via QR
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">
        Add Customer
      </v-btn>
    </div>

    <!-- Customer Cards -->
    <v-row>
      <v-col v-for="c in displayedCustomers" :key="c.id" cols="12" sm="6" lg="4">
        <div class="app-card pa-5 h-100 d-flex flex-column">
          <div class="d-flex justify-space-between align-start mb-2">
            <div class="font-weight-bold text-subtitle-1">{{ c.name }}</div>
            <v-menu>
              <template #activator="{ props }">
                <v-btn size="small" variant="text" icon="mdi-dots-vertical" v-bind="props" />
              </template>
              <v-list density="compact">
                <v-list-item @click="viewCustomer(c.id)">View Details</v-list-item>
                <v-list-item @click="openDialog(c)">Edit</v-list-item>
                <v-list-item @click="confirmDelete(c)"><span class="text-error">Delete</span></v-list-item>
              </v-list>
            </v-menu>
          </div>
          <div class="text-body-2 text-medium-emphasis mb-1">{{ c.email || '—' }}</div>
          <div class="text-body-2 text-medium-emphasis">{{ c.phone || '—' }}</div>
        </div>
      </v-col>

      <v-col v-if="!displayedCustomers.length" cols="12">
        <div class="app-card pa-10 text-center text-medium-emphasis">No customers yet</div>
      </v-col>
    </v-row>

    <div v-if="displayedCustomers.length < customerStore.total" class="d-flex justify-center mt-6">
      <v-btn variant="outlined" class="load-more-btn" :loading="customerStore.loading" @click="page += 1">View More</v-btn>
    </div>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="480px">
      <v-card>
        <v-card-title>{{ form.id ? "Edit Customer" : "Add Customer" }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="valid" lazy-validation>
            <v-text-field v-model="form.name" label="Customer Name" :rules="[rules.required]" required />
            <v-text-field v-model="form.email" label="Email" :rules="[rules.email]" />
            <v-text-field v-model="form.phone" label="Phone Number" />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="customerStore.loading" @click="submitForm">
            {{ form.id ? "Update" : "Create" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" fullscreen transition="dialog-bottom-transition">
      <v-card class="bg-grey-lighten-5">
        <v-toolbar flat color="primary">
          <v-btn icon @click="viewDialog = false"><v-icon>mdi-arrow-left</v-icon></v-btn>
          <v-toolbar-title class="font-weight-bold">Customer Details</v-toolbar-title>
        </v-toolbar>

        <v-container v-if="!customerStore.selectedCustomer" class="fill-height d-flex align-center justify-center">
          <v-progress-circular indeterminate color="primary" />
        </v-container>

        <v-container v-else class="pa-6">
          <div class="app-card pa-6 mb-6">
            <v-row align="center">
              <v-col cols="12" md="8">
                <h2 class="text-h5 font-weight-bold mb-1">{{ customerStore.selectedCustomer.name }}</h2>
                <div class="text-medium-emphasis mb-2">
                  <v-icon size="16">mdi-phone</v-icon> {{ customerStore.selectedCustomer.phone || '-' }}
                  &nbsp;&bull;&nbsp;
                  <v-icon size="16">mdi-email</v-icon> {{ customerStore.selectedCustomer.email || '-' }}
                </div>
              </v-col>
              <v-col cols="12" md="4" class="text-md-right">
                <div class="text-caption text-medium-emphasis">Customer Since</div>
                <div class="font-weight-medium">
                  {{ new Date(customerStore.selectedCustomer.createdAt).toLocaleDateString() }}
                </div>
              </v-col>
            </v-row>
          </div>

          <v-row class="mb-6">
            <v-col cols="12" md="6">
              <div class="app-card pa-5">
                <div class="text-caption text-medium-emphasis">Total Orders</div>
                <h3 class="text-h6 font-weight-bold">{{ customerStore.orders.length }}</h3>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="app-card pa-5">
                <div class="text-caption text-medium-emphasis">Total Spent</div>
                <h3 class="text-h6 font-weight-bold">
                  {{ $formatPrice(customerStore.orders.reduce((s, o) => s + o.totalAmount, 0)) }}
                </h3>
              </div>
            </v-col>
          </v-row>

          <div class="app-card pa-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-6">Order History</h3>

            <v-row>
              <v-col v-for="order in customerStore.orders" :key="order.id" cols="12">
                <div class="app-card pa-5 mb-4">
                  <div class="d-flex justify-space-between align-start mb-3">
                    <div>
                      <div class="font-weight-bold text-body-1">{{ order.table?.tableNo || 'Takeaway' }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ new Date(order.createdAt).toLocaleString() }}
                      </div>
                    </div>
                    <v-chip size="small" variant="tonal">{{ order.status }}</v-chip>
                  </div>

                  <div v-for="item in order.orderItems" :key="item.id" class="d-flex justify-space-between text-body-2">
                    <span>{{ item.quantity }} &times; {{ item.menuItem?.name }}</span>
                    <span>{{ $formatPrice(item.total) }}</span>
                  </div>

                  <v-divider class="my-2" />
                  <div class="d-flex justify-space-between font-weight-bold">
                    <span>Total</span><span>{{ $formatPrice(order.totalAmount) }}</span>
                  </div>
                </div>
              </v-col>

              <v-col v-if="!customerStore.orders.length" cols="12" class="text-center text-medium-emphasis py-6">
                No orders yet
              </v-col>
            </v-row>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ selectedCustomer?.name }}</strong>?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteCustomer">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useCustomerStore } from "@/stores/customer";

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
