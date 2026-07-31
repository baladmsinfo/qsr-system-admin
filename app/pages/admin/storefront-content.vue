<template>
  <v-container v-if="!isMobile" fluid>
    <StorefrontContentSetup />
  </v-container>
  <StorefrontContentSetupMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
