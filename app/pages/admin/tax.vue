<template>
  <v-container v-if="!isMobile" fluid>
    <Taxes />
  </v-container>
  <TaxesMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
