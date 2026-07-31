<template>
  <v-container v-if="!isMobile" fluid>
    <TablesManagement />
  </v-container>
  <TablesManagementMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
  layout: "sidenav",
})
</script>
