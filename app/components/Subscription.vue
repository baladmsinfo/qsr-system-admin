<template>
  <div>
    <!-- Mobile: header flush to the top edge, no surrounding gap -->
    <MobilePageHeader v-if="isMobile" title="Subscription" subtitle="Your plan, usage and upgrades" />
    <div v-else class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Subscription</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Your plan, usage and upgrades</p>
      </div>
      <v-btn variant="text" prepend-icon="mdi-refresh" :loading="store.statusLoading" @click="refreshAll">Refresh</v-btn>
    </div>

    <div :class="{ 'sub-mobile-body': isMobile }">
    <!-- Current status -->
    <div class="app-card" :class="isMobile ? 'pa-3 mb-4' : 'pa-5 mb-6'">
      <div v-if="!status && store.statusLoading" class="py-4">
        <v-skeleton-loader type="heading, text" />
      </div>
      <div v-else-if="!status" class="d-flex align-center ga-3">
        <v-icon color="error">mdi-alert-circle-outline</v-icon>
        <span class="text-body-2">{{ store.statusError || 'Could not load your subscription' }}</span>
        <v-spacer />
        <v-btn size="small" variant="tonal" @click="store.fetchStatus()">Retry</v-btn>
      </div>
      <template v-else>
        <div class="d-flex align-center ga-3" :class="isMobile ? 'mb-3' : 'mb-4'">
          <div class="status-icon d-flex align-center justify-center"
            :class="[paid ? 'status-icon--paid' : 'status-icon--trial', { 'status-icon--sm': isMobile }]">
            <v-icon color="white" :size="isMobile ? 18 : 24">{{ paid ? 'mdi-crown-outline' : 'mdi-timer-sand' }}</v-icon>
          </div>
          <div class="flex-grow-1" style="min-width: 0">
            <div class="font-weight-bold text-truncate" :class="isMobile ? 'text-body-1' : 'text-subtitle-1'">
              {{ paid ? status.subscription.planName : 'Free trial' }}
            </div>
            <div class="text-medium-emphasis" :class="isMobile ? 'text-caption' : 'text-body-2'">
              <template v-if="paid">
                {{ intervalText(status.subscription.planInterval) }} plan · renews {{ formatDate(status.subscription.currentPeriodEnd) }}
              </template>
              <template v-else>{{ isMobile ? 'Subscribe to remove the limits' : 'Limited usage - subscribe to remove the limits below' }}</template>
            </div>
          </div>
          <v-chip :color="paid ? 'success' : 'warning'" variant="tonal" class="font-weight-bold flex-shrink-0"
            :size="isMobile ? 'small' : 'default'">{{ paid ? 'Active' : 'Trial' }}</v-chip>
        </div>

        <v-alert v-if="status.inGrace" type="warning" variant="tonal" density="compact" class="mb-4">
          We couldn't confirm your renewal yet. Your plan stays active for a few days while we retry.
        </v-alert>
        <v-alert v-if="status.pending" type="info" variant="tonal" density="compact" class="mb-4">
          <div class="d-flex flex-wrap align-center ga-2">
            <span class="flex-grow-1">A payment for <strong>{{ status.pending.planName }}</strong> is being confirmed.</span>
            <v-btn v-if="isOwner" size="small" variant="tonal" :loading="verifying" @click="recheck(status.pending.id)">Check status</v-btn>
          </div>
        </v-alert>

        <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis" :class="isMobile ? 'mb-2' : 'mb-3'" style="letter-spacing: 0.04em">Usage</div>
        <!-- Two compact tiles per row on phones so usage doesn't fill the screen -->
        <v-row dense>
          <v-col v-for="r in status.resources" :key="r.key" cols="6" md="4">
            <div class="usage-tile" :class="isMobile ? 'usage-tile--sm' : 'pa-3'">
              <div class="d-flex justify-space-between align-center ga-1" :class="isMobile ? 'mb-1' : 'mb-2'">
                <span class="font-weight-medium text-capitalize text-truncate" :class="isMobile ? 'text-caption' : 'text-body-2'">{{ r.label }}</span>
                <span class="mono-data flex-shrink-0" :class="[isMobile ? 'text-caption' : 'text-body-2', { 'text-error font-weight-bold': r.reached }]">
                  {{ r.used }}{{ r.limit === null ? '' : `/${r.limit}` }}
                </span>
              </div>
              <v-progress-linear v-if="r.limit !== null" :model-value="pct(r)" :color="r.reached ? 'error' : pct(r) >= 80 ? 'warning' : 'primary'" rounded :height="isMobile ? 4 : 6" />
              <div v-else class="text-caption text-success">Unlimited</div>
            </div>
          </v-col>
        </v-row>
      </template>
    </div>

    <!-- Plans -->
    <div class="d-flex align-center justify-space-between mb-3">
      <h2 class="font-weight-bold mb-0" :class="isMobile ? 'text-subtitle-1' : 'text-h6'">{{ paid ? 'Change plan' : 'Choose a plan' }}</h2>
    </div>

    <div v-if="!isOwner" class="app-card pa-6 text-center text-medium-emphasis">
      Only the business owner can manage the subscription.
    </div>
    <div v-else-if="status && !status.configured" class="app-card pa-6 text-center text-medium-emphasis">
      Online subscriptions aren't set up on this server yet. Please contact support.
    </div>
    <v-row v-else-if="store.plansLoading" dense>
      <v-col v-for="i in 3" :key="i" cols="12" md="4"><SubscriptionPlanSkeleton /></v-col>
    </v-row>
    <div v-else-if="store.plansError" class="app-card pa-8 text-center">
      <v-icon size="40" color="error" class="mb-3">mdi-alert-circle-outline</v-icon>
      <div class="text-subtitle-1 font-weight-bold mb-1">Unable to load subscription plans</div>
      <div class="text-body-2 text-medium-emphasis mb-4">{{ store.plansError }}</div>
      <v-btn color="primary" @click="store.fetchPlans()">Retry</v-btn>
    </div>
    <div v-else-if="!store.plans.length" class="app-card pa-8 text-center text-medium-emphasis">
      No subscription plans are available right now.
      <div class="mt-3"><v-btn variant="tonal" @click="store.fetchPlans()">Retry</v-btn></div>
    </div>
    <v-row v-else dense align="stretch">
      <v-col v-for="plan in store.plans" :key="plan.id" cols="12" sm="6" lg="4">
        <SubscriptionPlanCard :plan="plan" :current="paid && status.subscription.planId === plan.id"
          :loading="payingPlanId === plan.id" :disabled="Boolean(payingPlanId)" @subscribe="subscribe" />
      </v-col>
    </v-row>

    <!-- Checkout result -->
    <v-dialog v-model="result.show" max-width="440">
      <div class="app-card pa-6 text-center">
        <v-icon size="64" :color="resultMeta.color" class="mb-3">{{ resultMeta.icon }}</v-icon>
        <h3 class="text-h6 font-weight-bold mb-2">{{ resultMeta.title }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-5">{{ result.message }}</p>
        <v-btn color="primary" block @click="result.show = false">{{ result.kind === 'ACTIVE' ? 'Continue' : 'Close' }}</v-btn>
      </div>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" color="error" :timeout="5000">{{ snackbar.message }}</v-snackbar>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription'
import { useAuthStore } from '@/stores/auth'
import { useWorldlineCheckout } from '@/composables/useWorldlineCheckout'
import { useDevice } from '@/composables/useDevice'

const store = useSubscriptionStore()
const auth = useAuthStore()
const checkout = useWorldlineCheckout()
const { isMobile } = useDevice()

const isOwner = computed(() => auth.role === 'SUPERADMIN')
const status = computed(() => store.status)
const paid = computed(() => status.value?.mode === 'PAID' && status.value?.subscription)

const payingPlanId = ref(null)
const verifying = ref(false)
const result = ref({ show: false, kind: '', message: '' })
const snackbar = ref({ show: false, message: '' })

const resultMeta = computed(() => ({
  ACTIVE: { icon: 'mdi-check-circle', color: 'success', title: 'Subscription active' },
  PENDING: { icon: 'mdi-clock-outline', color: 'info', title: 'Payment being confirmed' },
  FAILED: { icon: 'mdi-close-circle', color: 'error', title: 'Payment not completed' },
}[result.value.kind] || { icon: 'mdi-information-outline', color: 'primary', title: '' }))

function pct(r) {
  return r.limit ? Math.min(100, Math.round((r.used / r.limit) * 100)) : 0
}
function intervalText(i) {
  return i === 'yearly' ? 'Yearly' : 'Monthly'
}
function formatDate(d) {
  return d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
}

function showResult(verdict, submitted) {
  if (verdict.result === 'ACTIVE') {
    result.value = { show: true, kind: 'ACTIVE', message: 'Thank you! Your plan is active and the trial limits have been removed.' }
  } else if (verdict.result === 'PENDING') {
    result.value = {
      show: true,
      kind: 'PENDING',
      message: submitted
        ? 'Your bank is still confirming the mandate. This can take a few minutes - your plan activates automatically once it is confirmed.'
        : 'The payment window was closed before the payment finished. You can try again any time.',
    }
  } else {
    result.value = { show: true, kind: 'FAILED', message: verdict.reason || 'The payment could not be completed. No plan was activated.' }
  }
}

// Initiate -> open Worldline -> always ask the backend to verify. The
// checkout window's own answer is only used to word the message.
async function subscribe(plan) {
  if (payingPlanId.value) return
  payingPlanId.value = plan.id
  try {
    const { subscription, checkout: payload } = await store.initiate(plan.id)
    let outcome = { submitted: false }
    try {
      outcome = await checkout.open(payload)
    } catch (err) {
      snackbar.value = { show: true, message: err.message }
    }
    verifying.value = true
    const verdict = await store.verify(subscription.id)
    showResult(verdict, outcome.submitted)
  } catch (err) {
    snackbar.value = { show: true, message: err.message }
  } finally {
    payingPlanId.value = null
    verifying.value = false
  }
}

async function recheck(subscriptionId) {
  verifying.value = true
  try {
    const verdict = await store.verify(subscriptionId)
    if (verdict.result !== 'PENDING') showResult(verdict, true)
  } catch (err) {
    snackbar.value = { show: true, message: err.message }
  } finally {
    verifying.value = false
  }
}

async function refreshAll() {
  await Promise.all([store.fetchStatus(), isOwner.value ? store.fetchPlans() : null])
}

onMounted(refreshAll)
</script>

<style scoped>
.status-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
}
.status-icon--paid {
  background: #7C3AED;
}
.status-icon--trial {
  background: #F59E0B;
}
.status-icon--sm {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}
/* Phone body: side gutters, and enough bottom room that the last plan card
   scrolls fully clear of the fixed bottom nav bar. */
.sub-mobile-body {
  padding: 12px 12px calc(var(--mobile-bottom-nav-height, 64px) + env(safe-area-inset-bottom, 0px) + 24px);
}
.usage-tile--sm {
  padding: 8px 10px;
  border-radius: 10px;
}
.usage-tile {
  background: #FAF8FF;
  border: 1px solid #EEE9F7;
  border-radius: 12px;
}
</style>
