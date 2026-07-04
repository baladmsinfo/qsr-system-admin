<template>
  <v-container
    fluid
    class="d-flex justify-center align-center py-10 bg-grey-lighten-4"
    style="
      min-height: 100vh;
      background: linear-gradient(135deg, #e0e7ff, #fdf2f8);
    "
  >
    <v-card
      elevation="12"
      class="pa-10 rounded-xxl glass-card"
      max-width="950"
      width="100%"
    >
      <v-form ref="formRef" v-model="formValid">

        <!-- Header Section -->
        <div class="text-center mb-10">
          <h2 class="text-h4 font-weight-bold mb-2">Create Your Restaurant</h2>
          <p class="text-body-2 text-medium-emphasis">
            We'll set up your company, main branch &amp; admin accounts automatically.
          </p>
        </div>

        <!-- Section: Company Login -->
        <div class="section-title mb-4">
          <v-icon size="20" class="mr-2">mdi-shield-account</v-icon>
          <span>Company Login</span>
        </div>

        <v-sheet class="glass-inner pa-5 rounded-lg mb-8">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.name"
                label="Full Name"
                prepend-icon="mdi-account"
                :rules="[rules.required, rules.name]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :rules="[rules.required, rules.password]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company.primaryEmail"
                type="email"
                label="Primary Email"
                prepend-icon="mdi-email"
                :rules="[
                  rules.required,
                  rules.email,
                  v => rules.notSameEmail(v, form.company.secondaryEmail)
                ]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company.primaryPhoneNo"
                label="Primary Phone"
                prepend-icon="mdi-phone"
                maxlength="10"
                inputmode="numeric"
                :rules="[
                  rules.required,
                  rules.phone,
                  v => rules.notSamePhone(v, form.company.secondaryPhoneNo)
                ]"
              />
            </v-col>

          </v-row>
        </v-sheet>

        <!-- Section: Branch Login -->
        <div class="section-title mb-4">
          <v-icon size="20" class="mr-2">mdi-storefront</v-icon>
          <span>Main Branch Login</span>
        </div>

        <v-sheet class="glass-inner pa-5 rounded-lg mb-8">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company.secondaryEmail"
                label="Branch Email (Main)"
                prepend-icon="mdi-email-plus"
                :rules="[
                  rules.required,
                  rules.email,
                  v => rules.notSameEmail(v, form.company.primaryEmail)
                ]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company.secondaryPhoneNo"
                label="Branch Phone (Main)"
                prepend-icon="mdi-phone-plus"
                :rules="[
                  rules.required,
                  rules.phone,
                  v => rules.notSamePhone(v, form.company.primaryPhoneNo)
                ]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.branch_password"
                label="Branch Password (Main)"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :rules="[rules.required, rules.password]"
              />
            </v-col>
          </v-row>
        </v-sheet>

        <!-- Section Divider -->
        <v-divider class="my-8"></v-divider>

        <!-- Section: Company Details -->
        <div class="section-title mb-4">
          <v-icon size="20" class="mr-2">mdi-office-building</v-icon>
          <span>Company Details</span>
        </div>

        <v-sheet class="glass-inner pa-5 rounded-lg">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company.name"
                label="Company Name"
                prepend-icon="mdi-domain"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company.tenant"
                label="Tenant Name"
                prepend-icon="mdi-web"
                :loading="tenantChecking"
                :error="tenantAvailable === false"
                :success="tenantAvailable === true"
                :hint="tenantAvailable === false ? 'Not available' : tenantAvailable === true ? 'Available' : ''"
                :persistent-hint="tenantAvailable === false"
                :rules="[rules.required, rules.tenant]"
                @input="onTenantInput"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company.gstNumber"
                label="GST Number"
                prepend-icon="mdi-barcode"
                maxlength="15"
                :rules="[rules.gst]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.company.companyType"
                :items="companyTypes"
                label="Company Type"
                prepend-icon="mdi-office-building-cog"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.company.currencyId"
                :items="currencies"
                item-title="name"
                item-value="id"
                label="Currency"
                prepend-icon="mdi-cash"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company.city"
                label="City"
                prepend-icon="mdi-map-marker"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company.state"
                label="State"
                prepend-icon="mdi-map"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.company.pincode"
                label="Pincode"
                prepend-icon="mdi-home-map-marker"
                maxlength="6"
                inputmode="numeric"
                :rules="[rules.required, rules.pincode]"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.company.addressLine1"
                label="Address Line 1"
                prepend-icon="mdi-home"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.company.addressLine2"
                label="Address Line 2"
                prepend-icon="mdi-home-outline"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.company.addressLine3"
                label="Address Line 3"
                prepend-icon="mdi-home-city"
              />
            </v-col>

          </v-row>
        </v-sheet>

        <!-- Submit Button -->
        <v-btn
          block
          color="primary"
          class="mt-10 py-4 text-body-1 font-weight-bold rounded-xl"
          @click="submit"
          :loading="loading"
        >
          Create My Company
        </v-btn>

      </v-form>

      <v-snackbar
        v-model="toast.show"
        :color="toast.color"
        location="top"
        timeout="3000"
      >
        {{ toast.message }}
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { navigateTo } from "#imports";

const auth = useAuthStore();
const loading = ref(false);
const showPassword = ref(false);

const tenantChecking = ref(false)
const tenantAvailable = ref(null)
let tenantTimer = null

const toast = reactive({ show: false, message: "", color: "success" });
const showToast = (msg, color = "success") => {
    toast.message = msg;
    toast.color = color;
    toast.show = true;
};

const currencies = computed(() =>
    Array.isArray(auth.currencies) ? auth.currencies : []
);
const companyTypes = ["Restaurant", "Cafe", "Hotel", "Food Court", "Cloud Kitchen", "Takeaway", "Franchise"];

onMounted(() => auth.fetchCurrencies());

const formRef = ref(null);
const formValid = ref(false);

const onTenantInput = () => {
    tenantAvailable.value = null
    clearTimeout(tenantTimer)

    if (!form.company.tenant || form.company.tenant.length < 3) return

    tenantTimer = setTimeout(async () => {
        tenantChecking.value = true
        const res = await auth.checkTenantAvailability(form.company.tenant)
        tenantAvailable.value = res.available
        tenantChecking.value = false
    }, 500) // 👈 debounce
}

const form = reactive({
    name: "",
    password: "",
    branch_password: "",
    company: {
        primaryEmail: "",
        primaryPhoneNo: "",
        secondaryEmail: "",
        secondaryPhoneNo: "",
        tenant: "",
        name: "",
        gstNumber: "",
        companyType: "",
        currencyId: "",
        city: "",
        state: "",
        pincode: "",
        addressLine1: "",
        addressLine2: "",
        addressLine3: ""
    }
});

// 🔒 Validation Rules
const rules = {
    required: v => !!v || "This field is required",

    notSameEmail: (value, compareValue) =>
        value !== compareValue || "Branch email cannot be the same as company email",

    notSamePhone: (value, compareValue) =>
        value !== compareValue || "Branch phone cannot be the same as company phone",

    tenant: v =>
        /^[a-zA-Z0-9][a-zA-Z0-9._]{2,29}$/.test(v)
        || "Enter a valid username (letters, numbers, . or _, 3–30 chars, no spaces)",

    name: v =>
        /^[a-zA-Z\s]{3,50}$/.test(v) || "Enter a valid name (letters only)",

    password: v =>
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(v)
        || "Min 6 chars, include letters & numbers",

    email: v =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address",

    phone: v =>
        /^[6-9]\d{9}$/.test(v) || "Enter valid 10-digit Indian mobile number",

    gst: v =>
        !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v)
        || "Invalid GST number",

    pincode: v =>
        /^[1-9][0-9]{5}$/.test(v) || "Enter valid 6-digit pincode"
};

// const form = reactive({
//     // ADMIN USER INFO
//     name: "Nandha Gopi",
//     password: "password",

//     company: {
//         // Two emails (for Admin + StoreAdmin)
//         primaryEmail: "support@chronicles.com",
//         secondaryEmail: "info@chronicles.com",

//         // Two phone numbers (for Admin + StoreAdmin)
//         primaryPhoneNo: "9876543210",
//         secondaryPhoneNo: "9123456780",

//         name: "Chronicles Cuisines Pvt Ltd",
//         gstNumber: "33ABCDE1234F1Z5",

//         // ⚠️ these two intentionally empty to force user to select
//         companyType: "",
//         currencyId: "",

//         city: "Dindigul",
//         state: "Tamil Nadu",
//         pincode: 624001,

//         addressLine1: "12, Main Road",
//         addressLine2: "Near Bus Stand",
//         addressLine3: "South Zone Office"
//     }
// });

const submit = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) {
        showToast("Please fix the errors before submitting", "error");
        return;
    }

    if (tenantAvailable.value === false) {
        showToast("Tenant name already taken", "error")
        return
    }

    loading.value = true;
    const res = await auth.register(form);
    loading.value = false;

    if (res.statusCode === "00") {
        showToast("Account created successfully!");
        setTimeout(() => navigateTo("/"), 1200);
    } else {
        showToast(res.message || "Registration failed", "error");
    }
};
</script>

<style scoped>
.glass-card {
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.32);
}

.glass-inner {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.05rem;
  opacity: 0.85;
}
</style>