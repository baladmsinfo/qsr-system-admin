<template>
  <v-container fluid class="pa-6">

    <!-- 🔥 Header -->
    <v-sheet elevation="0" class="d-flex align-center justify-space-between mb-6 px-4 py-3 bg-surface rounded-lg">
      <div>
        <h2 class="text-h5 font-weight-bold mb-0">Banners</h2>
        <p class="text-body-2 text-medium-emphasis">Manage company homepage banners</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openBannerDialog">
        Add Banner
      </v-btn>
    </v-sheet>

    <v-row>
      <v-col cols="12" md="6" v-for="banner in companyStore.banners" :key="banner.id">
        <v-card class="rounded-xl overflow-hidden">
          <v-img :src="banner.imageUrl" height="200" cover />

          <v-card-title class="d-flex align-center justify-space-between">
            <span class="font-weight-bold">
              {{ banner.title || "Untitled Banner" }}
            </span>

            <div>
              <v-chip v-if="banner.manage" color="green" size="small" variant="flat">
                Default
              </v-chip>

              <v-btn v-else size="small" variant="tonal" color="primary" @click="setAsDefault(banner)">
                Set as Default
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text class="text-body-2">
            {{ banner.description }}
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>

    <!-- ℹ️ No Banners -->
    <v-alert v-if="!companyStore.bannerLoading && companyStore.banners.length === 0" type="info" variant="tonal"
      class="mt-4">
      No banners added yet
    </v-alert>

    <!-- ⏳ Loader -->
    <div class="d-flex justify-center mt-6" v-if="companyStore.bannerLoading">
      <v-progress-circular indeterminate size="36"></v-progress-circular>
    </div>

    <!-- 🟢 Create Banner Dialog -->
    <v-dialog v-model="bannerDialog" width="500">
      <v-card class="pa-4">
        <v-card-title class="font-weight-bold text-h6">Create Banner</v-card-title>
        <v-divider class="my-2"></v-divider>

        <v-card-text>
          <v-text-field v-model="form.title" label="Title" variant="outlined"></v-text-field>
          <v-textarea v-model="form.description" label="Description" variant="outlined"></v-textarea>

          <!-- 🔥 Upload Image -->
          <v-file-input label="Select Banner Image" variant="outlined" accept="image/*" @change="onFileChange"
            :loading="uploading" prepend-icon="mdi-image"></v-file-input>
        </v-card-text>

        <v-card-actions class="d-flex justify-end">
          <v-btn variant="text" @click="bannerDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="creating" @click="submitBanner">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCompanyStore } from "@/stores/company";
import { useAuthStore } from "@/stores/auth";

const companyStore = useCompanyStore();

const bannerDialog = ref(false);
const creating = ref(false);
const uploading = ref(false);

const form = ref({
  title: "",
  description: "",
  imageId: null,
  imageUrl: null,
});

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
    console.log("Uploaded", res);

    if (res.statusCode === "00") {
      form.value.imageId = res.data.id;
      form.value.imageUrl = res.data.url;
    }

    console.log(form.value);
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
