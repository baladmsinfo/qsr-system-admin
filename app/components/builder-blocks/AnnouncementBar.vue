<script setup>
import { ref, onMounted, computed } from "vue";

// Closes the ANNOUNCEMENT_BAR GlobalComponentKey gap (the enum value already
// existed with no block type mapped to it - see registry.js/PropertiesPanel.vue).
// Dismiss is real (localStorage, keyed by message text so a NEW announcement
// re-shows even if a stale dismissal is cached) but entirely optional per the
// `dismissible` prop - defaults to always-visible, which needs zero client JS,
// same as every other block.
const props = defineProps({
  message: { type: String, default: "" },
  linkLabel: { type: String, default: "" },
  linkUrl: { type: String, default: "#" },
  dismissible: { type: [Boolean, String], default: false },
  bgColor: { type: String, default: "" },
});

const storageKey = computed(() => `wb-announcement-dismissed:${props.message}`);
const dismissed = ref(false);

onMounted(() => {
  if (props.dismissible === true || props.dismissible === "true") {
    dismissed.value = typeof window !== "undefined" && window.localStorage?.getItem(storageKey.value) === "1";
  }
});

function dismiss() {
  dismissed.value = true;
  if (typeof window !== "undefined") window.localStorage?.setItem(storageKey.value, "1");
}
</script>

<template>
  <div
    v-if="!dismissed && message"
    class="tw-w-full tw-py-2 tw-px-4 tw-text-center tw-text-sm tw-text-white tw-flex tw-items-center tw-justify-center tw-gap-3"
    :style="{ backgroundColor: bgColor || 'var(--theme-primary,#6D28D9)' }"
  >
    <span>{{ message }}</span>
    <a v-if="linkLabel" :href="linkUrl" class="tw-underline tw-font-medium">{{ linkLabel }}</a>
    <button v-if="dismissible === true || dismissible === 'true'" type="button" class="tw-ml-2 tw-opacity-80 hover:tw-opacity-100" @click="dismiss">
      <i class="mdi mdi-close" />
    </button>
  </div>
</template>
