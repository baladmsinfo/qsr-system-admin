<template>
    <v-app>
        <v-main class="pa-0">
            <slot />
        </v-main>
    </v-app>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const Auth = useAuthStore();

await useAsyncData("initializeUser", () => Auth.fetchMe());
</script>
