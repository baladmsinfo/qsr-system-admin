<template>
  <v-container v-if="!isMobile" fluid>
    <Subscription />
  </v-container>
  <Subscription v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
  layout: "sidenav",
})
</script>
