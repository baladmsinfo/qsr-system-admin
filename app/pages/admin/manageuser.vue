<template>
  <v-container v-if="!isMobile" fluid>
    <UsersManagement />
  </v-container>
  <UsersManagementMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
