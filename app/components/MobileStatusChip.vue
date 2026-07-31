<template>
  <span class="mobile-status-chip" :class="`mobile-status-chip--${size}`" :style="chipStyle">{{ status }}</span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  status: { type: String, required: true },
  color: { type: String, default: "#7C3AED" },
  size: { type: String, default: "default" }, // "default" | "small"
});

const chipStyle = computed(() => ({
  color: props.color,
  background: `${props.color}1A`,
}));
</script>

<style scoped>
.mobile-status-chip {
  display: inline-flex;
  align-items: center;
  font-family: "Hanken Grotesk", sans-serif;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  border-radius: 999px;
  white-space: nowrap;
}

.mobile-status-chip--default {
  font-size: 11px;
  padding: 4px 10px;
}

.mobile-status-chip--small {
  font-size: 10px;
  padding: 2px 8px;
}
</style>
