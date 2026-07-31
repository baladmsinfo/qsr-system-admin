<template>
  <v-navigation-drawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
    temporary location="left" width="288" class="mobile-side-nav">
    <div class="d-flex align-center ga-3 px-5 pt-6 pb-5">
      <div class="brand-mark d-flex align-center justify-center">
        <v-img v-if="companyLogo" :src="companyLogo" cover class="w-100 h-100" />
        <span v-else class="text-white font-weight-bold text-subtitle-1">{{ companyInitial }}</span>
      </div>
      <div style="min-width: 0">
        <div class="text-subtitle-1 font-weight-bold text-truncate">{{ companyName }}</div>
        <div class="text-caption text-medium-emphasis">{{ roleLabel }}</div>
      </div>
    </div>
    <v-divider />

    <v-list density="comfortable" nav class="px-3 mobile-side-nav-list">
      <template v-for="group in groupedItems" :key="group.key">
        <v-list-subheader v-if="group.label">{{ group.label }}</v-list-subheader>
        <v-list-item v-for="row in group.rows" :key="row.to" :to="row.to" link class="nav-item"
          @click="$emit('update:modelValue', false)">
          <template v-if="row.icon" #prepend>
            <v-icon size="22">{{ row.icon }}</v-icon>
          </template>
          <span class="text-subtitle-2">{{ row.label }}</span>
        </v-list-item>
      </template>
    </v-list>

    <template #append>
      <div class="px-3 pb-4 pt-2">
        <v-divider class="mb-2" />
        <v-list-item @click="handleLogout" link class="nav-item">
          <template #prepend>
            <v-icon size="22" color="error">mdi-logout</v-icon>
          </template>
          <span class="text-subtitle-2 font-weight-medium text-error">Logout</span>
        </v-list-item>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { getNavItems, NAV_GROUP_ORDER } from "@/utils/navItems";

defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const router = useRouter();
const Auth = useAuthStore();
const { userInfo, role } = storeToRefs(Auth);

const companyName = computed(() => userInfo.value?.company?.name || "My Business");
const companyLogo = computed(() => userInfo.value?.company?.logoUrlLong || userInfo.value?.company?.logoUrlShort || null);
const companyInitial = computed(() => companyName.value.trim().charAt(0).toUpperCase());

const roleLabels = {
  SUPERADMIN: "Super Admin", BRANCHADMIN: "Branch Admin", KITCHEN: "Kitchen",
  CASHIER: "Cashier", WAITER: "Waiter", ACCOUNTANT: "Accountant",
};
const roleLabel = computed(() => roleLabels[role.value] || "");

// The full menu the role can see (including items also pinned to the bottom
// nav - this drawer is the complete map of the app, the bottom nav is just
// quick access to the 4 busiest ones), organized under group headers in a
// fixed, sensible order rather than one flat list.
const groupedItems = computed(() => {
  const { items } = getNavItems(role.value);
  const visible = items.filter((item) => item.show);

  const byGroup = new Map();
  for (const item of visible) {
    const rows = item.children
      ? item.children.map((c) => ({ label: c.label, to: c.to, icon: c.icon }))
      : [{ label: item.label, to: item.to, icon: item.icon }];
    if (!byGroup.has(item.group)) byGroup.set(item.group, []);
    byGroup.get(item.group).push(...rows);
  }

  return NAV_GROUP_ORDER
    .filter((group) => byGroup.has(group))
    .map((group) => ({ key: group, label: group, rows: byGroup.get(group) }));
});

async function handleLogout() {
  emit("update:modelValue", false);
  await Auth.logout();
  router.push("/");
}
</script>

<style scoped>
/* Vuetify assigns this drawer's z-index dynamically via inline style based on
   layout registration order, which can land below .mobile-bottom-nav's fixed
   z-index:1005 - force it (and its auto-generated scrim) above the bottom nav
   so the drawer visually covers it while open, not sits behind it. */
.mobile-side-nav {
  background: #fff !important;
  z-index: 1100 !important;
}

:deep(.v-navigation-drawer__scrim) {
  z-index: 1099 !important;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%);
  box-shadow: 0 6px 16px -4px rgba(124, 58, 237, 0.5);
  flex-shrink: 0;
  overflow: hidden;
}

.mobile-side-nav-list :deep(.v-list-subheader) {
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8B8599;
  min-height: unset;
  padding: 0 4px;
  margin: 14px 0 6px;
}

.mobile-side-nav-list :deep(.v-list-subheader:first-of-type) {
  margin-top: 4px;
}

.mobile-side-nav-list :deep(.v-list-subheader:not(:first-of-type)) {
  border-top: 1px solid #EEE9F7;
  padding-top: 14px;
}

.mobile-side-nav-list :deep(.nav-item) {
  border-radius: 12px;
  margin-bottom: 2px;
  min-height: 46px;
  color: #5B5566;
}

.mobile-side-nav-list :deep(.nav-item:active) {
  background: #F8F6FC;
}

.mobile-side-nav-list :deep(.nav-item.v-list-item--active) {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(219, 39, 119, 0.1) 100%);
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.mobile-side-nav-list :deep(.nav-item.v-list-item--active .v-icon) {
  color: rgb(var(--v-theme-primary));
}
</style>
