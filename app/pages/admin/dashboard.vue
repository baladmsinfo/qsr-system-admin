<template>
  <v-container v-if="!isMobile" fluid>
    <RestaurantDashboard />
  </v-container>
  <RestaurantDashboardMobile v-else />
</template>

<script setup>

import { useAuthStore } from '@/stores/auth'
import { useDevice } from '@/composables/useDevice'
const auth = useAuthStore()
const { isMobile } = useDevice()

definePageMeta({
    layout: "sidenav",
})

onMounted(async () => {
  await auth.fetchMe()
})

</script>
