<template>
  <nav class="mobile-bottom-nav d-flex align-center justify-space-around">
    <RouterLink v-for="item in primaryItems" :key="item.key" :to="item.to"
      class="mobile-bottom-nav-item d-flex flex-column align-center justify-center"
      :class="{ 'mobile-bottom-nav-item--active': isActive(item) }">
      <span class="mobile-bottom-nav-icon d-flex align-center justify-center">
        <v-icon :icon="item.icon" size="20" />
      </span>
      <span class="mobile-bottom-nav-label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { getNavItems } from "@/utils/navItems";

const route = useRoute();
const Auth = useAuthStore();
const { role } = storeToRefs(Auth);

const primaryItems = computed(() => {
  const { items } = getNavItems(role.value);
  return items
    .filter((item) => item.primary && item.show)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4);
});

function isActive(item) {
  return route.path === item.to || route.path.startsWith(`${item.to}/`);
}
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1005;
  box-shadow: 0 -4px 16px rgba(26, 22, 38, 0.06);
}

.mobile-bottom-nav-item {
  flex: 1;
  min-width: 0;
  height: 100%;
  gap: 2px;
  padding: 6px 2px 0;
  border: none;
  background: transparent;
  color: #8B8599;
  text-decoration: none;
  cursor: pointer;
}

.mobile-bottom-nav-icon {
  width: 40px;
  height: 26px;
  border-radius: 999px;
  transition: background 0.2s ease;
}

.mobile-bottom-nav-label {
  max-width: 100%;
  font-size: 0.6875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-bottom-nav-item--active {
  color: rgb(var(--v-theme-primary));
}

.mobile-bottom-nav-item--active .mobile-bottom-nav-icon {
  background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%);
  color: #fff;
}

.mobile-bottom-nav-item--active .mobile-bottom-nav-label {
  font-weight: 700;
}
</style>
