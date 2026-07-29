<script setup>
// `currentLabel` is auto-injected with the current page's own title at
// render time (grapesEditor.js/DynamicRenderer.vue/staticSiteGenerator.js
// all inject it the same way, right alongside where GlobalComponentRef/theme
// get resolved) whenever it's left blank - no per-page manual entry needed,
// matching "derived from the current page, no data source needed". Still
// overridable by typing a value in the Properties panel, same as any prop.
defineProps({
  homeLabel: { type: String, default: "Home" },
  homeHref: { type: String, default: "/" },
  currentLabel: { type: String, default: "" },
});
</script>

<template>
  <nav v-if="currentLabel" class="tw-bg-slate-50 dark:tw-bg-slate-950 tw-py-3 tw-text-sm">
    <div class="tw-mx-auto tw-max-w-6xl tw-px-6 tw-flex tw-items-center tw-gap-2 tw-text-slate-500 dark:tw-text-slate-400">
      <a :href="homeHref" class="hover:tw-text-[var(--theme-primary,#6D28D9)]">{{ homeLabel }}</a>
      <i class="mdi mdi-chevron-right tw-text-xs" />
      <span class="tw-text-slate-900 dark:tw-text-white tw-font-medium">{{ currentLabel }}</span>
    </div>
  </nav>
</template>
