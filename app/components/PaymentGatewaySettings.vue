<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Payment Gateways</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Configure the payment gateway used to accept online payments on your website
        </p>
      </div>
      <v-menu>
        <template #activator="{ props: menuProps }">
          <v-btn color="primary" prepend-icon="mdi-plus" v-bind="menuProps">
            Configure Gateway
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="provider in availableProviders"
            :key="provider"
            @click="openDialog(provider)"
          >
            <v-list-item-title>{{ PROVIDER_META[provider].label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <v-row>
      <v-col cols="12" md="6" v-for="gw in store.gateways" :key="gw.id">
        <div class="app-card pa-5">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="font-weight-bold text-subtitle-1">{{ PROVIDER_META[gw.provider]?.label || gw.provider }}</span>
            <v-chip v-if="gw.isActive" color="success" size="small" variant="tonal">Active</v-chip>
            <v-btn v-else size="small" variant="tonal" color="primary" @click="activate(gw.provider)">
              Set Active
            </v-btn>
          </div>
          <p class="text-body-2 text-medium-emphasis mb-1">
            {{ PROVIDER_META[gw.provider]?.keyIdLabel || 'Key ID' }}: <code>{{ gw.keyId }}</code>
          </p>
          <p class="text-body-2 text-medium-emphasis mb-1">
            Mode: <v-chip size="x-small" :color="gw.mode === 'live' ? 'error' : 'warning'" variant="tonal">{{ gw.mode }}</v-chip>
          </p>
          <p class="text-caption text-medium-emphasis mb-4">
            Webhook secret {{ gw.hasWebhookSecret ? 'configured' : 'not set' }}
          </p>
          <div class="d-flex ga-2">
            <v-btn size="small" variant="text" @click="openDialog(gw.provider, gw)">Edit</v-btn>
            <v-btn size="small" variant="text" color="error" @click="remove(gw.provider)">Remove</v-btn>
          </div>
        </div>
      </v-col>

      <v-col v-if="!store.loading && store.gateways.length === 0" cols="12">
        <div class="app-card pa-10 text-center text-medium-emphasis">
          No payment gateway configured yet - online payment won't be offered at checkout
          until one is active.
        </div>
      </v-col>
    </v-row>

    <p class="text-caption text-medium-emphasis mt-4" v-if="store.gateways.length">
      Only one gateway can be active at a time - activating one deactivates the rest, since
      checkout always uses whichever single gateway is marked Active.
    </p>

    <div class="d-flex justify-center mt-6" v-if="store.loading">
      <v-progress-circular indeterminate size="36" />
    </div>

    <v-dialog v-model="dialog" width="520">
      <v-card class="pa-4" v-if="form.provider">
        <v-card-title class="font-weight-bold text-h6">{{ PROVIDER_META[form.provider].label }} Settings</v-card-title>
        <v-divider class="my-2" />
        <v-card-text>
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            {{ PROVIDER_META[form.provider].helpText }}
          </v-alert>
          <v-text-field v-model="form.keyId" :label="PROVIDER_META[form.provider].keyIdLabel" variant="outlined" />
          <v-text-field
            v-model="form.keySecret"
            :label="PROVIDER_META[form.provider].keySecretLabel"
            variant="outlined"
            type="password"
            :placeholder="form.hasExisting ? 'Leave blank to keep existing' : ''"
          />
          <v-text-field v-model="form.webhookSecret" :label="PROVIDER_META[form.provider].webhookSecretLabel" variant="outlined" type="password" />
          <v-select v-model="form.mode" :items="['test', 'live']" label="Mode" variant="outlined" />
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="submit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePaymentGatewaysStore } from '@/stores/paymentGateways'

const store = usePaymentGatewaysStore()

// Field labels/help text only - the backend stores every provider under the
// same generic keyId/keySecret/webhookSecret columns (see
// PaymentGatewayConfig in schema.prisma), so adding a further gateway here
// is just one more entry in this map, never a schema change.
const PROVIDER_META = {
  RAZORPAY: {
    label: 'Razorpay',
    keyIdLabel: 'Key ID',
    keySecretLabel: 'Key Secret',
    webhookSecretLabel: 'Webhook Secret (optional)',
    helpText: 'From your Razorpay Dashboard → Settings → API Keys. Use Test Mode keys first.',
  },
  CASHFREE: {
    label: 'Cashfree',
    keyIdLabel: 'Client ID (App ID)',
    keySecretLabel: 'Client Secret',
    webhookSecretLabel: 'Webhook Secret (optional - defaults to Client Secret)',
    helpText: 'From your Cashfree Merchant Dashboard → Developers → API Keys. Use Test/Sandbox keys first.',
  },
  WORLDLINE: {
    label: 'Worldline',
    keyIdLabel: 'Merchant ID',
    keySecretLabel: 'Encryption Key',
    webhookSecretLabel: 'Response Salt (optional - defaults to Encryption Key)',
    helpText: 'From your Worldline merchant welcome kit / integration guide. Worldline is redirect-based - there is no widget, the shopper is sent to a Worldline-hosted payment page.',
  },
}

const availableProviders = computed(() => Object.keys(PROVIDER_META))

const dialog = ref(false)
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
