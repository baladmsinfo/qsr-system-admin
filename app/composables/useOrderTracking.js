// Canvas-preview-only mock - same reasoning as this app's other composables
// in this file group. Shows a plausible in-progress status so an editor can
// see the status-stepper layout while designing the page.
export function useOrderTracking() {
  async function fetchOrder(id) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { id, status: "PREPARING" };
  }
  return { fetchOrder };
}
