<template>
    <v-app-bar v-if="mobile" flat class="mobile-bar" height="56">
        <v-btn icon="mdi-menu" variant="text" @click="drawerOpen = !drawerOpen" />
        <span class="text-subtitle-1 font-weight-bold">Bucksbox</span>
    </v-app-bar>
    <SideNav />
    <v-main>
        <slot />
    </v-main>
</template>

<script setup>
import SideNav from "@/components/SideNav.vue";
import { useDisplay } from "vuetify";
import { useNavDrawer } from "@/composables/useNavDrawer";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const { mobile } = useDisplay();
const { drawerOpen } = useNavDrawer();
const Auth = useAuthStore();
const { userInfo } = storeToRefs(Auth);

await useAsyncData("initializeUser", () => Auth.fetchMe());
</script>

<style scoped>
.mobile-bar {
    background: #fff !important;
    border-bottom: 1px solid #EAE6F2;
}
</style>
