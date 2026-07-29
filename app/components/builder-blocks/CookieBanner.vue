<script setup>
import { ref, onMounted } from "vue";

// Closes the COOKIE_BANNER GlobalComponentKey gap (see AnnouncementBar.vue's
// comment - same enum, same prior gap). Accept-state persists via
// localStorage - a cookie banner with no memory of being accepted isn't
// really a cookie banner, so unlike AnnouncementBar this one's interactivity
// isn't optional.
const STORAGE_KEY = "wb-cookie-consent-accepted";

defineProps({
  message: { type: String, default: "We use cookies to improve your experience on this site." },
  acceptLabel: { type: String, default: "Accept" },
});

const accepted = ref(false); // corrected immediately on mount against localStorage - defaulting to "not accepted" is the safe direction if that check is ever delayed
onMounted(() => {
  accepted.value = typeof window !== "undefined" && window.localStorage?.getItem(STORAGE_KEY) === "1";
});

function accept() {
  accepted.value = true;
  if (typeof window !== "undefined") window.localStorage?.setItem(STORAGE_KEY, "1");
}
</script>

<template>
  <div
    v-if="!accepted"
    class="tw-fixed tw-bottom-0 tw-inset-x-0 tw-z-40 tw-bg-slate-900 tw-text-white tw-p-4 tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-center tw-gap-4 tw-text-sm"
  >
    <span>{{ message }}</span>
    <button
      type="button"
      class="tw-rounded-full tw-bg-[var(--theme-primary,#6D28D9)] tw-px-4 tw-py-1.5 tw-font-medium tw-whitespace-nowrap"
      @click="accept"
    >
      {{ acceptLabel }}
    </button>
  </div>
</template>
