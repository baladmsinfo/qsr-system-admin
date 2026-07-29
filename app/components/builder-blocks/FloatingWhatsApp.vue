<script setup>
// Fully functional with zero backend - wa.me is WhatsApp's own real deep-link
// format (digits-only phone number, optional prefilled message).
const props = defineProps({
  phone: { type: String, default: "" },
  message: { type: String, default: "" },
});

function href() {
  const digits = (props.phone || "").replace(/[^0-9]/g, "");
  const q = props.message ? `?text=${encodeURIComponent(props.message)}` : "";
  return `https://wa.me/${digits}${q}`;
}
</script>

<template>
  <a
    v-if="phone"
    :href="href()"
    target="_blank"
    rel="noopener"
    class="tw-fixed tw-bottom-6 tw-right-6 tw-z-40 tw-h-14 tw-w-14 tw-rounded-full tw-bg-[#25D366] tw-text-white tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-text-2xl"
    aria-label="Chat on WhatsApp"
  >
    <i class="mdi mdi-whatsapp" />
  </a>
</template>
