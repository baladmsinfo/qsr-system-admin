<template>
  <v-container v-if="!isMobile" fluid>
    <OrdersMonitor />
  </v-container>
  <OrdersMonitorMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
