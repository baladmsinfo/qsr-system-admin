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
  background: #fff;
  border-top: 1px solid #EEE9F7;
}
</style>
