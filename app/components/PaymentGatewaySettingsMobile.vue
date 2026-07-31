<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Payment Gateways" subtitle="Configure online payment gateways" />

    <div class="pa-4">
      <MobileEmptyState v-if="!store.loading && store.gateways.length === 0" icon="mdi-credit-card-outline"
        title="No payment gateway configured yet"
        description="Online payment won't be offered at checkout until one is active.">
        <template #action>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="pickerOpen = true">Configure Gateway</v-btn>
        </template>
      </MobileEmptyState>

      <div v-for="gw in store.gateways" :key="gw.id" class="app-card pa-4 mb-3">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="font-weight-bold text-body-2">{{ PROVIDER_META[gw.provider]?.label || gw.provider }}</span>
          <v-chip v-if="gw.isActive" color="success" size="small" variant="tonal">Active</v-chip>
          <v-btn v-else size="small" variant="tonal" color="primary" @click="activate(gw.provider)">Set Active</v-btn>
        </div>
        <p class="text-caption text-medium-emphasis mb-1">
          {{ PROVIDER_META[gw.provider]?.keyIdLabel || 'Key ID' }}: <code>{{ gw.keyId }}</code>
        </p>
        <p class="text-caption text-medium-emphasis mb-1">
          Mode: <v-chip size="x-small" :color="gw.mode === 'live' ? 'error' : 'warning'" variant="tonal">{{ gw.mode }}</v-chip>
        </p>
        <p class="text-caption text-medium-emphasis mb-3">Webhook secret {{ gw.hasWebhookSecret ? 'configured' : 'not set' }}</p>
        <div class="d-flex ga-2">
          <v-btn size="small" variant="text" @click="openDialog(gw.provider, gw)">Edit</v-btn>
          <v-btn size="small" variant="text" color="error" @click="remove(gw.provider)">Remove</v-btn>
        </div>
      </div>

      <p class="text-caption text-medium-emphasis mt-2" v-if="store.gateways.length">
        Only one gateway can be active at a time.
      </p>

      <div class="d-flex justify-center mt-2" v-if="store.loading">
        <v-progress-circular indeterminate size="36" />
      </div>
    </div>

    <MobileActionBar v-if="store.gateways.length">
      <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="pickerOpen = true">
        Configure Gateway
      </v-btn>
    </MobileActionBar>

    <!-- PROVIDER PICKER -->
    <MobileBottomSheet v-model="pickerOpen" title="Choose a Provider">
      <div v-for="provider in availableProviders" :key="provider" class="provider-row pa-3 mb-2"
        @click="pickerOpen = false; openDialog(provider)">
        {{ PROVIDER_META[provider].label }}
      </div>
    </MobileBottomSheet>

    <!-- CONFIGURE -->
    <MobileBottomSheet v-model="dialog" :title="form.provider ? `${PROVIDER_META[form.provider].label} Settings` : ''">
      <template v-if="form.provider">
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          {{ PROVIDER_META[form.provider].helpText }}
        </v-alert>
        <v-text-field v-model="form.keyId" :label="PROVIDER_META[form.provider].keyIdLabel" variant="outlined" class="mb-2" />
        <v-text-field v-model="form.keySecret" :label="PROVIDER_META[form.provider].keySecretLabel" variant="outlined"
          type="password" :placeholder="form.hasExisting ? 'Leave blank to keep existing' : ''" class="mb-2" />
        <v-text-field v-model="form.webhookSecret" :label="PROVIDER_META[form.provider].webhookSecretLabel"
          variant="outlined" type="password" class="mb-2" />
        <v-select v-model="form.mode" :items="['test', 'live']" label="Mode" variant="outlined" class="mb-3" />
        <v-btn block size="large" color="primary" class="font-weight-bold" :loading="saving" @click="submit">Save</v-btn>
      </template>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePaymentGatewaysStore } from '@/stores/paymentGateways'

const store = usePaymentGatewaysStore()

const PROVIDER_META = {
  RAZORPAY: {
    label: 'Razorpay', keyIdLabel: 'Key ID', keySecretLabel: 'Key Secret',
    webhookSecretLabel: 'Webhook Secret (optional)',
    helpText: 'From your Razorpay Dashboard → Settings → API Keys. Use Test Mode keys first.',
  },
  CASHFREE: {
    label: 'Cashfree', keyIdLabel: 'Client ID (App ID)', keySecretLabel: 'Client Secret',
    webhookSecretLabel: 'Webhook Secret (optional - defaults to Client Secret)',
    helpText: 'From your Cashfree Merchant Dashboard → Developers → API Keys. Use Test/Sandbox keys first.',
  },
  WORLDLINE: {
    label: 'Worldline', keyIdLabel: 'Merchant ID', keySecretLabel: 'Encryption Key',
    webhookSecretLabel: 'Response Salt (optional - defaults to Encryption Key)',
    helpText: 'From your Worldline merchant welcome kit / integration guide. Worldline is redirect-based - there is no widget, the shopper is sent to a Worldline-hosted payment page.',
  },
}

const availableProviders = computed(() => Object.keys(PROVIDER_META))

const dialog = ref(false)
const pickerOpen = ref(false)
const saving = ref(false)
const form = ref({ provider: null, keyId: '', keySecret: '', webhookSecret: '', mode: 'test', hasExisting: false })

function openDialog(provider, existing) {
  form.value = {
    provider,
    keyId: existing?.keyId || '',
    keySecret: '',
    webhookSecret: '',
    mode: existing?.mode || 'test',
    hasExisting: !!existing,
  }
  dialog.value = true
}

async function submit() {
  if (!form.value.keyId || (!form.value.keySecret && !form.value.hasExisting)) {
    return alert('Key ID and Key Secret are required')
  }
  saving.value = true
  try {
    await store.saveGateway(form.value.provider, {
      keyId: form.value.keyId,
      keySecret: form.value.keySecret,
      webhookSecret: form.value.webhookSecret,
      mode: form.value.mode,
    })
    dialog.value = false
  } catch (err) {
    alert(err.message || 'Failed to save payment gateway')
  }
  saving.value = false
}

async function activate(provider) {
  try {
    await store.activateGateway(provider)
  } catch (err) {
    alert(err.message || 'Failed to activate payment gateway')
  }
}

async function remove(provider) {
  if (!confirm(`Remove ${provider} settings? Online payments will stop working until reconfigured.`)) return
  try {
    await store.removeGateway(provider)
  } catch (err) {
    alert(err.message || 'Failed to remove payment gateway')
  }
}

onMounted(() => {
  store.fetchGateways()
})
</script>

<style scoped>
.provider-row {
  background: #FBFAFD;
  border: 1px solid #EEE9F7;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
}
</style>
