<template>
  <div class="mobile-branch-picker">
    <v-btn icon variant="tonal" color="primary" density="comfortable" :title="selectedLabel || 'Select branch'"
      class="mobile-branch-picker-btn" @click="open = true">
      <v-icon size="18">mdi-store-outline</v-icon>
    </v-btn>

    <MobileBottomSheet v-model="open" title="Select Branch">
      <div class="mobile-branch-list">
        <div v-for="item in items" :key="item.value" class="mobile-branch-row"
          :class="{ 'mobile-branch-row--active': item.value === modelValue }" @click="select(item.value)">
          <v-icon size="18" class="me-2">mdi-store-outline</v-icon>
          <span class="flex-grow-1 text-body-2 font-weight-medium text-truncate">{{ item.title }}</span>
          <v-icon v-if="item.value === modelValue" size="18" color="primary">mdi-check-circle</v-icon>
        </div>
        <div v-if="!items.length" class="text-caption text-medium-emphasis text-center py-6">
          No branches available
        </div>
      </div>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number, null], default: null },
  items: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:modelValue"]);

const open = ref(false);

const selectedLabel = computed(() => props.items.find((i) => i.value === props.modelValue)?.title || "");

function select(value) {
  emit("update:modelValue", value);
  open.value = false;
}
</script>

<style scoped>
.mobile-branch-picker-btn {
  flex-shrink: 0;
}

.mobile-branch-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-branch-row {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  color: #5B5566;
  transition: background-color 0.15s ease;
}

.mobile-branch-row:active {
  background: #F8F6FC;
}

.mobile-branch-row--active {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(219, 39, 119, 0.1) 100%);
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
}
</style>
