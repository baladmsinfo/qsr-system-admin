<template>
  <div class="mobile-stat-card">
    <div class="mobile-stat-label">{{ label }}</div>
    <div class="mobile-stat-value">{{ value }}</div>
    <div v-if="hint" class="mobile-stat-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: "" },
});
</script>

<style scoped>
.mobile-stat-card {
  background: #fff;
  border: 1px solid #EEE9F7;
  border-radius: 18px;
  box-shadow: 0 6px 18px -10px rgba(124, 58, 237, 0.14);
  padding: 14px;
}

.mobile-stat-label {
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8B8599;
  margin-bottom: 6px;
}

.mobile-stat-value {
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #1A1626;
}

.mobile-stat-hint {
  font-size: 11px;
  color: #8B8599;
  margin-top: 2px;
}
</style>
