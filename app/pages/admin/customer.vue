<template>
  <v-container v-if="!isMobile" fluid>
    <Customer />
  </v-container>
  <CustomerMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
