<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Banners" subtitle="Manage business homepage banners" />

    <div class="pa-4">
      <MobileEmptyState v-if="!companyStore.bannerLoading && companyStore.banners.length === 0" icon="mdi-image-outline"
        title="No banners added yet">
        <template #action>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openBannerDialog">Add Banner</v-btn>
        </template>
      </MobileEmptyState>

      <div v-for="banner in companyStore.banners" :key="banner.id" class="app-card overflow-hidden mb-3">
        <v-img :src="banner.imageUrl" height="160" cover />

        <div class="d-flex align-center justify-space-between px-4 pt-3">
          <span class="font-weight-bold text-body-2">{{ banner.title || "Untitled Banner" }}</span>
          <v-chip v-if="banner.manage" color="success" size="x-small" variant="tonal">Default</v-chip>
          <v-btn v-else size="x-small" variant="tonal" color="primary" @click="setAsDefault(banner)">Set Default</v-btn>
        </div>

        <div class="text-caption text-medium-emphasis px-4 pb-4 pt-2">{{ banner.description }}</div>
      </div>

      <div class="d-flex justify-center mt-2" v-if="companyStore.bannerLoading">
        <v-progress-circular indeterminate size="36" />
      </div>
    </div>

    <MobileActionBar v-if="companyStore.banners.length">
      <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="openBannerDialog">
        Add Banner
      </v-btn>
    </MobileActionBar>

    <MobileBottomSheet v-model="bannerDialog" title="Create Banner">
      <v-text-field v-model="form.title" label="Title" variant="outlined" class="mb-2" />
      <v-textarea v-model="form.description" label="Description" variant="outlined" class="mb-2" />
      <v-file-input label="Select Banner Image" variant="outlined" accept="image/*" @change="onFileChange"
        :loading="uploading" prepend-icon="mdi-image" class="mb-3" />
      <v-btn block size="large" color="primary" class="font-weight-bold" :loading="creating" @click="submitBanner">Save</v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCompanyStore } from "@/stores/company";
import { useAuthStore } from "@/stores/auth";

const companyStore = useCompanyStore();

const bannerDialog = ref(false);
const creating = ref(false);
const uploading = ref(false);

const form = ref({ title: "", description: "", imageId: null, imageUrl: null });

const openBannerDialog = () => {
  form.value = { title: "", description: "", imageId: null, imageUrl: null, manage: true };
  bannerDialog.value = true;
};

function onFileChange(event) {
  const file = event.target.files[0]
  if (!file) return
  uploadImage(file)
}

const setAsDefault = async (banner) => {
  try {
    await companyStore.updateBannerManage(banner.id, true);
    await companyStore.fetchBanners();
  } catch (err) {
    console.error(err);
  }
};

const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await companyStore.uploadImage(formData);
    if (res.statusCode === "00") {
      form.value.imageId = res.data.id;
      form.value.imageUrl = res.data.url;
    }
  } catch (err) {
    console.error(err);
  }
  uploading.value = false;
};

const submitBanner = async () => {
  if (!form.value.imageId || !form.value.imageUrl) return alert("Please upload a banner image");
  creating.value = true;
  try {
    await companyStore.addBanner({
      title: form.value.title,
      description: form.value.description,
      imageId: form.value.imageId,
      imageUrl: form.value.imageUrl,
    });
    bannerDialog.value = false;
  } catch (err) {
    console.error(err);
  }
  creating.value = false;
};

onMounted(() => {
  companyStore.fetchBanners();
});
</script>
