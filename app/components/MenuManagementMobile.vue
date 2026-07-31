<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Menu Management" subtitle="Categories, items, availability & pricing">
      <MobileBranchPicker v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions"
        @update:modelValue="loadItems" />
    </MobilePageHeader>

    <div class="mobile-status-row d-flex ga-2 px-4 py-3">
      <v-chip :color="tab === 'items' ? 'primary' : undefined" :variant="tab === 'items' ? 'flat' : 'tonal'"
        size="small" class="font-weight-medium" @click="tab = 'items'">Menu Items</v-chip>
      <v-chip :color="tab === 'categories' ? 'primary' : undefined" :variant="tab === 'categories' ? 'flat' : 'tonal'"
        size="small" class="font-weight-medium" @click="tab = 'categories'">Categories</v-chip>
    </div>

    <v-window v-model="tab">
      <!-- ITEMS -->
      <v-window-item value="items">
        <div class="px-4">
          <v-select v-model="categoryFilter" :items="categoryOptions" label="Filter by category" clearable
            density="compact" hide-details class="mb-4" @update:model-value="loadItems" />

          <MobileEmptyState v-if="!menu.items.length" icon="mdi-food-outline" title="No menu items yet"
            description="Tap Add Item below to create your first item.">
            <template #action>
              <v-btn color="primary" prepend-icon="mdi-plus" @click="openItemDialog()">Add Item</v-btn>
            </template>
          </MobileEmptyState>

          <div v-else class="mobile-item-grid">
            <div v-for="item in visibleItems" :key="item.id" class="app-card d-flex flex-column overflow-hidden menu-item-card">
              <div class="position-relative">
                <v-img v-if="item.imageUrl" :src="item.imageUrl" height="100" cover />
                <div v-else class="d-flex align-center justify-center" style="height: 100px; background: #F3EEFF">
                  <v-icon size="28" color="primary">mdi-food</v-icon>
                </div>
                <span class="veg-dot-badge" :class="item.isVeg ? 'is-veg' : 'is-nonveg'"><span /></span>
                <ActionMenu :actions="itemMenuActions(item)">
                  <template #activator="{ props }">
                    <v-btn size="small" variant="flat" color="white" icon="mdi-dots-vertical" class="item-menu-btn" v-bind="props" />
                  </template>
                </ActionMenu>
              </div>

              <div class="pa-3 d-flex flex-column flex-grow-1">
                <div class="font-weight-bold text-body-2 mb-1 text-truncate">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis mb-2 text-truncate">{{ item.category?.name || '—' }}</div>
                <v-spacer />
                <div class="d-flex justify-space-between align-center mt-1">
                  <span class="text-body-2 font-weight-bold mono-data">{{ $formatPrice(item.price) }}</span>
                  <MobileStatusChip :status="item.availability.replace('_', ' ')" :color="availabilityHex(item.availability)" size="small" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="visibleItems.length < menu.items.length" class="d-flex justify-center mt-4 mb-4">
            <v-btn variant="outlined" class="load-more-btn" @click="itemsShown += 12">View More</v-btn>
          </div>
        </div>

        <MobileActionBar v-if="menu.items.length">
          <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="openItemDialog()">
            Add Item
          </v-btn>
        </MobileActionBar>
      </v-window-item>

      <!-- CATEGORIES -->
      <v-window-item value="categories">
        <div class="px-4">
          <MobileEmptyState v-if="!menu.categories.length" icon="mdi-shape-outline" title="No categories yet"
            description="Categories help organize your menu items.">
            <template #action>
              <v-btn color="primary" prepend-icon="mdi-plus" @click="openCategoryDialog()">Add Category</v-btn>
            </template>
          </MobileEmptyState>

          <v-expansion-panels v-else>
            <v-expansion-panel v-for="cat in menu.categories" :key="cat.id" class="app-card mb-3" elevation="0">
              <v-expansion-panel-title>
                <div class="d-flex align-center justify-space-between w-100 me-2">
                  <span class="font-weight-bold text-body-2">{{ cat.name }}</span>
                  <span class="text-caption text-medium-emphasis">{{ cat.subCategories.length }} sub</span>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="d-flex justify-space-between mb-3">
                  <div class="text-caption text-medium-emphasis">{{ cat.description }}</div>
                  <div class="flex-shrink-0">
                    <v-icon size="18" color="primary" class="me-2" @click="openCategoryDialog(cat)">mdi-pencil</v-icon>
                    <v-icon size="18" color="error" @click="confirmDeleteCategory(cat)">mdi-delete</v-icon>
                  </div>
                </div>

                <v-chip v-for="sub in cat.subCategories" :key="sub.id" size="small" class="me-2 mb-2" closable
                  @click:close="menu.deleteSubCategory(sub.id)">
                  {{ sub.name }}
                </v-chip>

                <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="openSubCategoryDialog(cat)">
                  Add Sub-category
                </v-btn>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>

        <MobileActionBar v-if="menu.categories.length">
          <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="openCategoryDialog()">
            Add Category
          </v-btn>
        </MobileActionBar>
      </v-window-item>
    </v-window>

    <!-- ITEM DIALOG (fullscreen - the only content-heavy form here) -->
    <MobileFullscreenDialog v-model="itemDialog" :title="itemForm.id ? 'Edit Menu Item' : 'Add Menu Item'">
      <div class="d-flex align-center ga-4 mb-4">
        <div class="item-image-preview">
          <v-img v-if="itemForm.imageUrl" :src="itemForm.imageUrl" height="72" width="72" cover rounded="lg" />
          <div v-else class="d-flex align-center justify-center rounded-lg" style="height: 72px; width: 72px; background: #F3EEFF">
            <v-icon color="primary">mdi-food</v-icon>
          </div>
        </div>
        <div>
          <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="onFileChange" />
          <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-camera-outline"
            :loading="uploadingImage" @click="fileInput.click()">
            {{ itemForm.imageUrl ? 'Change Photo' : 'Upload Photo' }}
          </v-btn>
        </div>
      </div>

      <v-text-field v-model="itemForm.name" label="Name" class="mb-2" />
      <v-text-field v-model.number="itemForm.price" :label="priceLabel" type="number" prefix="₹" class="mb-2" />
      <v-textarea v-model="itemForm.description" label="Description" rows="2" auto-grow class="mb-2" />
      <v-select v-model="itemForm.categoryId" :items="categoryOptions" label="Category" class="mb-2" />
      <v-select v-model="itemForm.subCategoryId" :items="subCategoryOptions" label="Sub-category (optional)" clearable class="mb-2" />
      <v-select v-model="itemForm.kitchenStation" :items="stations" label="Kitchen Station" class="mb-2" />
      <v-text-field v-model.number="itemForm.prepTimeMinutes" label="Prep Time (min)" type="number" class="mb-2" />
      <v-select v-model="itemForm.taxRateId" :items="taxOptions" label="Tax Rate" clearable class="mb-2" />

      <v-divider class="my-3" />
      <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2">Preparation</div>
      <v-radio-group v-model="itemForm.preparationType" hide-details density="compact" class="mb-2">
        <v-radio label="Prepared Fresh - needs the kitchen" value="PREPARED_FRESH" color="primary" />
        <v-radio label="Ready to Serve - no cooking needed" value="READY_TO_SERVE" color="primary" />
      </v-radio-group>

      <v-divider class="my-3" />
      <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2">Quantity-based item (optional)</div>
      <v-select v-model="itemForm.unitType" :items="unitTypeOptions" label="Sold by unit" clearable
        hint="Leave blank for a normal fixed-price item ordered by count" persistent-hint class="mb-2" />
      <v-text-field v-if="itemForm.unitType === 'CUSTOM'" v-model="itemForm.customUnitLabel" label="Custom unit label"
        placeholder="e.g. pack, box, dozen" class="mb-2" />
      <v-switch v-if="itemForm.unitType" v-model="itemForm.trackInventory" color="primary" hide-details
        :label="itemForm.trackInventory ? 'Track inventory' : 'Unlimited stock'" class="mb-2" />

      <v-divider class="my-3" />
      <v-switch v-model="itemForm.isVeg" label="Veg" color="success" hide-details />
      <v-switch v-model="itemForm.isRecommended" label="Recommended" color="primary" hide-details />
      <v-switch v-model="itemForm.isPopular" label="Popular" color="primary" hide-details />
      <v-select v-model.number="itemForm.spicyLevel" :items="[0, 1, 2, 3]" label="Spicy Level" class="mt-2 mb-2" />
      <v-combobox v-model="itemForm.tags" label="Tags" multiple chips closable-chips />

      <template #footer>
        <v-btn block size="large" color="primary" class="font-weight-bold" :loading="menu.loading" @click="submitItem">
          {{ itemForm.id ? 'Update Item' : 'Create Item' }}
        </v-btn>
      </template>
    </MobileFullscreenDialog>

    <!-- CATEGORY -->
    <MobileBottomSheet v-model="categoryDialog" :title="categoryForm.id ? 'Edit Category' : 'Add Category'">
      <v-text-field v-model="categoryForm.name" label="Name" class="mb-2" />
      <v-textarea v-model="categoryForm.description" label="Description" rows="2" class="mb-3" />
      <v-btn block size="large" color="primary" class="font-weight-bold" @click="submitCategory">
        {{ categoryForm.id ? 'Update' : 'Create' }}
      </v-btn>
    </MobileBottomSheet>

    <!-- SUB-CATEGORY -->
    <MobileBottomSheet v-model="subCategoryDialog" title="Add Sub-category">
      <v-text-field v-model="subCategoryForm.name" label="Name" class="mb-3" />
      <v-btn block size="large" color="primary" class="font-weight-bold" @click="submitSubCategory">Create</v-btn>
    </MobileBottomSheet>

    <!-- DELETE CONFIRM -->
    <MobileBottomSheet v-model="deleteDialog" title="Confirm Delete">
      <p class="text-body-2 text-medium-emphasis mb-4">This action cannot be undone.</p>
      <v-btn block size="large" color="error" class="font-weight-bold" @click="performDelete">Delete</v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { useTaxStore } from '@/stores/tax'
import { useBranchSelector } from '@/composables/useBranchSelector'
import ActionMenu from '@/components/ActionMenu.vue'
import { useUnitLabel } from '@/composables/useUnitLabel'

const { unitShortLabel } = useUnitLabel()

const menu = useMenuStore()
const taxStore = useTaxStore()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()

const tab = ref('items')
const categoryFilter = ref(null)
const stations = ['MAIN', 'GRILL', 'BEVERAGE', 'DESSERT', 'TANDOOR', 'BAKERY']

const itemsShown = ref(12)
const visibleItems = computed(() => menu.items.slice(0, itemsShown.value))

const categoryOptions = computed(() => menu.categories.map((c) => ({ title: c.name, value: c.id })))
const subCategoryOptions = computed(() => {
  const cat = menu.categories.find((c) => c.id === itemForm.value.categoryId)
  return (cat?.subCategories || []).map((s) => ({ title: s.name, value: s.id }))
})
const taxOptions = computed(() => taxStore.taxes.map((t) => ({ title: `${t.name} (${t.rate}%)`, value: t.id })))

function availabilityHex(a) {
  return a === 'AVAILABLE' ? '#16A34A' : a === 'OUT_OF_STOCK' ? '#D97706' : '#6B7280'
}

async function loadItems() {
  if (!selectedBranchId.value) return
  itemsShown.value = 12
  await menu.fetchItems(selectedBranchId.value, categoryFilter.value ? { categoryId: categoryFilter.value } : {})
}

/* ITEM DIALOG */
const itemDialog = ref(false)
const fileInput = ref(null)
const uploadingImage = ref(false)
const emptyItem = () => ({
  id: null, name: '', description: '', price: 0, categoryId: null, subCategoryId: null,
  kitchenStation: 'MAIN', prepTimeMinutes: 10, taxRateId: null, isVeg: true,
  isRecommended: false, isPopular: false, spicyLevel: 0, tags: [], availability: 'AVAILABLE',
  imageId: null, imageUrl: null,
  preparationType: 'PREPARED_FRESH', unitType: null, customUnitLabel: null, trackInventory: true,
})
const itemForm = ref(emptyItem())

const unitTypeOptions = [
  { title: 'Piece (pcs)', value: 'PIECE' },
  { title: 'Gram (g)', value: 'GRAM' },
  { title: 'Kilogram (kg)', value: 'KG' },
  { title: 'Millilitre (ml)', value: 'ML' },
  { title: 'Litre (L)', value: 'LITRE' },
  { title: 'Custom unit...', value: 'CUSTOM' },
]

const priceLabel = computed(() => {
  if (!itemForm.value.unitType) return 'Price'
  return `Price per ${unitShortLabel(itemForm.value)}`
})

function openItemDialog(item = null) {
  itemForm.value = item ? { ...item } : emptyItem()
  itemDialog.value = true
}

// keep fields in sync with MenuManagement.vue
function itemMenuActions(item) {
  return [
    { icon: 'mdi-pencil', color: '#7C3AED', label: 'Edit', onClick: () => openItemDialog(item) },
    { icon: 'mdi-check-circle', color: '#16A34A', label: 'Mark Available', onClick: () => menu.updateAvailability(item.id, 'AVAILABLE') },
    { icon: 'mdi-alert-circle', color: '#D97706', label: 'Mark Out of Stock', onClick: () => menu.updateAvailability(item.id, 'OUT_OF_STOCK') },
    { icon: 'mdi-eye-off', color: '#6B7280', label: 'Hide from menu', onClick: () => menu.updateAvailability(item.id, 'HIDDEN') },
    { icon: 'mdi-delete', color: '#DC2626', label: 'Delete', onClick: () => confirmDeleteItem(item), dividerBefore: true, danger: true },
  ]
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploadingImage.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await menu.uploadImage(formData)
    if (res?.data?.id && res?.data?.url) {
      itemForm.value.imageId = res.data.id
      itemForm.value.imageUrl = res.data.url
    }
  } catch (err) {
    console.error('Image upload failed', err)
  } finally {
    uploadingImage.value = false
  }
}

async function submitItem() {
  const payload = { ...itemForm.value, branchId: selectedBranchId.value }
  if (itemForm.value.id) await menu.updateItem(itemForm.value.id, payload)
  else await menu.createItem(payload)
  itemDialog.value = false
  await loadItems()
}

/* CATEGORY DIALOG */
const categoryDialog = ref(false)
const categoryForm = ref({ id: null, name: '', description: '' })

function openCategoryDialog(cat = null) {
  categoryForm.value = cat ? { id: cat.id, name: cat.name, description: cat.description } : { id: null, name: '', description: '' }
  categoryDialog.value = true
}

async function submitCategory() {
  if (categoryForm.value.id) await menu.updateCategory(categoryForm.value.id, categoryForm.value)
  else await menu.createCategory(categoryForm.value)
  categoryDialog.value = false
}

/* SUB-CATEGORY DIALOG */
const subCategoryDialog = ref(false)
const subCategoryForm = ref({ name: '' })
const activeCategoryId = ref(null)

function openSubCategoryDialog(cat) {
  activeCategoryId.value = cat.id
  subCategoryForm.value = { name: '' }
  subCategoryDialog.value = true
}

async function submitSubCategory() {
  await menu.createSubCategory(activeCategoryId.value, subCategoryForm.value)
  subCategoryDialog.value = false
}

/* DELETE */
const deleteDialog = ref(false)
const deleteTarget = ref(null)
const deleteType = ref(null)

function confirmDeleteItem(item) {
  deleteTarget.value = item
  deleteType.value = 'item'
  deleteDialog.value = true
}
function confirmDeleteCategory(cat) {
  deleteTarget.value = cat
  deleteType.value = 'category'
  deleteDialog.value = true
}
async function performDelete() {
  if (deleteType.value === 'item') await menu.deleteItem(deleteTarget.value.id)
  if (deleteType.value === 'category') await menu.deleteCategory(deleteTarget.value.id)
  deleteDialog.value = false
  if (deleteType.value === 'item') await loadItems()
}

onMounted(async () => {
  await menu.fetchCategories()
  await taxStore.fetchTaxes()
  if (selectedBranchId.value) await loadItems()
})

watch(selectedBranchId, (val) => { if (val) loadItems() })
</script>

<style scoped>
.mobile-status-row {
  overflow-x: auto;
  scrollbar-width: none;
}
.mobile-status-row::-webkit-scrollbar {
  display: none;
}
.mobile-item-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding-bottom: 88px;
}
.mobile-item-grid > * {
  min-width: 0;
}
.menu-item-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.item-menu-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.veg-dot-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.veg-dot-badge span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.veg-dot-badge.is-veg span { background: #16A34A; }
.veg-dot-badge.is-nonveg span { background: #DC2626; }
</style>
