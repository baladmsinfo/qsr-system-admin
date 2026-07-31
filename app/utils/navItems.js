// Single source of truth for the app's permission-gated navigation structure,
// consumed by SideNav.vue (desktop/tablet drawer), MobileBottomNav.vue and
// MobileSideNav.vue (phone nav) - so all three can never disagree about what
// a given role is allowed to see. Mirrors the flags/items SideNav.vue computed
// inline before this extraction.
export function getNavItems(role) {
  const isSuperAdmin = role === "SUPERADMIN";
  const isBranchAdmin = role === "BRANCHADMIN";
  const canManageBranch = ["SUPERADMIN", "BRANCHADMIN"].includes(role);
  const canManageAccounting = ["SUPERADMIN", "ACCOUNTANT"].includes(role);
  const canSeeKitchen = ["SUPERADMIN", "BRANCHADMIN", "KITCHEN"].includes(role);
  const canSeeOrders = ["SUPERADMIN", "BRANCHADMIN", "WAITER", "CASHIER", "KITCHEN", "ACCOUNTANT"].includes(role);
  const canSeePos = ["SUPERADMIN", "BRANCHADMIN", "CASHIER"].includes(role);
  const canSeeCustomers = ["SUPERADMIN", "BRANCHADMIN", "WAITER", "CASHIER"].includes(role);

  const flags = {
    isSuperAdmin, isBranchAdmin, canManageBranch, canManageAccounting,
    canSeeKitchen, canSeeOrders, canSeePos, canSeeCustomers,
  };

  // `group` categorizes every item for the mobile side nav (MobileSideNav.vue),
  // which - unlike the bottom nav - shows the full menu including items also
  // pinned to the bottom nav, organized under group headers rather than one
  // flat list. GROUP_ORDER below controls the section order in that drawer.
  const items = [
    { key: "dashboard", label: "Dashboard", icon: "mdi-view-dashboard-outline", to: "/admin/dashboard", show: true, primary: true, priority: 1, group: "Operations" },
    { key: "kitchen", label: "Kitchen Display", icon: "mdi-pot-steam-outline", to: "/admin/kitchen", show: canSeeKitchen, primary: true, priority: 2, group: "Operations" },
    { key: "orders", label: "Live Orders", icon: "mdi-receipt-text-clock-outline", to: "/admin/orders", show: canSeeOrders, primary: true, priority: 3, group: "Operations" },
    { key: "pos", label: "POS / Billing", icon: "mdi-cash-register", to: "/admin/pos", show: canSeePos, primary: true, priority: 4, group: "Operations" },
    {
      key: "menu", label: "Menu", icon: "mdi-food-outline", to: "/admin/menu", show: canManageBranch, primary: true, priority: 5, group: "Menu",
      children: [
        { label: "Categories & Items", to: "/admin/menu" },
        { label: "Tables & QR", to: "/admin/tables" },
        { label: "Menu Card QR", to: "/admin/menu-qr" },
      ],
    },
    { key: "inventory", label: "Inventory", icon: "mdi-clipboard-list-outline", to: "/admin/inventory", show: canManageBranch, group: "Business" },
    { key: "customers", label: "Customers", icon: "mdi-account-group-outline", to: "/admin/customer", show: canSeeCustomers, group: "Business" },
    { key: "staff", label: "Staff", icon: "mdi-account-multiple-outline", to: "/admin/manageuser", show: canManageBranch, group: "Business" },
    {
      key: "purchases", label: "Purchases & Expenses", icon: "mdi-cart-arrow-down", show: canManageAccounting || isBranchAdmin, group: "Purchases & Expenses",
      children: [
        { label: "Purchases", to: "/admin/purchases" },
        { label: "Vendors", to: "/admin/vendor" },
        { label: "Expenses", to: "/admin/expense" },
      ],
    },
    {
      key: "accounting", label: "Accounting", icon: "mdi-file-chart", show: canManageAccounting, group: "Accounting",
      children: [
        { label: "Chart of Accounts", to: "/admin/setup/chart-of-accounts" },
        { label: "Journal Entry", to: "/admin/journals" },
        { label: "Trial Balance", to: "/admin/reports/trial_balance" },
        { label: "Ledger Reports", to: "/admin/reports/ledger_reports" },
        { label: "Profit & Loss", to: "/admin/reports/profitandloss" },
        { label: "Tax Reports", to: "/admin/reports/tax-reports" },
      ],
    },
    {
      key: "setup", label: "Setup", icon: "mdi-cog-outline", show: isSuperAdmin, group: "Setup",
      children: [
        { label: "Tax Setup", to: "/admin/tax" },
        { label: "Branch Setup", to: "/admin/branch" },
        { label: "Banner Setup", to: "/admin/banner" },
        { label: "Storefront Content", to: "/admin/storefront-content" },
        { label: "Website Builder", to: "/admin/website-builder" },
        { label: "Payment Gateways", to: "/admin/payment-gateways" },
        { label: "Printers", to: "/admin/printers" },
        { label: "Receipt Templates", to: "/admin/receipt-templates" },
        { label: "Receipt Designer", to: "/admin/receipt-designer" },
        { label: "Print History", to: "/admin/print-history" },
      ],
    },
  ];

  return { flags, items };
}

// Canonical section order for the mobile side nav's grouped display.
export const NAV_GROUP_ORDER = ["Operations", "Menu", "Business", "Purchases & Expenses", "Accounting", "Setup"];
