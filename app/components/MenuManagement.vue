<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Menu Management</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Categories, items, availability &amp; pricing</p>
      </div>

      <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch" density="compact"
        hide-details style="max-width: 260px" @update:model-value="loadItems" />
    </div>

    <div class="d-flex flex-wrap ga-2 mb-6">
      <v-chip :color="tab === 'items' ? 'primary' : undefined" :variant="tab === 'items' ? 'flat' : 'tonal'"
        class="font-weight-medium" @click="tab = 'items'">Menu Items</v-chip>
      <v-chip :color="tab === 'categories' ? 'primary' : undefined" :variant="tab === 'categories' ? 'flat' : 'tonal'"
        class="font-weight-medium" @click="tab = 'categories'">Categories</v-chip>
    </div>

    <v-window v-model="tab">
      <!-- ITEMS -->
      <v-window-item value="items">
        <div class="d-flex flex-wrap align-center justify-space-between mb-5 ga-3">
          <v-select v-model="categoryFilter" :items="categoryOptions" label="Filter by category" clearable
            density="compact" hide-details style="max-width: 260px" @update:model-value="loadItems" />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openItemDialog()">Add Item</v-btn>
        </div>

        <v-row>
          <v-col v-for="item in visibleItems" :key="item.id" cols="12" sm="6" md="4" lg="3">
            <div class="app-card h-100 d-flex flex-column overflow-hidden menu-item-card">
              <div class="position-relative">
                <v-img v-if="item.imageUrl" :src="item.imageUrl" height="140" cover />
                <div v-else class="d-flex align-center justify-center" style="height: 140px; background: #F3EEFF">
                  <v-icon size="36" color="primary">mdi-food</v-icon>
                </div>
                <span class="veg-dot-badge" :class="item.isVeg ? 'is-veg' : 'is-nonveg'"><span /></span>
                <ActionMenu :actions="itemMenuActions(item)">
                  <template #activator="{ props }">
                    <v-btn size="small" variant="flat" color="white" icon="mdi-dots-vertical" class="item-menu-btn" v-bind="props" />
                  </template>
                </ActionMenu>
              </div>

              <div class="pa-4 d-flex flex-column flex-grow-1">
                <div class="font-weight-bold mb-1">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis mb-2">{{ item.category?.name || '—' }} &middot; {{ item.kitchenStation }}</div>

                <div class="d-flex flex-wrap ga-1 mb-2">
                  <v-chip v-if="item.preparationType === 'READY_TO_SERVE'" size="x-small" color="info" variant="tonal" prepend-icon="mdi-lightning-bolt">
                    Ready to Serve
                  </v-chip>
                  <v-chip v-if="item.unitType" size="x-small" color="secondary" variant="tonal" prepend-icon="mdi-scale-balance">
                    Sold per {{ unitShortLabel(item) }}
                  </v-chip>
                </div>

                <v-spacer />

                <div class="d-flex justify-space-between align-center mt-2">
                  <span class="text-subtitle-1 font-weight-bold mono-data">{{ $formatPrice(item.price) }}</span>
                  <v-chip size="small" :color="availabilityColor(item.availability)" variant="tonal">
                    {{ item.availability.replace('_', ' ') }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-col>

          <v-col v-if="!menu.items.length" cols="12">
            <div class="app-card pa-10 text-center text-medium-emphasis">No menu items yet</div>
          </v-col>
        </v-row>

        <div v-if="visibleItems.length < menu.items.length" class="d-flex justify-center mt-6">
          <v-btn variant="outlined" class="load-more-btn" @click="itemsShown += 12">View More</v-btn>
        </div>
      </v-window-item>

      <!-- CATEGORIES -->
      <v-window-item value="categories">
        <div class="d-flex justify-end mb-5">
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCategoryDialog()">Add Category</v-btn>
        </div>

        <v-expansion-panels>
          <v-expansion-panel v-for="cat in menu.categories" :key="cat.id" class="app-card mb-3" elevation="0">
            <v-expansion-panel-title>
              <div class="d-flex align-center justify-space-between w-100 me-4">
                <span class="font-weight-bold">{{ cat.name }}</span>
                <span class="text-caption text-medium-emphasis">{{ cat.subCategories.length }} sub-categories</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="d-flex justify-space-between mb-3">
                <div class="text-body-2 text-medium-emphasis">{{ cat.description }}</div>
                <div>
                  <v-icon size="18" color="primary" class="me-2" @click="openCategoryDialog(cat)">mdi-pencil</v-icon>
                  <v-icon size="18" color="error" @click="confirmDeleteCategory(cat)">mdi-delete</v-icon>
                </div>
              </div>

              <v-chip v-for="sub in cat.subCategories" :key="sub.id" class="me-2 mb-2" closable
                @click:close="menu.deleteSubCategory(sub.id)">
                {{ sub.name }}
              </v-chip>

              <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="openSubCategoryDialog(cat)">
                Add Sub-category
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-window-item>
    </v-window>

    <!-- ITEM DIALOG -->
    <v-dialog v-model="itemDialog" max-width="640">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ itemForm.id ? 'Edit Menu Item' : 'Add Menu Item' }}</span>
          <v-btn icon="mdi-close" variant="text" @click="itemDialog = false" />
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <div class="d-flex align-center ga-4">
                <div class="item-image-preview">
                  <v-img v-if="itemForm.imageUrl" :src="itemForm.imageUrl" height="88" width="88" cover rounded="lg" />
                  <div v-else class="d-flex align-center justify-center rounded-lg" style="height: 88px; width: 88px; background: #F3EEFF">
                    <v-icon color="primary">mdi-food</v-icon>
                  </div>
                </div>
                <div>
                  <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="onFileChange" />
                  <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-camera-outline"
                    :loading="uploadingImage" @click="fileInput.click()">
                    {{ itemForm.imageUrl ? 'Change Photo' : 'Upload Photo' }}
                  </v-btn>
                  <p class="text-caption text-medium-emphasis mt-1 mb-0">Shown on the customer menu, POS and admin screens</p>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field v-model="itemForm.name" label="Name" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="itemForm.price" :label="priceLabel" type="number" prefix="₹" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="itemForm.description" label="Description" rows="2" auto-grow />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="itemForm.categoryId" :items="categoryOptions" label="Category" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="itemForm.subCategoryId" :items="subCategoryOptions" label="Sub-category (optional)"
                clearable />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="itemForm.kitchenStation" :items="stations" label="Kitchen Station" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="itemForm.prepTimeMinutes" label="Prep Time (min)" type="number" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="itemForm.taxRateId" :items="taxOptions" label="Tax Rate" clearable />
            </v-col>

            <v-col cols="12">
              <v-divider class="my-2" />
              <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2">Preparation</div>
              <v-radio-group v-model="itemForm.preparationType" inline hide-details density="compact">
                <v-radio label="Prepared Fresh - needs the kitchen" value="PREPARED_FRESH" color="primary" />
                <v-radio label="Ready to Serve - no cooking needed" value="READY_TO_SERVE" color="primary" />
              </v-radio-group>
              <p class="text-caption text-medium-emphasis mt-1 mb-0">
                Ready to Serve items skip the Kitchen Display entirely and are handled immediately.
              </p>
            </v-col>

            <v-col cols="12">
              <v-divider class="my-2" />
              <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2">Quantity-based item (optional)</div>
            </v-col>
            <v-col cols="12" :md="itemForm.unitType === 'CUSTOM' ? 6 : 12">
              <v-select v-model="itemForm.unitType" :items="unitTypeOptions" label="Sold by unit" clearable
                hint="Leave blank for a normal fixed-price item ordered by count" persistent-hint />
            </v-col>
            <v-col v-if="itemForm.unitType === 'CUSTOM'" cols="12" md="6">
              <v-text-field v-model="itemForm.customUnitLabel" label="Custom unit label" placeholder="e.g. pack, box, dozen" />
            </v-col>
            <v-col v-if="itemForm.unitType" cols="12">
              <v-switch v-model="itemForm.trackInventory" color="primary" hide-details
                :label="itemForm.trackInventory ? 'Track inventory (branch stock is deducted per order)' : 'Unlimited stock (never runs out, not deducted)'" />
            </v-col>

            <v-col cols="12" md="3">
              <v-switch v-model="itemForm.isVeg" label="Veg" color="success" />
            </v-col>
            <v-col cols="12" md="3">
              <v-switch v-model="itemForm.isRecommended" label="Recommended" color="primary" />
            </v-col>
            <v-col cols="12" md="3">
              <v-switch v-model="itemForm.isPopular" label="Popular" color="primary" />
            </v-col>
            <v-col cols="12" md="3">
              <v-select v-model.number="itemForm.spicyLevel" :items="[0, 1, 2, 3]" label="Spicy Level" />
            </v-col>
            <v-col cols="12">
              <v-combobox v-model="itemForm.tags" label="Tags" multiple chips closable-chips />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="itemDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="menu.loading" @click="submitItem">
            {{ itemForm.id ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- CATEGORY DIALOG -->
    <v-dialog v-model="categoryDialog" max-width="420">
      <v-card>
        <v-card-title>{{ categoryForm.id ? 'Edit Category' : 'Add Category' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="categoryForm.name" label="Name" />
          <v-textarea v-model="categoryForm.description" label="Description" rows="2" />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="categoryDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="submitCategory">{{ categoryForm.id ? 'Update' : 'Create' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SUB-CATEGORY DIALOG -->
    <v-dialog v-model="subCategoryDialog" max-width="420">
      <v-card>
        <v-card-title>Add Sub-category</v-card-title>
        <v-card-text>
          <v-text-field v-model="subCategoryForm.name" label="Name" />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="subCategoryDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="submitSubCategory">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE CONFIRM -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>This action cannot be undone.</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="performDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
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

function availabilityColor(a) {
  return a === 'AVAILABLE' ? 'success' : a === 'OUT_OF_STOCK' ? 'warning' : 'grey'
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

// Color-as-utility: each action reads at a glance instead of a flat list of
// identical grey text rows (matches the Drafts panel pattern on POS/Billing).
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
.menu-item-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.item-menu-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.veg-dot-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.veg-dot-badge span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.veg-dot-badge.is-veg span { background: #16A34A; }
.veg-dot-badge.is-nonveg span { background: #DC2626; }
</style>
