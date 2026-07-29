<script setup>
// tel: is a real, functional link - no backend needed. Positioned to stack
// above FloatingWhatsApp when both are used (bottom-24 vs bottom-6).
defineProps({
  phone: { type: String, default: "" },
});
</script>

<template>
  <a
    v-if="phone"
    :href="`tel:${phone}`"
    class="tw-fixed tw-bottom-24 tw-right-6 tw-z-40 tw-h-14 tw-w-14 tw-rounded-full tw-bg-[var(--theme-primary,#6D28D9)] tw-text-white tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-text-2xl"
    aria-label="Call us"
  >
    <i class="mdi mdi-phone" />
  </a>
</template>
