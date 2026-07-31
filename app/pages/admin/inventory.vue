<template>
  <v-container v-if="!isMobile" fluid>
    <InventoryManagement />
  </v-container>
  <InventoryManagementMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
  layout: "sidenav",
})
</script>
