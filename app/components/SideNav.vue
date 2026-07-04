<template>
    <v-navigation-drawer class="bg-background" v-model="drawer" app permanent width="250">
        <!-- Header -->
        <v-sheet class="px-4 bg-background py-3 d-flex align-center justify-space-between">
            <div class="d-flex flex-column justify-center">
                <h2 class="text-caption mb-0">{{ companyName }}</h2>
                <span class="text-caption text-medium-emphasis">{{ roleLabel }}</span>
            </div>
            <v-icon class="align-self-center" size="28">mdi-silverware-fork-knife</v-icon>
        </v-sheet>

        <v-divider></v-divider>

        <!-- Navigation -->
        <v-list density="comfortable" nav>
            <v-list-item :to="'/admin/dashboard'" link class="px-4 py-2">
                <v-icon class="me-3" size="24">mdi-view-dashboard-outline</v-icon>
                <span class="text-subtitle-2">Dashboard</span>
            </v-list-item>

            <v-list-item v-if="canSeeKitchen" :to="'/admin/kitchen'" link class="px-4 py-2">
                <v-icon class="me-3" size="24">mdi-chef-hat</v-icon>
                <span class="text-subtitle-2">Kitchen Display</span>
            </v-list-item>

            <v-list-item v-if="canSeeOrders" :to="'/admin/orders'" link class="px-4 py-2">
                <v-icon class="me-3" size="24">mdi-receipt-text-clock-outline</v-icon>
                <span class="text-subtitle-2">Live Orders</span>
            </v-list-item>

            <v-list-item v-if="canSeePos" :to="'/admin/pos'" link class="px-4 py-2">
                <v-icon class="me-3" size="24">mdi-cash-register</v-icon>
                <span class="text-subtitle-2">POS / Billing</span>
            </v-list-item>

            <!-- Menu / Tables -->
            <v-list-group v-if="canManageBranch">
                <template #activator="{ props }">
                    <v-list-item v-bind="props" prepend-icon="mdi-food-outline" title="Menu" class="px-4 py-2" />
                </template>
                <v-list-item :to="'/admin/menu'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Categories &amp; Items</span>
                </v-list-item>
                <v-list-item :to="'/admin/tables'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Tables &amp; QR</span>
                </v-list-item>
            </v-list-group>

            <v-list-item v-if="canSeeCustomers" :to="'/admin/customer'" link class="px-4 py-2">
                <v-icon class="me-3" size="24">mdi-account-group-outline</v-icon>
                <span class="text-subtitle-2">Customers</span>
            </v-list-item>

            <!-- Purchases / Vendors / Expenses -->
            <v-list-group v-if="canManageAccounting || isBranchAdmin">
                <template #activator="{ props }">
                    <v-list-item v-bind="props" prepend-icon="mdi-cart-arrow-down" title="Purchases &amp; Expenses"
                        class="px-4 py-2" />
                </template>
                <v-list-item :to="'/admin/purchases'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Purchases</span>
                </v-list-item>
                <v-list-item :to="'/admin/vendor'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Vendors</span>
                </v-list-item>
                <v-list-item :to="'/admin/expense'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Expenses</span>
                </v-list-item>
            </v-list-group>

            <!-- Accounting -->
            <v-list-group v-if="canManageAccounting">
                <template #activator="{ props }">
                    <v-list-item v-bind="props" prepend-icon="mdi-file-chart" title="Accounting" class="px-4 py-2" />
                </template>
                <v-list-item :to="'/admin/setup/chart-of-accounts'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Chart of Accounts</span>
                </v-list-item>
                <v-list-item :to="'/admin/journals'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Journal Entry</span>
                </v-list-item>
                <v-list-item :to="'/admin/reports/trial_balance'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Trial Balance</span>
                </v-list-item>
                <v-list-item :to="'/admin/reports/ledger_reports'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Ledger Reports</span>
                </v-list-item>
                <v-list-item :to="'/admin/reports/profitandloss'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Profit &amp; Loss</span>
                </v-list-item>
                <v-list-item :to="'/admin/reports/tax-reports'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Tax Reports</span>
                </v-list-item>
            </v-list-group>

            <!-- Setup -->
            <v-list-group v-if="isSuperAdmin">
                <template #activator="{ props }">
                    <v-list-item v-bind="props" prepend-icon="mdi-cog-outline" title="Setup" class="px-4 py-2" />
                </template>

                <v-list-item :to="'/admin/tax'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Tax Setup</span>
                </v-list-item>

                <v-list-item :to="'/admin/branch'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Branch Setup</span>
                </v-list-item>

                <v-list-item :to="'/admin/banner'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Banner Setup</span>
                </v-list-item>

                <v-list-item :to="'/admin/subscription/subscription'" link class="px-8 py-2">
                    <span class="text-subtitle-2">Subscription</span>
                </v-list-item>
            </v-list-group>

            <v-list-item v-if="canManageBranch" :to="'/admin/manageuser'" link class="px-4 py-2">
                <v-icon class="me-3" size="24">mdi-account-multiple-outline</v-icon>
                <span class="text-subtitle-2">Staff</span>
            </v-list-item>
        </v-list>

        <v-divider class="my-2" />

        <!-- 🔒 Logout -->
        <v-list-item @click="handleLogout" link class="px-6 py-2">
            <v-icon class="me-3 text-error" size="24">mdi-logout</v-icon>
            <span class="text-subtitle-2 text-error">Logout</span>
        </v-list-item>
    </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const router = useRouter();
const drawer = ref(true);
const Auth = useAuthStore();
const { userInfo, role } = storeToRefs(Auth);

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

onMounted(async () => {
    if (!Auth.userInfo && !Auth.token) {
        await Auth.fetchMe();
        await Auth.restoreToken();
    }
});
</script>
