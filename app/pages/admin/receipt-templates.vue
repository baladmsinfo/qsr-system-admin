<template>
  <v-container v-if="!isMobile" fluid>
    <ReceiptTemplateSettings />
  </v-container>
  <ReceiptTemplateSettingsMobile v-else />
</template>

<script setup>
import { useDevice } from '@/composables/useDevice'
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})
</script>
