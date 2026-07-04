import { ref } from "vue";

// Shared across SideNav.vue (the drawer itself) and the mobile top bar
// in layouts/sidenav.vue (the hamburger toggle), so both can control
// the same drawer open/closed state.
const drawerOpen = ref(true);

export function useNavDrawer() {
  return { drawerOpen };
}
