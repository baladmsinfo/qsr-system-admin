<template>
  <v-container v-if="!isMobile" fluid>
    <Purchases />
  </v-container>
  <PurchasesMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
  layout: "sidenav",
})
</script>
