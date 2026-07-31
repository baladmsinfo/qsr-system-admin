<template>
  <v-container v-if="!isMobile" fluid>
    <BranchManagement />
  </v-container>
  <BranchManagementMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
