<template>
  <v-container v-if="!isMobile" fluid>
    <PrinterSettings />
  </v-container>
  <PrinterSettingsMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})
</script>
