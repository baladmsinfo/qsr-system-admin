<template>
  <v-container v-if="!isMobile" fluid>
    <Expense />
  </v-container>
  <ExpenseMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
