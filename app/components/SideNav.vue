<template>
    <v-navigation-drawer class="side-nav" v-model="drawerOpen" app :permanent="!mobile" :temporary="mobile" width="264">
        <template #prepend>
            <div class="d-flex align-center ga-3 px-5 pt-6 pb-5">
                <div class="brand-mark d-flex align-center justify-center">
                    <v-icon color="white" size="20">mdi-silverware-fork-knife</v-icon>
                </div>
                <div class="d-flex flex-column justify-center" style="min-width: 0">
                    <h2 class="text-subtitle-1 font-weight-bold mb-0 text-truncate">{{ companyName }}</h2>
                    <span class="text-caption text-medium-emphasis">{{ roleLabel }}</span>
                </div>
            </div>
            <v-divider />
        </template>

        <!-- Navigation -->
        <v-list density="comfortable" nav class="px-3 side-nav-list">
            <v-list-item :to="'/admin/dashboard'" link class="nav-item">
                <v-icon class="me-3" size="24">mdi-view-dashboard-outline</v-icon>
                <span class="text-subtitle-2">Dashboard</span>
            </v-list-item>

            <v-list-item v-if="canSeeKitchen" :to="'/admin/kitchen'" link class="nav-item">
                <v-icon class="me-3" size="24">mdi-chef-hat</v-icon>
                <span class="text-subtitle-2">Kitchen Display</span>
            </v-list-item>

            <v-list-item v-if="canSeeOrders" :to="'/admin/orders'" link class="nav-item">
                <v-icon class="me-3" size="24">mdi-receipt-text-clock-outline</v-icon>
                <span class="text-subtitle-2">Live Orders</span>
            </v-list-item>

            <v-list-item v-if="canSeePos" :to="'/admin/pos'" link class="nav-item">
                <v-icon class="me-3" size="24">mdi-cash-register</v-icon>
                <span class="text-subtitle-2">POS / Billing</span>
            </v-list-item>

            <!-- Menu / Tables -->
            <v-list-group v-if="canManageBranch">
                <template #activator="{ props }">
                    <v-list-item v-bind="props" prepend-icon="mdi-food-outline" title="Menu" class="nav-item" />
                </template>
                <v-list-item :to="'/admin/menu'" link class="nav-subitem">
                    <span class="text-subtitle-2">Categories &amp; Items</span>
                </v-list-item>
                <v-list-item :to="'/admin/tables'" link class="nav-subitem">
                    <span class="text-subtitle-2">Tables &amp; QR</span>
                </v-list-item>
            </v-list-group>

            <v-list-item v-if="canSeeCustomers" :to="'/admin/customer'" link class="nav-item">
                <v-icon class="me-3" size="24">mdi-account-group-outline</v-icon>
                <span class="text-subtitle-2">Customers</span>
            </v-list-item>

            <!-- Purchases / Vendors / Expenses -->
            <v-list-group v-if="canManageAccounting || isBranchAdmin">
                <template #activator="{ props }">
                    <v-list-item v-bind="props" prepend-icon="mdi-cart-arrow-down" title="Purchases &amp; Expenses"
                        class="nav-item" />
                </template>
                <v-list-item :to="'/admin/purchases'" link class="nav-subitem">
                    <span class="text-subtitle-2">Purchases</span>
                </v-list-item>
                <v-list-item :to="'/admin/vendor'" link class="nav-subitem">
                    <span class="text-subtitle-2">Vendors</span>
                </v-list-item>
                <v-list-item :to="'/admin/expense'" link class="nav-subitem">
                    <span class="text-subtitle-2">Expenses</span>
                </v-list-item>
            </v-list-group>

            <!-- Accounting -->
            <v-list-group v-if="canManageAccounting">
                <template #activator="{ props }">
                    <v-list-item v-bind="props" prepend-icon="mdi-file-chart" title="Accounting" class="nav-item" />
                </template>
                <v-list-item :to="'/admin/setup/chart-of-accounts'" link class="nav-subitem">
                    <span class="text-subtitle-2">Chart of Accounts</span>
                </v-list-item>
                <v-list-item :to="'/admin/journals'" link class="nav-subitem">
                    <span class="text-subtitle-2">Journal Entry</span>
                </v-list-item>
                <v-list-item :to="'/admin/reports/trial_balance'" link class="nav-subitem">
                    <span class="text-subtitle-2">Trial Balance</span>
                </v-list-item>
                <v-list-item :to="'/admin/reports/ledger_reports'" link class="nav-subitem">
                    <span class="text-subtitle-2">Ledger Reports</span>
                </v-list-item>
                <v-list-item :to="'/admin/reports/profitandloss'" link class="nav-subitem">
                    <span class="text-subtitle-2">Profit &amp; Loss</span>
                </v-list-item>
                <v-list-item :to="'/admin/reports/tax-reports'" link class="nav-subitem">
                    <span class="text-subtitle-2">Tax Reports</span>
                </v-list-item>
            </v-list-group>

            <!-- Setup -->
            <v-list-group v-if="isSuperAdmin">
                <template #activator="{ props }">
                    <v-list-item v-bind="props" prepend-icon="mdi-cog-outline" title="Setup" class="nav-item" />
                </template>

                <v-list-item :to="'/admin/tax'" link class="nav-subitem">
                    <span class="text-subtitle-2">Tax Setup</span>
                </v-list-item>

                <v-list-item :to="'/admin/branch'" link class="nav-subitem">
                    <span class="text-subtitle-2">Branch Setup</span>
                </v-list-item>

                <v-list-item :to="'/admin/banner'" link class="nav-subitem">
                    <span class="text-subtitle-2">Banner Setup</span>
                </v-list-item>

                <v-list-item :to="'/admin/subscription/subscription'" link class="nav-subitem">
                    <span class="text-subtitle-2">Subscription</span>
                </v-list-item>
            </v-list-group>

            <v-list-item v-if="canManageBranch" :to="'/admin/manageuser'" link class="nav-item">
                <v-icon class="me-3" size="24">mdi-account-multiple-outline</v-icon>
                <span class="text-subtitle-2">Staff</span>
            </v-list-item>
        </v-list>

        <template #append>
            <div class="px-3 pb-4 pt-2">
                <v-divider class="mb-2" />
                <v-list-item @click="handleLogout" link class="nav-item">
                    <v-icon class="me-3" size="22" color="error">mdi-logout</v-icon>
                    <span class="text-subtitle-2 font-weight-medium text-error">Logout</span>
                </v-list-item>
            </div>
        </template>
    </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { useAuthStore } from "@/stores/auth";
import { useNavDrawer } from "@/composables/useNavDrawer";
import { storeToRefs } from "pinia";

const router = useRouter();
const { mobile } = useDisplay();
const { drawerOpen } = useNavDrawer();
const Auth = useAuthStore();
const { userInfo, role } = storeToRefs(Auth);

// Start collapsed on phones/tablets, open on desktop
watch(mobile, (isMobile) => { drawerOpen.value = !isMobile }, { immediate: true })

const companyName = computed(() => userInfo.value?.company?.name || "My Restaurant");

const roleLabels = {
    SUPERADMIN: "Super Admin", BRANCHADMIN: "Branch Admin", KITCHEN: "Kitchen",
    CASHIER: "Cashier", WAITER: "Waiter", ACCOUNTANT: "Accountant",
};
const roleLabel = computed(() => roleLabels[role.value] || "");

const isSuperAdmin = computed(() => role.value === "SUPERADMIN");
const isBranchAdmin = computed(() => role.value === "BRANCHADMIN");
const canManageBranch = computed(() => ["SUPERADMIN", "BRANCHADMIN"].includes(role.value));
const canManageAccounting = computed(() => ["SUPERADMIN", "ACCOUNTANT"].includes(role.value));
const canSeeKitchen = computed(() => ["SUPERADMIN", "BRANCHADMIN", "KITCHEN"].includes(role.value));
const canSeeOrders = computed(() => ["SUPERADMIN", "BRANCHADMIN", "WAITER", "CASHIER", "KITCHEN", "ACCOUNTANT"].includes(role.value));
const canSeePos = computed(() => ["SUPERADMIN", "BRANCHADMIN", "CASHIER"].includes(role.value));
const canSeeCustomers = computed(() => ["SUPERADMIN", "BRANCHADMIN", "WAITER", "CASHIER"].includes(role.value));

async function handleLogout() {
    await Auth.logout();
    router.push("/");
}

router.afterEach(() => {
    if (mobile.value) drawerOpen.value = false
})

onMounted(async () => {
    if (!Auth.userInfo && !Auth.token) {
        await Auth.fetchMe();
        await Auth.restoreToken();
    }
});
</script>

<style scoped>
.side-nav {
    background: #fff !important;
    border-right: 1px solid #EAE6F2 !important;
}

.brand-mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgb(var(--v-theme-primary));
    flex-shrink: 0;
}

.side-nav-list :deep(.nav-item),
.side-nav-list :deep(.nav-subitem) {
    border-radius: 8px;
    margin-bottom: 2px;
    min-height: 42px;
    color: #5B5566;
}

.side-nav-list :deep(.nav-subitem) {
    padding-inline-start: 44px !important;
    min-height: 36px;
    font-size: 0.85rem;
}

.side-nav-list :deep(.nav-item:hover),
.side-nav-list :deep(.nav-subitem:hover) {
    background: #F7F5FB;
}

.side-nav-list :deep(.nav-item.v-list-item--active) {
    background: #F3F1F8;
    color: rgb(var(--v-theme-primary));
    font-weight: 600;
    border-left: 3px solid rgb(var(--v-theme-primary));
}

.side-nav-list :deep(.v-list-group__items .nav-subitem.v-list-item--active) {
    color: rgb(var(--v-theme-primary));
    font-weight: 600;
}
</style>
