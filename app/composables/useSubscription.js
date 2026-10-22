import { computed } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription'
import { useAuthStore } from '@/stores/auth'

/**
 * Subscription-aware helpers for screens that create limited resources
 * (BRANCHES, STAFF_USERS, MENU_ITEMS, TABLES, ORDERS).
 *
 * These only improve the experience - the backend refuses over-limit
 * creates regardless. When status hasn't loaded (or failed to), nothing is
 * blocked here and the backend's answer decides.
 */
export function useSubscription() {
  const store = useSubscriptionStore()
  const auth = useAuthStore()

  const isOwner = computed(() => auth.role === 'SUPERADMIN')

  function resource(key) {
    return store.resource(key)
  }

  function canCreate(key) {
    const r = resource(key)
    return !r || !r.reached
  }

  /** "3 of 5 used" style label, or null when unlimited / unknown. */
  function usageLabel(key) {
    const r = resource(key)
    if (!r || r.limit === null) return null
    return `${r.used} of ${r.limit} ${r.label} used`
  }

  function promptFor(key) {
    const r = resource(key)
    store.showLimitPrompt({
      resource: key,
      label: r?.label,
      limit: r?.limit,
      used: r?.used,
      mode: store.status?.mode,
      plan: store.status?.subscription?.planName || null,
    })
  }

  /** Runs `action` unless the limit for `key` is already reached. */
  function guard(key, action) {
    if (canCreate(key)) return action()
    promptFor(key)
  }

  return { store, isOwner, resource, canCreate, usageLabel, guard, promptFor, refresh: () => store.fetchStatus() }
}
