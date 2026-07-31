<template>
  <div class="mobile-action-bar">
    <slot />
  </div>
</template>

<script setup>
</script>

<style scoped>
.mobile-action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--mobile-bottom-nav-height, 64px);
  z-index: 1000;
  padding: 12px 16px;
  background: linear-gradient(to top, #fff 60%, rgba(255, 255, 255, 0));
}
</style>
