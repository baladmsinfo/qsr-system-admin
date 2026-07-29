// Single source of truth for every block type: its Vue component, default
// props (used for "add block" + templates) and propsSchema (drives the
// generic Properties panel in the Right Sidebar - one renderer, not one
// bespoke UI per block).
import Hero from "./Hero.vue";
import Navbar from "./Navbar.vue";
import Features from "./Features.vue";
import RestaurantMenu from "./RestaurantMenu.vue";
import Gallery from "./Gallery.vue";
import Testimonials from "./Testimonials.vue";
import Faq from "./Faq.vue";
import Contact from "./Contact.vue";
import Cta from "./Cta.vue";
import Footer from "./Footer.vue";
import Pricing from "./Pricing.vue";
import Team from "./Team.vue";
import Blog from "./Blog.vue";
import Portfolio from "./Portfolio.vue";
import Video from "./Video.vue";
import Map from "./Map.vue";
import Newsletter from "./Newsletter.vue";
import ImageGrid from "./ImageGrid.vue";
import Cards from "./Cards.vue";
import Statistics from "./Statistics.vue";
import MenuShowcase from "./MenuShowcase.vue";
import ComboShowcase from "./ComboShowcase.vue";
import OpeningHours from "./OpeningHours.vue";
import BranchLocator from "./BranchLocator.vue";
import AnnouncementBar from "./AnnouncementBar.vue";
import CookieBanner from "./CookieBanner.vue";
import Breadcrumb from "./Breadcrumb.vue";
import FloatingWhatsApp from "./FloatingWhatsApp.vue";
import FloatingCallButton from "./FloatingCallButton.vue";
import FloatingCart from "./FloatingCart.vue";
import CheckoutForm from "./CheckoutForm.vue";
import OrderConfirmation from "./OrderConfirmation.vue";

export const BLOCK_REGISTRY = {
  Navbar: {
    label: "Navbar",
    icon: "mdi-view-headline",
    category: "Navigation",
    component: Navbar,
    defaultProps: {
      logoText: "Your Brand",
      logoImageUrl: "",
      links: [
        { label: "Home", href: "#home" },
        { label: "Menu", href: "#menu" },
        { label: "Contact", href: "#contact" },
      ],
      ctaLabel: "Order Now",
      ctaLink: "#menu",
    },
    propsSchema: [
      { key: "logoText", label: "Logo Text", type: "text" },
      { key: "logoImageUrl", label: "Logo Image", type: "image" },
      { key: "links", label: "Nav Links", type: "list", itemFields: [
        { key: "label", label: "Label", type: "text" },
        { key: "href", label: "Link", type: "text" },
      ] },
      { key: "ctaLabel", label: "Button Label", type: "text" },
      { key: "ctaLink", label: "Button Link", type: "text" },
      { key: "variant", label: "Header Style", type: "select", options: ["default", "corporate", "minimal", "center-logo", "split-menu", "transparent-hero"] },
    ],
  },
  Hero: {
    label: "Hero",
    icon: "mdi-image-text",
    category: "Common",
    component: Hero,
    defaultProps: {
      tag: "Welcome to",
      headline: "Your Headline Here",
      subtext: "A short, compelling subtext about your business.",
      imageUrl: "",
      ctaLabel: "Get Started",
      ctaLink: "#",
      align: "left",
    },
    propsSchema: [
      { key: "tag", label: "Eyebrow Tag", type: "text" },
      { key: "headline", label: "Headline", type: "text" },
      { key: "subtext", label: "Subtext", type: "textarea" },
      { key: "imageUrl", label: "Image", type: "image" },
      { key: "ctaLabel", label: "Button Label", type: "text" },
      { key: "ctaLink", label: "Button Link", type: "text" },
      { key: "align", label: "Alignment", type: "select", options: ["left", "center"] },
    ],
  },
  Features: {
    label: "Features",
    icon: "mdi-star-four-points",
    category: "Common",
    component: Features,
    defaultProps: {
      title: "Why Choose Us",
      subtitle: "",
      items: [
        { icon: "mdi-check-circle", title: "Feature One", body: "Describe this feature." },
        { icon: "mdi-check-circle", title: "Feature Two", body: "Describe this feature." },
        { icon: "mdi-check-circle", title: "Feature Three", body: "Describe this feature." },
      ],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "items", label: "Items", type: "list", itemFields: [
        { key: "icon", label: "Icon (mdi-*)", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "body", label: "Body", type: "textarea" },
      ] },
    ],
  },
  RestaurantMenu: {
    label: "Restaurant / Cafe Menu",
    icon: "mdi-silverware-fork-knife",
    category: "Restaurant",
    component: RestaurantMenu,
    defaultProps: {
      title: "Our Menu",
      subtitle: "",
      categories: [
        {
          name: "Starters",
          items: [{ name: "Sample Dish", description: "A short description.", price: "0", imageUrl: "" }],
        },
      ],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "categories", label: "Categories", type: "list", itemFields: [
        { key: "name", label: "Category Name", type: "text" },
        { key: "items", label: "Items", type: "list", itemFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "price", label: "Price", type: "text" },
          { key: "imageUrl", label: "Image", type: "image" },
        ] },
      ] },
    ],
  },
  Gallery: {
    label: "Gallery",
    icon: "mdi-image-multiple",
    category: "Common",
    component: Gallery,
    defaultProps: {
      title: "Gallery",
      images: [{ url: "", caption: "" }, { url: "", caption: "" }, { url: "", caption: "" }],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "images", label: "Images", type: "list", itemFields: [
        { key: "url", label: "Image", type: "image" },
        { key: "caption", label: "Caption", type: "text" },
      ] },
    ],
  },
  Testimonials: {
    label: "Testimonials",
    icon: "mdi-comment-quote",
    category: "Common",
    component: Testimonials,
    defaultProps: {
      title: "What People Say",
      items: [{ quote: "This place is fantastic!", author: "Happy Customer", role: "" }],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Testimonials", type: "list", itemFields: [
        { key: "quote", label: "Quote", type: "textarea" },
        { key: "author", label: "Author", type: "text" },
        { key: "role", label: "Role / Source", type: "text" },
      ] },
    ],
  },
  Faq: {
    label: "FAQ",
    icon: "mdi-frequently-asked-questions",
    category: "Common",
    component: Faq,
    defaultProps: {
      title: "Frequently Asked Questions",
      items: [{ question: "Your question here?", answer: "Your answer here." }],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Questions", type: "list", itemFields: [
        { key: "question", label: "Question", type: "text" },
        { key: "answer", label: "Answer", type: "textarea" },
      ] },
    ],
  },
  Contact: {
    label: "Contact",
    icon: "mdi-map-marker",
    category: "Common",
    component: Contact,
    defaultProps: {
      title: "Get in Touch",
      subtitle: "",
      address: "",
      phone: "",
      email: "",
      mapEmbedUrl: "",
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "mapEmbedUrl", label: "Map Embed URL", type: "text" },
    ],
  },
  Cta: {
    label: "Call To Action",
    icon: "mdi-bullhorn",
    category: "Common",
    component: Cta,
    defaultProps: {
      title: "Ready to get started?",
      subtitle: "",
      ctaLabel: "Contact Us",
      ctaLink: "#contact",
      background: "primary",
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "ctaLabel", label: "Button Label", type: "text" },
      { key: "ctaLink", label: "Button Link", type: "text" },
      { key: "background", label: "Background", type: "select", options: ["primary", "dark", "light"] },
    ],
  },
  Footer: {
    label: "Footer",
    icon: "mdi-page-layout-footer",
    category: "Footer",
    component: Footer,
    defaultProps: {
      logoText: "Your Brand",
      tagline: "",
      links: [{ label: "Home", href: "#home" }],
      socialLinks: [{ icon: "mdi-instagram", href: "#" }],
      copyrightText: `© ${new Date().getFullYear()} Your Brand. All rights reserved.`,
    },
    propsSchema: [
      { key: "logoText", label: "Logo Text", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "links", label: "Links", type: "list", itemFields: [
        { key: "label", label: "Label", type: "text" },
        { key: "href", label: "Link", type: "text" },
      ] },
      { key: "socialLinks", label: "Social Links", type: "list", itemFields: [
        { key: "icon", label: "Icon (mdi-*)", type: "text" },
        { key: "href", label: "Link", type: "text" },
      ] },
      { key: "copyrightText", label: "Copyright Text", type: "text" },
      { key: "variant", label: "Footer Style", type: "select", options: ["simple", "corporate", "map", "newsletter"] },
      { key: "mapEmbedUrl", label: "Map Embed URL (map variant)", type: "text" },
      { key: "newsletterTitle", label: "Newsletter Title (newsletter variant)", type: "text" },
    ],
  },
  Pricing: {
    label: "Pricing",
    icon: "mdi-currency-usd",
    category: "Common",
    component: Pricing,
    defaultProps: {
      title: "Simple Pricing",
      subtitle: "",
      plans: [
        { name: "Basic", price: "₹999", period: "mo", features: [{ value: "Feature one" }, { value: "Feature two" }], ctaLabel: "Choose Plan", ctaLink: "#", highlighted: false },
        { name: "Pro", price: "₹1999", period: "mo", features: [{ value: "Everything in Basic" }, { value: "Feature three" }], ctaLabel: "Choose Plan", ctaLink: "#", highlighted: true },
      ],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "plans", label: "Plans", type: "list", itemFields: [
        { key: "name", label: "Plan Name", type: "text" },
        { key: "price", label: "Price", type: "text" },
        { key: "period", label: "Billing Period", type: "text" },
        { key: "features", label: "Features", type: "list", itemFields: [{ key: "value", label: "Feature", type: "text" }] },
        { key: "ctaLabel", label: "Button Label", type: "text" },
        { key: "ctaLink", label: "Button Link", type: "text" },
        { key: "highlighted", label: "Highlighted", type: "select", options: ["false", "true"] },
      ] },
    ],
  },
  Team: {
    label: "Team",
    icon: "mdi-account-group",
    category: "Common",
    component: Team,
    defaultProps: {
      title: "Meet the Team",
      subtitle: "",
      members: [
        { name: "Team Member", role: "Role", photoUrl: "", bio: "" },
        { name: "Team Member", role: "Role", photoUrl: "", bio: "" },
      ],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "members", label: "Members", type: "list", itemFields: [
        { key: "name", label: "Name", type: "text" },
        { key: "role", label: "Role", type: "text" },
        { key: "photoUrl", label: "Photo", type: "image" },
        { key: "bio", label: "Bio", type: "textarea" },
      ] },
    ],
  },
  Blog: {
    label: "Blog",
    icon: "mdi-post-outline",
    category: "Common",
    component: Blog,
    defaultProps: {
      title: "Latest Updates",
      subtitle: "",
      posts: [{ title: "Post Title", excerpt: "A short excerpt.", imageUrl: "", date: "", link: "#" }],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "posts", label: "Posts", type: "list", itemFields: [
        { key: "title", label: "Title", type: "text" },
        { key: "excerpt", label: "Excerpt", type: "textarea" },
        { key: "imageUrl", label: "Image", type: "image" },
        { key: "date", label: "Date", type: "text" },
        { key: "link", label: "Link", type: "text" },
      ] },
    ],
  },
  Portfolio: {
    label: "Portfolio",
    icon: "mdi-briefcase-outline",
    category: "Common",
    component: Portfolio,
    defaultProps: {
      title: "Our Work",
      subtitle: "",
      items: [{ title: "Project Name", category: "Category", imageUrl: "", link: "#" }],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "items", label: "Items", type: "list", itemFields: [
        { key: "title", label: "Title", type: "text" },
        { key: "category", label: "Category", type: "text" },
        { key: "imageUrl", label: "Image", type: "image" },
        { key: "link", label: "Link", type: "text" },
      ] },
    ],
  },
  Video: {
    label: "Video",
    icon: "mdi-play-circle-outline",
    category: "Common",
    component: Video,
    defaultProps: { title: "Watch Our Story", subtitle: "", videoUrl: "", posterUrl: "" },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "videoUrl", label: "Video Embed URL", type: "text" },
      { key: "posterUrl", label: "Poster Image", type: "image" },
    ],
  },
  Map: {
    label: "Map",
    icon: "mdi-map-marker-outline",
    category: "Common",
    component: Map,
    defaultProps: { title: "Find Us", subtitle: "", address: "", mapEmbedUrl: "" },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "mapEmbedUrl", label: "Map Embed URL", type: "text" },
    ],
  },
  Newsletter: {
    label: "Newsletter",
    icon: "mdi-email-newsletter",
    category: "Common",
    component: Newsletter,
    defaultProps: { title: "Stay in the loop", subtitle: "Get updates straight to your inbox.", placeholder: "Enter your email", ctaLabel: "Subscribe" },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "placeholder", label: "Input Placeholder", type: "text" },
      { key: "ctaLabel", label: "Button Label", type: "text" },
    ],
  },
  ImageGrid: {
    label: "Image Grid",
    icon: "mdi-grid",
    category: "Common",
    component: ImageGrid,
    defaultProps: {
      title: "Gallery",
      columns: "3",
      images: [{ url: "" }, { url: "" }, { url: "" }],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "columns", label: "Columns", type: "select", options: ["2", "3", "4"] },
      { key: "images", label: "Images", type: "list", itemFields: [{ key: "url", label: "Image", type: "image" }] },
    ],
  },
  Cards: {
    label: "Cards",
    icon: "mdi-card-multiple-outline",
    category: "Common",
    component: Cards,
    defaultProps: {
      title: "Explore",
      subtitle: "",
      cards: [{ title: "Card Title", body: "Card description.", imageUrl: "", link: "#" }],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "cards", label: "Cards", type: "list", itemFields: [
        { key: "title", label: "Title", type: "text" },
        { key: "body", label: "Body", type: "textarea" },
        { key: "imageUrl", label: "Image", type: "image" },
        { key: "link", label: "Link", type: "text" },
      ] },
      { key: "variant", label: "Card Style", type: "select", options: ["default", "compact", "horizontal", "overlay"] },
    ],
  },
  Statistics: {
    label: "Statistics",
    icon: "mdi-chart-box-outline",
    category: "Common",
    component: Statistics,
    defaultProps: {
      title: "",
      subtitle: "",
      stats: [
        { value: "500+", label: "Happy Customers" },
        { value: "10", label: "Years of Service" },
        { value: "50+", label: "Menu Items" },
        { value: "4.8", label: "Average Rating" },
      ],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "stats", label: "Stats", type: "list", itemFields: [
        { key: "value", label: "Value", type: "text" },
        { key: "label", label: "Label", type: "text" },
      ] },
    ],
  },
  MenuShowcase: {
    label: "Menu Showcase",
    icon: "mdi-food",
    category: "Restaurant",
    component: MenuShowcase,
    // apiSchema marks this block as data-source-capable - see dataSource.js
    // and PropertiesPanel.vue's "Data Source" section, shown only for blocks
    // that declare this.
    apiSchema: { source: "menu" },
    defaultProps: {
      title: "Our Menu",
      subtitle: "",
      variant: "grid",
      filter: "all",
      categories: [
        { name: "Starters", items: [{ name: "Sample Dish", description: "A short description.", price: "0", imageUrl: "" }] },
      ],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "variant", label: "Layout", type: "select", options: ["grid", "list"] },
      { key: "filter", label: "Filter (dynamic mode only)", type: "select", options: ["all", "recommended", "popular"] },
      { key: "categories", label: "Categories (static mode)", type: "list", itemFields: [
        { key: "name", label: "Category Name", type: "text" },
        { key: "items", label: "Items", type: "list", itemFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "price", label: "Price", type: "text" },
          { key: "imageUrl", label: "Image", type: "image" },
        ] },
      ] },
    ],
  },
  ComboShowcase: {
    label: "Combo Showcase",
    icon: "mdi-food-variant",
    category: "QSR",
    component: ComboShowcase,
    defaultProps: {
      title: "Combo Deals",
      subtitle: "",
      combos: [
        { name: "Family Combo", description: "Serves 4", price: "499", imageUrl: "", includes: [{ value: "2 Burgers" }, { value: "1 Large Fries" }, { value: "2 Drinks" }] },
      ],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "combos", label: "Combos", type: "list", itemFields: [
        { key: "name", label: "Name", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "price", label: "Price", type: "text" },
        { key: "imageUrl", label: "Image", type: "image" },
        { key: "includes", label: "Includes", type: "list", itemFields: [{ key: "value", label: "Item", type: "text" }] },
      ] },
    ],
  },
  OpeningHours: {
    label: "Opening Hours",
    icon: "mdi-clock-outline",
    category: "Restaurant",
    component: OpeningHours,
    apiSchema: { source: "branches" },
    defaultProps: {
      title: "Opening Hours",
      subtitle: "",
      branches: [{ name: "Main Branch", address: "", openingTime: "09:00", closingTime: "22:00" }],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "branches", label: "Branches (static mode)", type: "list", itemFields: [
        { key: "name", label: "Branch Name", type: "text" },
        { key: "address", label: "Address", type: "text" },
        { key: "openingTime", label: "Opens", type: "text" },
        { key: "closingTime", label: "Closes", type: "text" },
      ] },
    ],
  },
  BranchLocator: {
    label: "Branch Locator",
    icon: "mdi-map-marker-radius",
    category: "Restaurant",
    component: BranchLocator,
    apiSchema: { source: "branches" },
    defaultProps: {
      title: "Find Us",
      subtitle: "",
      branches: [{ name: "Main Branch", address: "", openingTime: "09:00", closingTime: "22:00" }],
    },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "branches", label: "Branches (static mode)", type: "list", itemFields: [
        { key: "name", label: "Branch Name", type: "text" },
        { key: "address", label: "Address", type: "text" },
        { key: "openingTime", label: "Opens", type: "text" },
        { key: "closingTime", label: "Closes", type: "text" },
      ] },
    ],
  },
  AnnouncementBar: {
    label: "Announcement Bar",
    icon: "mdi-bullhorn-outline",
    category: "Header",
    component: AnnouncementBar,
    defaultProps: { message: "Free delivery on orders above ₹499!", linkLabel: "", linkUrl: "#", dismissible: "false", bgColor: "" },
    propsSchema: [
      { key: "message", label: "Message", type: "text" },
      { key: "linkLabel", label: "Link Label", type: "text" },
      { key: "linkUrl", label: "Link URL", type: "text" },
      { key: "dismissible", label: "Dismissible", type: "select", options: ["false", "true"] },
      { key: "bgColor", label: "Background Color", type: "color" },
    ],
  },
  CookieBanner: {
    label: "Cookie Banner",
    icon: "mdi-cookie-outline",
    category: "Footer",
    component: CookieBanner,
    defaultProps: { message: "We use cookies to improve your experience on this site.", acceptLabel: "Accept" },
    propsSchema: [
      { key: "message", label: "Message", type: "textarea" },
      { key: "acceptLabel", label: "Accept Button Label", type: "text" },
    ],
  },
  Breadcrumb: {
    label: "Breadcrumb",
    icon: "mdi-page-layout-header",
    category: "Navigation",
    component: Breadcrumb,
    defaultProps: { homeLabel: "Home", homeHref: "/", currentLabel: "" },
    propsSchema: [
      { key: "homeLabel", label: "Home Label", type: "text" },
      { key: "homeHref", label: "Home Link", type: "text" },
      { key: "currentLabel", label: "Current Page Label (auto if blank)", type: "text" },
    ],
  },
  FloatingWhatsApp: {
    label: "Floating WhatsApp",
    icon: "mdi-whatsapp",
    category: "Navigation",
    component: FloatingWhatsApp,
    defaultProps: { phone: "", message: "Hi! I'd like to know more." },
    propsSchema: [
      { key: "phone", label: "Phone (with country code)", type: "text" },
      { key: "message", label: "Prefilled Message", type: "text" },
    ],
  },
  FloatingCallButton: {
    label: "Floating Call Button",
    icon: "mdi-phone-outline",
    category: "Navigation",
    component: FloatingCallButton,
    defaultProps: { phone: "" },
    propsSchema: [
      { key: "phone", label: "Phone Number", type: "text" },
    ],
  },
  FloatingCart: {
    label: "Floating Cart",
    icon: "mdi-cart-outline",
    category: "Navigation",
    component: FloatingCart,
    defaultProps: { checkoutHref: "/checkout" },
    propsSchema: [
      { key: "checkoutHref", label: "Checkout Page Link", type: "text" },
    ],
  },
  CheckoutForm: {
    label: "Checkout Form",
    icon: "mdi-cash-check",
    category: "QSR",
    component: CheckoutForm,
    // branchId/companyId are auto-injected by DynamicRenderer at render time
    // (see that file's resolvedBlocks) - not meant to be hand-typed, but kept
    // as real editable props so the contract stays uniform with every other
    // block; a tenant CAN override them if they ever need to.
    defaultProps: { title: "Checkout", branchId: "", companyId: "", trackOrderHref: "/order-status" },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
      { key: "trackOrderHref", label: "Order Status Page Link", type: "text" },
    ],
  },
  OrderConfirmation: {
    label: "Order Confirmation",
    icon: "mdi-clipboard-check-outline",
    category: "QSR",
    component: OrderConfirmation,
    defaultProps: { title: "Order Status" },
    propsSchema: [
      { key: "title", label: "Title", type: "text" },
    ],
  },
};

export const BLOCK_TYPES = Object.keys(BLOCK_REGISTRY);

export function createBlock(type) {
  const def = BLOCK_REGISTRY[type];
  if (!def) throw new Error(`Unknown block type: ${type}`);
  return { type, props: JSON.parse(JSON.stringify(def.defaultProps)) };
}
