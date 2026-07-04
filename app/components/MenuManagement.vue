<template>
  <v-container fluid class="pa-6">
    <v-sheet elevation="0" class="d-flex align-center justify-space-between mb-6 px-4 py-3 bg-surface rounded-lg">
      <div>
        <h2 class="text-h5 font-weight-bold mb-0">Menu Management</h2>
        <p class="text-body-2 text-medium-emphasis">Categories, items, availability &amp; pricing</p>
      </div>

      <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch" density="compact"
        variant="outlined" hide-details style="max-width: 260px" @update:model-value="loadItems" />
    </v-sheet>

    <v-tabs v-model="tab" class="mb-4">
      <v-tab value="items">Menu Items</v-tab>
      <v-tab value="categories">Categories</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <!-- ITEMS -->
      <v-window-item value="items">
        <v-sheet class="d-flex align-center justify-space-between mb-4 px-2">
          <v-select v-model="categoryFilter" :items="categoryOptions" label="Filter by category" clearable
            density="compact" variant="outlined" hide-details style="max-width: 260px" @update:model-value="loadItems" />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openItemDialog()">Add Item</v-btn>
        </v-sheet>

        <v-data-table :headers="itemHeaders" :items="menu.items" :loading="menu.loading" class="elevation-1 rounded-lg">
          <template #item.image="{ item }">
            <v-avatar size="36" rounded="lg">
              <v-img v-if="item.imageUrl" :src="item.imageUrl" />
              <v-icon v-else>mdi-food</v-icon>
            </v-avatar>
          </template>

          <template #item.price="{ item }">
            {{ $formatPrice(item.price) }}
          </template>

          <template #item.availability="{ item }">
            <v-chip size="small" :color="availabilityColor(item.availability)" variant="tonal">
              {{ item.availability.replace('_', ' ') }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn size="small" variant="text" icon="mdi-toggle-switch" v-bind="props" />
              </template>
              <v-list density="compact">
                <v-list-item @click="menu.updateAvailability(item.id, 'AVAILABLE')">Mark Available</v-list-item>
                <v-list-item @click="menu.updateAvailability(item.id, 'OUT_OF_STOCK')">Mark Out of Stock</v-list-item>
                <v-list-item @click="menu.updateAvailability(item.id, 'HIDDEN')">Hide from menu</v-list-item>
              </v-list>
            </v-menu>
            <v-icon size="20" color="primary" class="mx-2" @click="openItemDialog(item)">mdi-pencil</v-icon>
            <v-icon size="20" color="error" @click="confirmDeleteItem(item)">mdi-delete</v-icon>
          </template>
        </v-data-table>
      </v-window-item>

      <!-- CATEGORIES -->
      <v-window-item value="categories">
        <v-sheet class="d-flex justify-end mb-4 px-2">
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCategoryDialog()">Add Category</v-btn>
        </v-sheet>

        <v-expansion-panels variant="accordion">
          <v-expansion-panel v-for="cat in menu.categories" :key="cat.id">
            <v-expansion-panel-title>
              <div class="d-flex align-center justify-space-between w-100 me-4">
                <span class="font-weight-medium">{{ cat.name }}</span>
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
            <v-col cols="12" md="8">
              <v-text-field v-model="itemForm.name" label="Name" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="itemForm.price" label="Price" type="number" prefix="₹" />
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

const menu = useMenuStore()
const taxStore = useTaxStore()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()

const tab = ref('items')
const categoryFilter = ref(null)
const stations = ['MAIN', 'GRILL', 'BEVERAGE', 'DESSERT', 'TANDOOR', 'BAKERY']

const itemHeaders = [
  { title: '', key: 'image', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Category', key: 'category.name' },
  { title: 'Price', key: 'price' },
  { title: 'Station', key: 'kitchenStation' },
  { title: 'Availability', key: 'availability' },
  { title: 'Actions', key: 'actions', sortable: false },
]

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
  await menu.fetchItems(selectedBranchId.value, categoryFilter.value ? { categoryId: categoryFilter.value } : {})
}

/* ITEM DIALOG */
const itemDialog = ref(false)
const emptyItem = () => ({
  id: null, name: '', description: '', price: 0, categoryId: null, subCategoryId: null,
  kitchenStation: 'MAIN', prepTimeMinutes: 10, taxRateId: null, isVeg: true,
  isRecommended: false, isPopular: false, spicyLevel: 0, tags: [], availability: 'AVAILABLE',
})
const itemForm = ref(emptyItem())

function openItemDialog(item = null) {
  itemForm.value = item ? { ...item } : emptyItem()
  itemDialog.value = true
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
