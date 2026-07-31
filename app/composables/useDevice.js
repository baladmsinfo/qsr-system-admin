import { computed } from "vue";
import { useDisplay } from "vuetify";

// Vuetify's own `mobile` flag (from useDisplay) is true for anything under the
// "lg" breakpoint (1280px) - it really means "tablet-or-phone", and it's what
// SideNav.vue / layouts/sidenav.vue / POSBilling.vue already use for their
// existing drawer/bottom-sheet behavior. The Phase 1 mobile redesign (bottom
// tab nav, fullscreen dialogs, MobileXxx components) targets true phones only,
// so it needs its own narrower `isMobile` pinned to the "xs" breakpoint (600px)
// - the same breakpoint already used by the @media(max-width:600px) rules in
// assets/settings.scss - so JS component-swapping and CSS never disagree about
// where "mobile" starts.
export function useDevice() {
  const display = useDisplay();

  const isMobile = computed(() => display.xs.value);
  const isTablet = computed(() => !display.xs.value && display.mobile.value);
  const isDesktop = computed(() => !display.mobile.value);

  return {
    ...display,
    isMobile,
    isTablet,
    isDesktop,
  };
}
