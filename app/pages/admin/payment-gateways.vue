<template>
  <v-container v-if="!isMobile" fluid>
    <PaymentGatewaySettings />
  </v-container>
  <PaymentGatewaySettingsMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})
</script>
