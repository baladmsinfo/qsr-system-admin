<template>
  <v-container fluid>
    <RestaurantDashboard />
  </v-container>
</template>

<script setup>

import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()

definePageMeta({
    layout: "sidenav",
})

onMounted(async () => {
  await auth.fetchMe()
})

</script>
