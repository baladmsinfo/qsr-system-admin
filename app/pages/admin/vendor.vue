<template>
  <v-container v-if="!isMobile" fluid>
    <Vendor />
  </v-container>
  <VendorMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
