<template>
  <div class="mobile-loading">
    <v-skeleton-loader v-for="n in count" :key="n" :type="type" class="mb-3 mobile-loading-item" />
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 3 },
  type: { type: String, default: "list-item-two-line" }, // or "card"
});
</script>

<style scoped>
.mobile-loading {
  padding: 16px;
}

.mobile-loading-item :deep(.v-skeleton-loader__list-item-two-line),
.mobile-loading-item :deep(.v-skeleton-loader__card) {
  border-radius: 16px;
}
</style>
