<template>
  <v-menu>
    <template #activator="scope">
      <slot name="activator" v-bind="scope" />
    </template>
    <div class="action-menu-panel">
      <template v-for="(action, idx) in actions" :key="idx">
        <v-divider v-if="action.dividerBefore" class="action-menu-divider" />
        <div class="action-menu-item" :class="{ 'action-menu-item--danger': action.danger }" @click="action.onClick && action.onClick()">
          <div class="action-menu-icon" :style="{ background: action.color }">
            <v-icon size="16" color="white">{{ action.icon }}</v-icon>
          </div>
          <span class="action-menu-label">{{ action.label }}</span>
        </div>
      </template>
    </div>
  </v-menu>
</template>

<script setup>
// actions: [{ icon, color, label, onClick, dividerBefore, danger }]
defineProps({
  actions: { type: Array, required: true },
})
</script>

<style scoped>
.action-menu-panel {
  min-width: 220px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  padding: 6px;
}
.action-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.action-menu-item:hover {
  background: #FAF8FF;
}
.action-menu-item--danger:hover {
  background: #FEF2F2;
}
.action-menu-item--danger .action-menu-label {
  color: #DC2626;
  font-weight: 600;
}
.action-menu-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.action-menu-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1F1B2E;
}
.action-menu-divider {
  margin: 4px 6px;
}
</style>
