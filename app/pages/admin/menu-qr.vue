<template>
  <v-container v-if="!isMobile" fluid>
    <MenuQrManagement />
  </v-container>
  <MenuQrManagementMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
  layout: "sidenav",
})
</script>
