<template>
  <v-container fluid class="pa-0 fill-height register-page">
    <v-row no-gutters class="fill-height flex-nowrap">

      <!-- Brand + Progress Panel -->
      <v-col cols="12" md="4" lg="3" class="d-none d-md-flex flex-column justify-space-between brand-panel pa-10">
        <div>
          <div class="d-flex align-center ga-3 mb-12">
            <div class="brand-mark-lg d-flex align-center justify-center">
              <v-icon color="white" size="26">mdi-silverware-fork-knife</v-icon>
            </div>
            <span class="text-h6 font-weight-bold text-white">Bucksbox</span>
          </div>

          <h1 class="text-h4 font-weight-bold text-white mb-3" style="letter-spacing: -0.02em">
            Let's set up your business
          </h1>
          <p class="text-body-2 text-white mb-10" style="opacity: 0.75">
            A few quick steps and you'll have your business, its address &amp; your first branch ready to go.
          </p>

          <div class="step-track">
            <div v-for="(s, idx) in steps" :key="s.title" class="step-track-item" :class="{ 'is-active': step === idx + 1, 'is-done': step > idx + 1 }">
              <div class="step-track-marker">
                <v-icon v-if="step > idx + 1" size="16" color="white">mdi-check-bold</v-icon>
                <span v-else class="text-caption font-weight-bold">{{ idx + 1 }}</span>
              </div>
              <div class="step-track-line" v-if="idx < steps.length - 1" />
              <div class="step-track-text">
                <div class="text-subtitle-2 font-weight-bold text-white">{{ s.title }}</div>
                <div class="text-caption text-white" style="opacity: 0.7">{{ s.subtitle }}</div>
              </div>
            </div>
          </div>
        </div>

        <p class="text-caption text-white" style="opacity: 0.5">&copy; {{ new Date().getFullYear() }} Bucksbox. All rights reserved.</p>
      </v-col>

      <!-- Form Panel -->
      <v-col cols="12" md="8" lg="9" class="form-panel d-flex flex-column">
        <div class="form-panel-scroll flex-grow-1">
          <div class="form-panel-inner">

            <!-- Mobile header + compact progress -->
            <div class="d-md-none mb-8">
              <div class="d-flex align-center ga-2 mb-4">
                <div class="brand-mark d-flex align-center justify-center">
                  <v-icon color="white" size="18">mdi-silverware-fork-knife</v-icon>
                </div>
                <span class="text-subtitle-1 font-weight-bold">Bucksbox</span>
              </div>
              <div class="d-flex ga-2 mb-3">
                <div v-for="(s, idx) in steps" :key="s.title" class="mobile-step-bar" :class="{ 'is-active': step >= idx + 1 }" />
              </div>
              <div class="text-caption text-medium-emphasis">Step {{ step }} of {{ steps.length }} &middot; {{ steps[step - 1].title }}</div>
            </div>

            <div class="mb-8 d-none d-md-block">
              <span class="text-overline text-primary font-weight-bold">Step {{ step }} of {{ steps.length }}</span>
              <h2 class="text-h5 font-weight-bold mt-1">{{ steps[step - 1].title }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">{{ steps[step - 1].subtitle }}</p>
            </div>

            <!-- STEP 1: Business Details & Login -->
            <v-window v-model="step">
              <v-window-item :value="1">
                <v-form ref="step1FormRef" v-model="step1Valid">
                  <div class="section-title mb-4">
                    <v-icon size="20" class="mr-2">mdi-domain</v-icon>
                    <span>Business Details</span>
                  </div>
                  <v-sheet class="section-card pa-5">
                    <v-row dense>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.name" label="Full Name" prepend-icon="mdi-account"
                          variant="underlined" density="comfortable" :rules="[rules.required, rules.name]" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.password" label="Password" :type="showPassword ? 'text' : 'password'"
                          prepend-icon="mdi-lock" variant="underlined" density="comfortable"
                          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showPassword = !showPassword"
                          :rules="[rules.required, rules.password]" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.company.primaryEmail" type="email" label="Primary Email"
                          prepend-icon="mdi-email" variant="underlined" density="comfortable"
                          :rules="[rules.required, rules.email, v => rules.notSameEmail(v, form.company.secondaryEmail)]" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.company.primaryPhoneNo" label="Primary Phone" prepend-icon="mdi-phone"
                          variant="underlined" density="comfortable" maxlength="10" inputmode="numeric"
                          :rules="[rules.required, rules.phone, v => rules.notSamePhone(v, form.company.secondaryPhoneNo)]" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.company.name" label="Business Name" prepend-icon="mdi-store"
                          variant="underlined" density="comfortable" :rules="[rules.required]" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.company.tenant" label="Business Handle (URL)" prepend-icon="mdi-web"
                          variant="underlined" density="comfortable" :loading="tenantChecking"
                          :error="tenantAvailable === false" :success="tenantAvailable === true"
                          :hint="tenantAvailable === false ? 'Not available' : tenantAvailable === true ? 'Available' : ''"
                          :persistent-hint="tenantAvailable === false" :rules="[rules.required, rules.tenant]"
                          @input="onTenantInput" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select v-model="form.company.companyType" :items="companyTypes" label="Business Type"
                          prepend-icon="mdi-office-building-cog" variant="underlined" density="comfortable" :rules="[rules.required]" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select v-model="form.company.currencyId" :items="currencies" item-title="name" item-value="id"
                          label="Currency" prepend-icon="mdi-cash" variant="underlined" density="comfortable" :rules="[rules.required]" />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field v-model="form.company.gstNumber" label="GST Number (optional)" prepend-icon="mdi-barcode"
                          variant="underlined" density="comfortable" maxlength="15" :rules="[rules.gst]" />
                      </v-col>
                    </v-row>
                  </v-sheet>
                </v-form>
              </v-window-item>

              <!-- STEP 2: Business Address -->
              <v-window-item :value="2">
                <v-form ref="step2FormRef" v-model="step2Valid">
                  <div class="section-title mb-4">
                    <v-icon size="20" class="mr-2">mdi-map-marker-radius</v-icon>
                    <span>Business Address</span>
                  </div>
                  <v-sheet class="section-card pa-5">
                    <v-row dense>
                      <v-col cols="12">
                        <v-text-field v-model="form.company.addressLine1" label="Address Line 1" prepend-icon="mdi-home"
                          variant="underlined" density="comfortable" :rules="[rules.required]" />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field v-model="form.company.addressLine2" label="Address Line 2 (optional)" prepend-icon="mdi-home-outline"
                          variant="underlined" density="comfortable" />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field v-model="form.company.addressLine3" label="Address Line 3 (optional)" prepend-icon="mdi-home-city"
                          variant="underlined" density="comfortable" />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field v-model="form.company.city" label="City" prepend-icon="mdi-map-marker"
                          variant="underlined" density="comfortable" :rules="[rules.required]" />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field v-model="form.company.state" label="State" prepend-icon="mdi-map"
                          variant="underlined" density="comfortable" :rules="[rules.required]" />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field v-model="form.company.pincode" label="Pincode" prepend-icon="mdi-home-map-marker"
                          variant="underlined" density="comfortable" maxlength="6" inputmode="numeric" :rules="[rules.required, rules.pincode]" />
                      </v-col>
                    </v-row>
                  </v-sheet>
                </v-form>
              </v-window-item>

              <!-- STEP 3: Branch Details -->
              <v-window-item :value="3">
                <v-form ref="step3FormRef" v-model="step3Valid">
                  <div class="section-title mb-4">
                    <v-icon size="20" class="mr-2">mdi-storefront</v-icon>
                    <span>Branch Login</span>
                  </div>
                  <v-sheet class="section-card pa-5 mb-8">
                    <v-row dense>
                      <v-col cols="12">
                        <v-text-field v-model="form.branch.name" :placeholder="branchNamePlaceholder" label="Branch Name (optional)"
                          prepend-icon="mdi-storefront-outline" variant="underlined" density="comfortable" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.company.secondaryEmail" label="Branch Email" prepend-icon="mdi-email-plus"
                          variant="underlined" density="comfortable"
                          :rules="[rules.required, rules.email, v => rules.notSameEmail(v, form.company.primaryEmail)]" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.company.secondaryPhoneNo" label="Branch Phone" prepend-icon="mdi-phone-plus"
                          variant="underlined" density="comfortable"
                          :rules="[rules.required, rules.phone, v => rules.notSamePhone(v, form.company.primaryPhoneNo)]" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.branch_password" label="Branch Password" :type="showBranchPassword ? 'text' : 'password'"
                          prepend-icon="mdi-lock" variant="underlined" density="comfortable"
                          :append-inner-icon="showBranchPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showBranchPassword = !showBranchPassword"
                          :rules="[rules.required, rules.password]" />
                      </v-col>
                    </v-row>
                  </v-sheet>

                  <div class="section-title mb-4 d-flex align-center justify-space-between" style="width: 100%">
                    <div class="d-flex align-center">
                      <v-icon size="20" class="mr-2">mdi-map-marker-radius</v-icon>
                      <span>Branch Address</span>
                    </div>
                    <v-switch v-model="form.branch.sameAsCompanyAddress" color="primary" density="compact" hide-details
                      label="Same as business address" class="section-switch" />
                  </div>

                  <v-sheet v-if="!form.branch.sameAsCompanyAddress" class="section-card pa-5">
                    <v-row dense>
                      <v-col cols="12">
                        <v-text-field v-model="form.branch.addressLine1" label="Address Line 1" prepend-icon="mdi-home"
                          variant="underlined" density="comfortable" :rules="[rules.required]" />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field v-model="form.branch.addressLine2" label="Address Line 2 (optional)" prepend-icon="mdi-home-outline"
                          variant="underlined" density="comfortable" />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field v-model="form.branch.addressLine3" label="Address Line 3 (optional)" prepend-icon="mdi-home-city"
                          variant="underlined" density="comfortable" />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field v-model="form.branch.city" label="City" prepend-icon="mdi-map-marker"
                          variant="underlined" density="comfortable" :rules="[rules.required]" />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field v-model="form.branch.state" label="State" prepend-icon="mdi-map"
                          variant="underlined" density="comfortable" :rules="[rules.required]" />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field v-model="form.branch.pincode" label="Pincode" prepend-icon="mdi-home-map-marker"
                          variant="underlined" density="comfortable" maxlength="6" inputmode="numeric" :rules="[rules.required, rules.pincode]" />
                      </v-col>
                    </v-row>
                  </v-sheet>

                  <v-sheet v-else class="section-card section-card--muted pa-5 d-flex align-center ga-3">
                    <v-icon color="primary">mdi-map-check-outline</v-icon>
                    <span class="text-body-2 text-medium-emphasis">This branch will use your business address from the previous step.</span>
                  </v-sheet>
                </v-form>
              </v-window-item>
            </v-window>

          </div>
        </div>

        <!-- Sticky action bar -->
        <div class="form-panel-actions px-6 px-md-10 py-4 d-flex align-center justify-space-between">
          <v-btn v-if="step > 1" variant="text" prepend-icon="mdi-arrow-left" @click="goBack">Back</v-btn>
          <span v-else />

          <v-btn v-if="step < steps.length" color="primary" size="large" append-icon="mdi-arrow-right" @click="goNext">
            Continue
          </v-btn>
          <v-btn v-else color="primary" size="large" :loading="loading" @click="submit">
            Create My Business Account
          </v-btn>
        </div>

      </v-col>
    </v-row>

    <v-snackbar v-model="toast.show" :color="toast.color" location="top" timeout="3000">
      {{ toast.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { navigateTo } from "#imports";

const auth = useAuthStore();
const loading = ref(false);
const showPassword = ref(false);
const showBranchPassword = ref(false);

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

const steps = [
  { title: "Business & Login", subtitle: "Your business identity and owner login" },
  { title: "Business Address", subtitle: "Where customers will find you" },
  { title: "Branch Details", subtitle: "Your first branch's login & address" },
];

const step = ref(1);
const step1FormRef = ref(null);
const step2FormRef = ref(null);
const step3FormRef = ref(null);
const step1Valid = ref(false);
const step2Valid = ref(false);
const step3Valid = ref(false);

const onTenantInput = () => {
    tenantAvailable.value = null
    clearTimeout(tenantTimer)

    if (!form.company.tenant || form.company.tenant.length < 3) return

    tenantTimer = setTimeout(async () => {
        tenantChecking.value = true
        const res = await auth.checkTenantAvailability(form.company.tenant)
        tenantAvailable.value = res.available
        tenantChecking.value = false
    }, 500) // debounce
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
    },
    branch: {
        name: "",
        sameAsCompanyAddress: true,
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        city: "",
        state: "",
        pincode: "",
    }
});

const branchNamePlaceholder = computed(() =>
  form.company.name ? `${form.company.name} - Main` : "Main Branch"
);

// Validation Rules
const rules = {
    required: v => !!v || "This field is required",

    notSameEmail: (value, compareValue) =>
        value !== compareValue || "Branch email cannot be the same as business email",

    notSamePhone: (value, compareValue) =>
        value !== compareValue || "Branch phone cannot be the same as business phone",

    tenant: v =>
        /^[a-zA-Z0-9][a-zA-Z0-9._]{2,29}$/.test(v)
        || "Enter a valid handle (letters, numbers, . or _, 3–30 chars, no spaces)",

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

async function goNext() {
    const formRef = step.value === 1 ? step1FormRef : step2FormRef
    const { valid } = await formRef.value.validate();
    if (!valid) {
        showToast("Please fix the errors before continuing", "error");
        return;
    }
    if (step.value === 1 && tenantAvailable.value === false) {
        showToast("Business handle already taken", "error")
        return
    }
    step.value++
}

function goBack() {
    if (step.value > 1) step.value--
}

const submit = async () => {
    const { valid } = await step3FormRef.value.validate();
    if (!valid) {
        showToast("Please fix the errors before submitting", "error");
        return;
    }

    loading.value = true;

    const payload = {
        name: form.name,
        password: form.password,
        branch_password: form.branch_password,
        company: { ...form.company },
        branch: {
            name: form.branch.name || undefined,
            ...(form.branch.sameAsCompanyAddress ? {} : {
                addressLine1: form.branch.addressLine1,
                addressLine2: form.branch.addressLine2,
                addressLine3: form.branch.addressLine3,
                city: form.branch.city,
                state: form.branch.state,
                pincode: form.branch.pincode,
            })
        }
    };

    const res = await auth.register(payload);
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
.register-page {
  background: #FAF9FC;
}

.brand-panel {
  background: linear-gradient(160deg, #6D28D9 0%, #5B21B6 100%);
}

.brand-mark-lg {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #6D28D9;
  flex-shrink: 0;
}

.step-track {
  display: flex;
  flex-direction: column;
}

.step-track-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 32px;
}

.step-track-item:last-child {
  padding-bottom: 0;
}

.step-track-marker {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.step-track-item.is-active .step-track-marker {
  background: #fff;
  border-color: #fff;
  color: #6D28D9;
}

.step-track-item.is-active .step-track-marker span {
  color: #6D28D9;
}

.step-track-item.is-done .step-track-marker {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.5);
}

.step-track-line {
  position: absolute;
  left: 13.5px;
  top: 28px;
  bottom: 0;
  width: 1.5px;
  background: rgba(255, 255, 255, 0.25);
}

.step-track-item.is-done .step-track-line {
  background: rgba(255, 255, 255, 0.55);
}

.step-track-text {
  padding-top: 3px;
}

.mobile-step-bar {
  height: 4px;
  border-radius: 2px;
  flex: 1;
  background: #EAE6F2;
  transition: background 0.2s ease;
}

.mobile-step-bar.is-active {
  background: #6D28D9;
}

.form-panel {
  height: 100vh;
  overflow: hidden;
}

.form-panel-scroll {
  overflow-y: auto;
}

.form-panel-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 32px;
}

@media (min-width: 960px) {
  .form-panel-inner {
    padding: 56px 40px 32px;
  }
}

.form-panel-actions {
  border-top: 1px solid #EAE6F2;
  background: #fff;
  flex-shrink: 0;
}

.section-card {
  background: #FBFAFD;
  border: 1px solid #EAE6F2;
  border-radius: 14px;
}

.section-card--muted {
  background: #F4F1FA;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-family: 'Manrope', sans-serif;
  font-size: 1.05rem;
  color: #6D28D9;
}

.section-switch :deep(.v-label) {
  font-size: 0.8rem;
  opacity: 0.8;
}
</style>
