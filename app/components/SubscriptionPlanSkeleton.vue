<template>
  <div class="app-card pa-5">
    <v-skeleton-loader type="text" width="90" class="mb-4" />
    <v-skeleton-loader type="heading" width="120" class="mb-5" />
    <v-skeleton-loader type="text" class="mb-2" />
    <v-skeleton-loader type="text" width="70%" class="mb-5" />
    <v-skeleton-loader v-for="i in 4" :key="i" type="text" class="mb-3" />
    <v-skeleton-loader type="button" class="mt-4" style="width: 100%; height: 44px" />
  </div>
</template>
