<template>
  <v-container v-if="!isMobile" fluid>
    <LedgerReports />
  </v-container>
  <LedgerReportsMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
