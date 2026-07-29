<script setup>
import { blockBackgroundStyle } from "./blockStyle";
import Newsletter from "./Newsletter.vue";

// `variant` toggles optional sub-sections rather than being separate block
// types (matches the existing Cta block's `background: select` precedent) -
// "Map" reuses the same `mapEmbedUrl` prop name the Contact/Map blocks
// already use, "Newsletter" embeds the real Newsletter block's own markup
// instead of duplicating its form.
const props = defineProps({
  logoText: { type: String, default: "" },
  tagline: { type: String, default: "" },
  links: { type: Array, default: () => [] },
  socialLinks: { type: Array, default: () => [] },
  copyrightText: { type: String, default: "" },
  variant: { type: String, default: "simple" }, // simple | corporate | map | newsletter
  mapEmbedUrl: { type: String, default: "" },
  newsletterTitle: { type: String, default: "Stay in the loop" },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <div>
    <Newsletter v-if="variant === 'newsletter'" :title="newsletterTitle" cta-label="Subscribe" placeholder="Enter your email" />
    <footer
      class="tw-bg-slate-900 tw-text-slate-300 tw-py-12"
      :class="variant === 'corporate' ? 'tw-border-t-4 tw-border-[var(--theme-primary,#6D28D9)]' : ''"
      :style="blockBackgroundStyle(props)"
    >
      <div class="tw-mx-auto tw-max-w-6xl tw-px-6 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-gap-8">
        <div>
          <p class="tw-font-bold tw-text-white tw-text-lg">{{ logoText }}</p>
          <p v-if="tagline" class="tw-mt-1 tw-text-sm tw-text-slate-400">{{ tagline }}</p>
          <div v-if="socialLinks.length" class="tw-mt-4 tw-flex tw-gap-3">
            <a v-for="(s, i) in socialLinks" :key="i" :href="s.href" class="tw-text-slate-400 hover:tw-text-white">
              <i :class="s.icon" class="tw-text-lg" />
            </a>
          </div>
        </div>

        <div v-if="variant === 'map' && mapEmbedUrl" class="tw-aspect-video tw-w-full md:tw-w-80 tw-rounded-xl tw-overflow-hidden">
          <iframe :src="mapEmbedUrl" class="tw-h-full tw-w-full tw-border-0" loading="lazy" />
        </div>

        <nav class="tw-flex tw-flex-wrap tw-gap-x-6 tw-gap-y-2">
          <a v-for="(link, i) in links" :key="i" :href="link.href" class="tw-text-sm hover:tw-text-white">{{ link.label }}</a>
        </nav>
      </div>
      <div class="tw-mx-auto tw-max-w-6xl tw-px-6 tw-mt-8 tw-pt-6 tw-border-t tw-border-slate-800 tw-text-xs tw-text-slate-500">
        {{ copyrightText }}
      </div>
    </footer>
  </div>
</template>
