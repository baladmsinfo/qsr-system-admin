<template>
  <div class="mobile-empty-state d-flex flex-column align-center justify-center text-center pa-8">
    <div class="mobile-empty-icon d-flex align-center justify-center mb-4">
      <v-icon :icon="icon" size="30" color="primary" />
    </div>
    <p class="text-subtitle-2 font-weight-bold mb-1">{{ title }}</p>
    <p v-if="description" class="text-caption text-medium-emphasis mb-4" style="max-width: 260px">{{ description }}</p>
    <v-btn v-if="$slots.action" variant="flat" color="primary" class="font-weight-medium">
      <slot name="action" />
    </v-btn>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: "mdi-tray-outline" },
  title: { type: String, required: true },
  description: { type: String, default: "" },
});
</script>

<style scoped>
.mobile-empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #F3EEFF;
}
</style>
