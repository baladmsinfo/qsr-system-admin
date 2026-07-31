<template>
  <div class="mobile-order-card" :class="{ 'mobile-order-card--accent': accent }">
    <div class="d-flex align-center justify-space-between ga-2 mb-2">
      <div class="d-flex align-center ga-2" style="min-width: 0">
        <span class="text-subtitle-2 font-weight-bold text-truncate">{{ title }}</span>
        <span v-if="subtitle" class="text-caption text-medium-emphasis text-truncate">{{ subtitle }}</span>
      </div>
      <slot name="status" />
    </div>

    <div v-if="$slots.default" class="mobile-order-card-body mb-2">
      <slot />
    </div>

    <div class="d-flex align-center justify-space-between ga-2">
      <span v-if="meta" class="text-caption text-medium-emphasis">{{ meta }}</span>
      <div v-if="$slots.actions" class="d-flex ga-2 flex-grow-1 justify-end">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  meta: { type: String, default: "" },
  accent: { type: Boolean, default: false },
});
</script>

<style scoped>
.mobile-order-card {
  background: #fff;
  border: 1px solid #EEE9F7;
  border-radius: 18px;
  box-shadow: 0 6px 18px -10px rgba(124, 58, 237, 0.14);
  padding: 14px;
  transition: box-shadow 0.2s ease;
}

.mobile-order-card--accent {
  border-color: #F3C6C6;
  background: #FFF8F8;
}

.mobile-order-card-body {
  font-size: 0.8125rem;
  color: #5B5566;
}
</style>
