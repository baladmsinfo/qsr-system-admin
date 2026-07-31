<template>
  <v-container v-if="!isMobile" fluid>
    <BannerSetup />
  </v-container>
  <BannerSetupMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
