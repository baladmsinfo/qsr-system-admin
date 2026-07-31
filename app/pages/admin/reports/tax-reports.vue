<template>
  <v-container v-if="!isMobile" fluid>
    <TaxReports />
  </v-container>
  <TaxReportsMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
