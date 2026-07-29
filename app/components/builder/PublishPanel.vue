<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePublishingStore } from '../../stores/publishing'

const publishing = usePublishingStore()
const newDomain = ref('')
let socket = null

const STAGE_LABELS = {
  QUEUED: 'Queued…',
  GENERATING: 'Generating static site…',
  BUILDING: 'Building…',
  DEPLOYING: 'Deploying to DigitalOcean Spaces…',
  SUCCEEDED: 'Published',
  FAILED: 'Failed',
  ROLLED_BACK: 'Rolled back',
}

const isInProgress = computed(() => ['QUEUED', 'GENERATING', 'BUILDING', 'DEPLOYING'].includes(publishing.latestStatus?.status))

onMounted(async () => {
  await Promise.all([publishing.fetchPublishStatus(), publishing.fetchDeployments(), publishing.fetchDomains()])

  const { $socket } = useNuxtApp()
  socket = $socket
  socket.on('publish:progress', (payload) => {
    if (publishing.latestStatus?.id === payload.deploymentId || isInProgress.value) {
      publishing.latestStatus = { ...publishing.latestStatus, ...payload }
    }
    if (payload.status === 'SUCCEEDED' || payload.status === 'FAILED') {
      publishing.fetchDeployments()
    }
  })
})

onBeforeUnmount(() => {
  socket?.off('publish:progress')
})

async function onPublish() {
  await publishing.publish()
}

async function onAddDomain() {
  if (!newDomain.value.trim()) return
  try {
    await publishing.addDomain(newDomain.value.trim())
    newDomain.value = ''
  } catch (err) {
    alert(err.message)
  }
}
</script>

<template>
  <div class="tw-p-3 tw-h-full tw-overflow-y-auto tw-space-y-6">
    <div>
      <p class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-uppercase tw-mb-2">Publish Website</p>
      <button
        class="tw-w-full tw-rounded-lg tw-bg-violet-700 tw-py-2 tw-text-sm tw-font-medium tw-text-white hover:tw-bg-violet-800 disabled:tw-opacity-50"
        :disabled="isInProgress"
        @click="onPublish"
      >
        {{ isInProgress ? 'Publishing…' : 'Publish Website' }}
      </button>
      <div v-if="publishing.latestStatus" class="tw-mt-3 tw-text-xs">
        <span
          class="tw-px-2 tw-py-0.5 tw-rounded-full"
          :class="{
            'tw-bg-green-100 tw-text-green-700': publishing.latestStatus.status === 'SUCCEEDED',
            'tw-bg-red-100 tw-text-red-700': publishing.latestStatus.status === 'FAILED',
            'tw-bg-amber-100 tw-text-amber-700': isInProgress,
            'tw-bg-slate-100 tw-text-slate-600': publishing.latestStatus.status === 'ROLLED_BACK',
          }"
        >
          {{ STAGE_LABELS[publishing.latestStatus.status] || publishing.latestStatus.status }}
        </span>
        <a v-if="publishing.latestStatus.previewUrl" :href="publishing.latestStatus.previewUrl" target="_blank" class="tw-ml-2 tw-text-violet-700 hover:tw-underline">View site ↗</a>
        <p v-if="publishing.latestStatus.errorMessage" class="tw-mt-1 tw-text-red-600">{{ publishing.latestStatus.errorMessage }}</p>
      </div>
    </div>

    <div>
      <p class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-uppercase tw-mb-2">Deployment History</p>
      <div v-if="!publishing.deployments.length" class="tw-text-xs tw-text-slate-400">No deployments yet.</div>
      <div v-for="d in publishing.deployments" :key="d.id" class="tw-flex tw-items-center tw-justify-between tw-py-2 tw-border-b tw-border-slate-100 tw-text-xs">
        <div>
          <span class="tw-font-medium">v{{ d.version }}</span>
          <span class="tw-ml-2 tw-text-slate-400">{{ new Date(d.createdAt).toLocaleString() }}</span>
          <div class="tw-text-slate-500">{{ STAGE_LABELS[d.status] || d.status }}</div>
        </div>
        <button v-if="d.status === 'SUCCEEDED'" class="tw-text-violet-700 hover:tw-underline" @click="publishing.rollback(d.id)">Rollback</button>
      </div>
    </div>

    <div>
      <p class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-uppercase tw-mb-2">Domains</p>
      <div v-for="domain in publishing.domains" :key="domain.id" class="tw-rounded-lg tw-border tw-border-slate-200 tw-p-2 tw-mb-2 tw-text-xs">
        <div class="tw-flex tw-items-center tw-justify-between">
          <span class="tw-font-medium tw-truncate">{{ domain.hostname }}</span>
          <span v-if="domain.isPrimary" class="tw-text-amber-500"><i class="mdi mdi-star" /></span>
        </div>
        <div class="tw-mt-1 tw-flex tw-gap-1">
          <span class="tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-slate-100" :class="domain.verificationStatus === 'VERIFIED' ? 'tw-text-green-700' : 'tw-text-slate-500'">{{ domain.verificationStatus }}</span>
          <span class="tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-slate-100" :class="domain.sslStatus === 'ACTIVE' ? 'tw-text-green-700' : 'tw-text-slate-500'">SSL: {{ domain.sslStatus }}</span>
        </div>
        <p v-if="domain.verificationStatus !== 'VERIFIED'" class="tw-mt-1 tw-text-slate-400">
          Add TXT record at <code>_qsr-verify.{{ domain.hostname }}</code> = <code>{{ domain.verificationToken }}</code>
        </p>
        <div class="tw-mt-2 tw-flex tw-gap-2">
          <button class="tw-text-violet-700 hover:tw-underline" @click="publishing.verifyDomain(domain.id)">Verify</button>
          <button v-if="!domain.isPrimary" class="tw-text-violet-700 hover:tw-underline" @click="publishing.setPrimaryDomain(domain.id)">Set Primary</button>
          <button class="tw-text-red-600 hover:tw-underline tw-ml-auto" @click="publishing.removeDomain(domain.id)">Remove</button>
        </div>
      </div>
      <div class="tw-flex tw-gap-2">
        <input v-model="newDomain" placeholder="www.example.com" class="tw-flex-1 tw-rounded tw-border tw-border-slate-300 tw-text-xs tw-px-2 tw-py-1" @keyup.enter="onAddDomain" />
        <button class="tw-text-xs tw-font-medium tw-text-violet-700" @click="onAddDomain">Add</button>
      </div>
    </div>
  </div>
</template>
