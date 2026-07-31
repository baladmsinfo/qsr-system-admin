<template>
  <v-container v-if="!isMobile" fluid>
    <KitchenDisplay />
  </v-container>
  <KitchenDisplayMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
  layout: "sidenav",
})
</script>
