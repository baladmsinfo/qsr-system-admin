<template>
  <v-container class="py-8">
    <!-- Header -->
    <div class="d-flex flex-column align-center mb-8 text-center">
      <h2 class="text-h4 font-weight-bold mb-2">Subscription Plans</h2>
      <p class="text-body-1">
        Choose the right plan for your business — upgrade anytime.
      </p>
    </div>

    <!-- Plans -->
    <v-row align="stretch">
      <v-col v-for="plan in plansToShow" :key="plan.id" cols="12" md="4" class="d-flex">
        <v-card class="plan-card flex-grow-1" elevation="8" rounded="xl">
          <v-responsive aspect-ratio="16/5" class="bg-primary"></v-responsive>

          <v-card-title class="text-h6 font-weight-bold text-center mt-3">
            {{ plan.name }}
          </v-card-title>

          <v-card-text class="text-center px-6">
            <p class="text-medium-emphasis mb-3">
              {{ plan.description }}
            </p>

            <div class="d-flex justify-center align-end mb-4">
              <span class="text-h3 font-weight-bold">₹{{ plan.price }}</span>
              <span class="ml-1 text-body-2 text-medium-emphasis">/ {{ plan.interval }}</span>
            </div>

            <!-- <v-chip
              v-if="plan.trialDays"
              color="success"
              size="small"
              class="mb-3"
            >
              🎉 {{ plan.trialDays }}-day Free Trial
            </v-chip> -->
          </v-card-text>

          <v-divider />

          <v-card-actions class="d-flex flex-column px-4 pb-6">
            <!-- <v-btn
              block
              variant="outlined"
              color="success"
              class="mb-2"
              v-if="plan.trialDays && !plan.active"
              @click="startTrial(plan)"
            >
              Start Free Trial
            </v-btn> -->

            <v-btn block color="primary" @click="openSubscribe(plan)">
              {{ plan.active ? 'Manage Subscription' : 'Subscribe Now' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Subscribe Dialog -->
    <v-dialog v-model="subscribeDialog" max-width="450">
      <v-card>
        <v-card-title class="text-h6">
          Subscribe — {{ selectedPlan?.name }}
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="checkout.name" label="Full name" variant="outlined" />
          <v-text-field v-model="checkout.email" label="Email" variant="outlined" />
          <v-select v-model="checkout.paymentMethod" :items="['UPI', 'Card', 'Netbanking', 'Offline']"
            label="Payment Method" variant="outlined" />
        </v-card-text>

        <v-card-actions>
          <v-btn variant="text" @click="subscribeDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="subscribing" @click="confirmSubscribe">
            Confirm & Pay
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription'

const subscriptionStore = useSubscriptionStore()

const subscribeDialog = ref(false)
const selectedPlan = ref(null)
const subscribing = ref(false)
const snackbar = ref({ show: false, message: '', color: 'success' })

const checkout = ref({ name: '', email: '', paymentMethod: 'UPI' })

const plansToShow = computed(() => subscriptionStore.plans)

function openSubscribe(plan) {
  selectedPlan.value = plan
  checkout.value = { name: '', email: '', paymentMethod: 'UPI' }
  subscribeDialog.value = true
}

async function confirmSubscribe() {
  subscribing.value = true
  await new Promise((r) => setTimeout(r, 1000))
  snackbar.value = { show: true, color: 'success', message: `Subscribed to ${selectedPlan.value.name}` }
  subscribeDialog.value = false
  subscribing.value = false
}

async function startTrial(plan) {
  await new Promise((r) => setTimeout(r, 600))
  snackbar.value = { show: true, color: 'success', message: `Trial activated for ${plan.name}` }
  plan.active = true
}

onMounted(async () => {
  await subscriptionStore.fetchPlans()
  console.log("Fetched Plans from Backend:", subscriptionStore.plans)
})
</script>

<style scoped>
.plan-card {
  overflow: hidden;
  transition: 0.28s;
  border: 2px solid transparent;
}

.plan-card:hover {
  transform: translateY(-5px);
  border-color: var(--v-theme-primary);
  box-shadow: 0px 16px 35px rgba(0, 0, 0, 0.15);
}
</style>