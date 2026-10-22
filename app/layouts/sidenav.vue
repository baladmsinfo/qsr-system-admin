<template>
    <v-app-bar v-if="isTablet" flat class="mobile-bar" height="56">
        <v-btn icon="mdi-menu" variant="text" @click="drawerOpen = !drawerOpen" />
        <span class="text-subtitle-1 font-weight-bold">Bucksbox</span>
    </v-app-bar>

    <SideNav v-if="!isMobile" />

    <v-main :class="{ 'mobile-shell-main': isMobile }">
        <slot />
    </v-main>

    <MobileBottomNav v-if="isMobile" />
    <MobileSideNav v-if="isMobile" v-model="moreOpen" />

    <SubscriptionLimitDialog />
</template>

<script setup>
import SideNav from "@/components/SideNav.vue";
import MobileBottomNav from "@/components/MobileBottomNav.vue";
import MobileSideNav from "@/components/MobileSideNav.vue";
import { useDevice } from "@/composables/useDevice";
import { useNavDrawer } from "@/composables/useNavDrawer";
import { useAuthStore } from "@/stores/auth";
import { useSubscriptionStore } from "@/stores/subscription";
import { onMounted } from "vue";
import { storeToRefs } from "pinia";

const { isMobile, isTablet } = useDevice();
const { drawerOpen, moreOpen } = useNavDrawer();
const Auth = useAuthStore();
const { userInfo } = storeToRefs(Auth);

await useAsyncData("initializeUser", () => Auth.fetchMe());

// Plan limits + usage for every screen (Add buttons, usage labels, banner).
const subscription = useSubscriptionStore();
onMounted(() => {
    if (!subscription.status) subscription.fetchStatus();
});
</script>

<style scoped>
.mobile-bar {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid #EEE9F7;
}
</style>
