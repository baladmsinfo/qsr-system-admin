<template>
    <v-app>
        <SideNav />
        <v-main class="pa-0" style="margin-left: 240px;">
            <slot />
        </v-main>
    </v-app>
</template>

<script setup>
import SideNav from "@/components/SideNav.vue";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const Auth = useAuthStore();
const { userInfo } = storeToRefs(Auth);

await useAsyncData("initializeUser", () => Auth.fetchMe());
</script>
