<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" fullscreen
    transition="dialog-bottom-transition" content-class="mobile-fullscreen-dialog">
    <v-card class="d-flex flex-column" height="100%">
      <div class="mobile-fullscreen-header d-flex align-center ga-2">
        <v-btn icon="mdi-close" variant="text" density="comfortable" @click="$emit('update:modelValue', false)" />
        <span class="text-subtitle-1 font-weight-bold text-truncate flex-grow-1">{{ title }}</span>
        <v-btn v-if="$slots.action" variant="text" color="primary" class="font-weight-bold" @click="$emit('save')">
          <slot name="action">Save</slot>
        </v-btn>
      </div>
      <div class="mobile-fullscreen-body flex-grow-1 pa-4">
        <slot />
      </div>
      <div v-if="$slots.footer" class="mobile-fullscreen-footer pa-4">
        <slot name="footer" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "" },
});
defineEmits(["update:modelValue", "save"]);
</script>

<style scoped>
.mobile-fullscreen-header {
  padding: 8px 8px 8px 4px;
  border-bottom: 1px solid #EEE9F7;
  flex-shrink: 0;
}

.mobile-fullscreen-body {
  overflow-y: auto;
}

.mobile-fullscreen-footer {
  border-top: 1px solid #EEE9F7;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
}
</style>
