<template>
  <v-container v-if="!isMobile" fluid>
    <ChartsOfAccounts />
  </v-container>
  <ChartsOfAccountsMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
