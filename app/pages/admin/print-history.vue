<template>
  <v-container v-if="!isMobile" fluid>
    <PrintHistoryTable />
  </v-container>
  <PrintHistoryTableMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})
</script>
