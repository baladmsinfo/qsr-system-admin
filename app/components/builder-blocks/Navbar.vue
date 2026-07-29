<script setup>
import { blockBackgroundStyle } from "./blockStyle";

// `links` items may carry `children` (and grandchildren) - the `Navigation`
// Prisma model already stores a 3-level tree with resolved labels/hrefs
// (see routes/builder.js's withResolvedLabels), but until now nothing
// actually rendered past the first level, and there was no mobile menu at
// all (`md:tw-flex` just hid every link with nothing else shown below that
// breakpoint). This is the fix: real dropdown/mega-menu for children, and a
// `<details>`-based mobile menu (same native, JS-free toggle pattern the FAQ
// block already uses) instead of nothing.
//
// `sticky`/`transparent` come from the real `Navigation.sticky`/`transparent`
// fields when this is the HEADER global component (see grapesEditor.js/
// DynamicRenderer.vue's HEADER merge). `showSearch`/`showSocial` are also
// real Navigation fields but intentionally NOT rendered here - there's no
// search index or social-links data source to back them yet (documented gap,
// not faked).
const props = defineProps({
  logoText: { type: String, default: "" },
  logoImageUrl: { type: String, default: "" },
  links: { type: Array, default: () => [] },
  ctaLabel: { type: String, default: "" },
  ctaLink: { type: String, default: "#" },
  style: { type: String, default: "horizontal" }, // horizontal | vertical | mega (vertical currently renders as horizontal - see code comment above)
  sticky: { type: Boolean, default: true },
  transparent: { type: Boolean, default: false },
  variant: { type: String, default: "default" }, // default | corporate | minimal | center-logo | split-menu | transparent-hero
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <header
    class="tw-z-20 tw-backdrop-blur"
    :class="[
      sticky ? 'tw-sticky tw-top-0' : 'tw-relative',
      variant === 'transparent-hero' || transparent ? 'tw-bg-transparent tw-border-transparent' : 'tw-bg-white/90 dark:tw-bg-slate-900/90 tw-border-slate-100 dark:tw-border-slate-800',
      variant === 'corporate' ? 'tw-border-b-2 tw-shadow-sm' : 'tw-border-b',
    ]"
    :style="blockBackgroundStyle(props)"
  >
    <div
      class="tw-mx-auto tw-max-w-6xl tw-px-6 tw-flex tw-items-center tw-justify-between"
      :class="[variant === 'center-logo' ? 'tw-relative' : '', variant === 'minimal' ? 'tw-h-12' : 'tw-h-16']"
    >
      <div
        class="tw-flex tw-items-center tw-gap-2"
        :class="variant === 'center-logo' ? 'tw-absolute tw-left-1/2 -tw-translate-x-1/2' : ''"
      >
        <img v-if="logoImageUrl && variant !== 'minimal'" :src="logoImageUrl" alt="" class="tw-h-8 tw-w-8 tw-rounded tw-object-cover" />
        <span class="tw-font-bold tw-text-slate-900 dark:tw-text-white" :class="variant === 'minimal' ? 'tw-text-base' : 'tw-text-lg'">{{ logoText }}</span>
      </div>

      <nav class="tw-hidden md:tw-flex tw-items-center tw-gap-8">
        <div v-for="(link, i) in links" :key="i" class="tw-group tw-relative">
          <a
            :href="link.href"
            class="tw-text-sm tw-font-medium tw-text-slate-600 dark:tw-text-slate-300 hover:tw-text-[var(--theme-primary,#6D28D9)] tw-flex tw-items-center tw-gap-1"
          >
            {{ link.label }}
            <i v-if="link.children?.length" class="mdi mdi-chevron-down tw-text-xs" />
          </a>

          <!-- Dropdown / mega-menu panel: hover-triggered via CSS (:group-hover),
               no client JS needed - same reasoning as the FAQ block's native
               <details>, just the hover-menu equivalent. -->
          <div
            v-if="link.children?.length"
            class="tw-invisible tw-opacity-0 group-hover:tw-visible group-hover:tw-opacity-100 tw-transition tw-absolute tw-top-full tw-pt-2 tw-z-30"
            :class="style === 'mega' ? 'tw-left-1/2 -tw-translate-x-1/2 tw-w-[36rem]' : 'tw-left-0 tw-w-56'"
          >
            <div class="tw-rounded-xl tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-100 dark:tw-border-slate-800 tw-shadow-lg tw-p-4">
              <div :class="style === 'mega' ? 'tw-grid tw-grid-cols-2 tw-gap-2' : 'tw-space-y-1'">
                <div v-for="(child, ci) in link.children" :key="ci">
                  <a
                    :href="child.href"
                    class="tw-block tw-rounded-md tw-px-2 tw-py-1.5 tw-text-sm tw-text-slate-700 dark:tw-text-slate-200 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800"
                  >
                    {{ child.label }}
                  </a>
                  <div v-if="child.children?.length" class="tw-ml-3 tw-mt-1 tw-space-y-1 tw-border-l tw-border-slate-100 dark:tw-border-slate-800 tw-pl-2">
                    <a
                      v-for="(grandchild, gi) in child.children"
                      :key="gi"
                      :href="grandchild.href"
                      class="tw-block tw-text-xs tw-text-slate-500 dark:tw-text-slate-400 hover:tw-text-[var(--theme-primary,#6D28D9)] tw-py-1"
                    >
                      {{ grandchild.label }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <a
        v-if="ctaLabel && variant !== 'minimal'"
        :href="ctaLink"
        class="tw-hidden md:tw-inline-flex tw-rounded-full tw-bg-[var(--theme-primary,#6D28D9)] tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-white hover:tw-bg-[var(--theme-primary-hover,#5b21b6)] tw-transition"
      >
        {{ ctaLabel }}
      </a>

      <!-- Mobile menu: native <details>/<summary> toggle, zero client JS -
           nested items get free native accordion behavior from nested
           <details>. This is the actual functional gap being fixed: before,
           links simply vanished below the md breakpoint with no substitute. -->
      <details class="md:tw-hidden tw-relative">
        <summary class="tw-list-none tw-cursor-pointer tw-h-9 tw-w-9 tw-flex tw-items-center tw-justify-center tw-text-slate-700 dark:tw-text-slate-200">
          <i class="mdi mdi-menu tw-text-2xl" />
        </summary>
        <div class="tw-absolute tw-right-0 tw-top-full tw-mt-2 tw-w-64 tw-rounded-xl tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-100 dark:tw-border-slate-800 tw-shadow-lg tw-p-3 tw-space-y-1">
          <div v-for="(link, i) in links" :key="i">
            <a v-if="!link.children?.length" :href="link.href" class="tw-block tw-rounded-md tw-px-3 tw-py-2 tw-text-sm tw-text-slate-700 dark:tw-text-slate-200 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800">
              {{ link.label }}
            </a>
            <details v-else class="tw-rounded-md">
              <summary class="tw-list-none tw-cursor-pointer tw-flex tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-text-sm tw-text-slate-700 dark:tw-text-slate-200 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800">
                {{ link.label }}<i class="mdi mdi-chevron-down tw-text-xs" />
              </summary>
              <div class="tw-pl-4 tw-space-y-1">
                <a v-for="(child, ci) in link.children" :key="ci" :href="child.href" class="tw-block tw-rounded-md tw-px-3 tw-py-1.5 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800">
                  {{ child.label }}
                </a>
              </div>
            </details>
          </div>
          <a v-if="ctaLabel" :href="ctaLink" class="tw-block tw-mt-2 tw-rounded-full tw-bg-[var(--theme-primary,#6D28D9)] tw-px-3 tw-py-2 tw-text-center tw-text-sm tw-font-medium tw-text-white">
            {{ ctaLabel }}
          </a>
        </div>
      </details>
    </div>
  </header>
</template>
