<template>
  <v-container v-if="!isMobile" fluid>
    <Journals />
  </v-container>
  <JournalsMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

</script>
