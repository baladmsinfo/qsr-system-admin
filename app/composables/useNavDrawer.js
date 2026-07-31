import { ref } from "vue";

// Shared across SideNav.vue (the drawer itself) and the mobile top bar
// in layouts/sidenav.vue (the hamburger toggle), so both can control
// the same drawer open/closed state.
const drawerOpen = ref(true);

// Shared across MobileSideNav.vue (the phone drawer) and MobilePageHeader.vue
// (the hamburger button every mobile page renders), so any page's header can
// open the same phone-only nav drawer without a dedicated top app-bar.
const moreOpen = ref(false);

export function useNavDrawer() {
  return { drawerOpen, moreOpen };
}
