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
            <div class="app-card pa-4 h-100 d-flex flex-column">
              <div class="d-flex justify-space-between align-start mb-3">
                <v-avatar size="44" rounded="lg" color="surface-variant">
                  <v-img v-if="item.imageUrl" :src="item.imageUrl" />
                  <v-icon v-else color="primary">mdi-food</v-icon>
                </v-avatar>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn size="small" variant="text" icon="mdi-dots-vertical" v-bind="props" />
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="openItemDialog(item)">
                      <template #prepend><v-icon size="18" class="me-2">mdi-pencil</v-icon></template>
                      Edit
                    </v-list-item>
                    <v-list-item @click="menu.updateAvailability(item.id, 'AVAILABLE')">Mark Available</v-list-item>
                    <v-list-item @click="menu.updateAvailability(item.id, 'OUT_OF_STOCK')">Mark Out of Stock</v-list-item>
                    <v-list-item @click="menu.updateAvailability(item.id, 'HIDDEN')">Hide from menu</v-list-item>
                    <v-list-item @click="confirmDeleteItem(item)">
                      <template #prepend><v-icon size="18" class="me-2" color="error">mdi-delete</v-icon></template>
                      <span class="text-error">Delete</span>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <div class="font-weight-bold mb-1">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis mb-3">{{ item.category?.name || '—' }} &middot; {{ item.kitchenStation }}</div>

              <v-spacer />

              <div class="d-flex justify-space-between align-center mt-2">
                <span class="text-subtitle-1 font-weight-bold mono-data">{{ $formatPrice(item.price) }}</span>
                <v-chip size="small" :color="availabilityColor(item.availability)" variant="tonal">
                  {{ item.availability.replace('_', ' ') }}
                </v-chip>
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
