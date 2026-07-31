<template>
  <v-container v-if="!isMobile" fluid>
    <Profitandloss />
  </v-container>
  <ProfitandlossMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
