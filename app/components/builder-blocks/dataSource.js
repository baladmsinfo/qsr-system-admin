// Resolves a block's reserved `_dataSource` prop against already-fetched live
// data (the tenant's public menu / branch list) into the SAME prop shape
// every block already expects statically - block components themselves stay
// pure/synchronous, exactly like every other block in this module; only the
// mapping happens here, once, before a block is ever rendered (same place
// GlobalComponentRef resolution already happens). Mirrored byte-for-byte in
// qsr-system-frondend's copy (same "copy both ways" convention as every other
// shared helper this module uses) and ported to plain JS in
// qsr-system-backend/src/utils/dataSource.js for the static site generator,
// which queries Prisma directly instead of calling the public HTTP route.

function filterMenuItems(items, filter) {
  if (filter === "recommended") return items.filter((i) => i.isRecommended);
  if (filter === "popular") return items.filter((i) => i.isPopular);
  return items;
}

// menuCategories: PublicMenuCategory[] from GET /api/public/branches/:id/menu.
// Flattens subcategory items into the same list as direct category items -
// MenuShowcase (like the existing RestaurantMenu block) only understands one
// level of category->items, not the API's category->subcategory->items tree.
function mapMenuCategories(menuCategories, categoryId, filter) {
  const categories = categoryId ? menuCategories.filter((c) => c.id === categoryId) : menuCategories;
  return categories.map((c) => ({
    name: c.name,
    items: filterMenuItems([...(c.menuItems || []), ...(c.subCategories || []).flatMap((sc) => sc.menuItems || [])], filter).map((i) => ({
      // id/taxRate are extra fields beyond what static-mode entries carry -
      // harmless for plain display, but what MenuShowcase's enableCart Add
      // to Cart button needs to call the real cart store with a real,
      // addressable menu item (a static-mode item has no real id to add).
      id: i.id,
      taxRate: i.taxRate,
      name: i.name,
      description: i.description || "",
      price: i.price != null ? String(i.price) : "",
      imageUrl: i.imageUrl || "",
      isVeg: i.isVeg,
      tags: i.tags || [],
    })),
  }));
}

function mapBranches(branches) {
  return (branches || []).map((b) => ({
    name: b.name,
    address: [b.addressLine1, b.city].filter(Boolean).join(", "),
    openingTime: b.openingTime || "",
    closingTime: b.closingTime || "",
  }));
}

// liveData: { menuCategories?: [], branches?: [] } - whatever the caller has
// already fetched; blocks whose `_dataSource.mode` isn't "dynamic", or whose
// type doesn't match a live-data source, pass through unchanged.
export function resolveBlockDataSource(block, liveData) {
  const ds = block.props?._dataSource;
  if (!ds || ds.mode !== "dynamic") return block;

  if (block.type === "MenuShowcase" && liveData?.menuCategories) {
    return { ...block, props: { ...block.props, categories: mapMenuCategories(liveData.menuCategories, ds.categoryId, block.props.filter) } };
  }
  if ((block.type === "OpeningHours" || block.type === "BranchLocator") && liveData?.branches) {
    return { ...block, props: { ...block.props, branches: mapBranches(liveData.branches) } };
  }
  return block;
}

export function resolveBlocksDataSource(blocks, liveData) {
  return (blocks || []).map((b) => resolveBlockDataSource(b, liveData));
}
