<template>
  <v-bottom-sheet :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
    :max-width="560" content-class="mobile-bottom-sheet-content">
    <div class="mobile-bottom-sheet" :style="{ maxHeight: maxHeight }">
      <div class="mobile-bottom-sheet-handle" />
      <div v-if="title" class="d-flex align-center justify-space-between px-5 pt-1 pb-3">
        <span class="text-subtitle-1 font-weight-bold">{{ title }}</span>
        <v-btn icon="mdi-close" variant="text" density="comfortable" @click="$emit('update:modelValue', false)" />
      </div>
      <div class="mobile-bottom-sheet-body px-5 pb-5">
        <slot />
      </div>
    </div>
  </v-bottom-sheet>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "" },
  maxHeight: { type: String, default: "85vh" },
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.mobile-bottom-sheet {
  background: #fff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -12px 32px -12px rgba(124, 58, 237, 0.2);
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.mobile-bottom-sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: #E2DEEC;
  margin: 10px auto 6px;
}
</style>
