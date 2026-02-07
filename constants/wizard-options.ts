import type {
  WebsiteTypeConfig,
  StyleOption,
  LayoutOption,
  ComponentOption,
  PlatformConfig,
} from '@/lib/types';

/**
 * Website type options for Step 1
 */
export const WEBSITE_TYPES: WebsiteTypeConfig[] = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Single-page site for product/service promotion with clear call-to-action',
    icon: '🎯',
    preview: '/images/website-types/Landing Page.png',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Online store with product catalog, shopping cart, and checkout',
    icon: '🛍️',
    preview: '/images/website-types/E-Commerce.png',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Showcase work, projects, and professional experience',
    icon: '💼',
    preview: '/images/website-types/Portfolio.png',
  },
  {
    id: 'saas',
    name: 'SaaS Dashboard',
    description: 'Software-as-a-service platform with features and pricing',
    icon: '📊',
    preview: '/images/website-types/SaaS Dashboard.png',
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Content-focused site with articles, categories, and comments',
    icon: '📝',
    preview: '/images/website-types/Blog.png',
  },
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Technical documentation with search and navigation',
    icon: '📚',
    preview: '/images/website-types/Documentation.png',
  },
];

/**
 * Visual style options for Step 2
 */
export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean, spacious design with focus on content and whitespace',
    preview: '/images/styles/modern-minimal.webp',
  },
  {
    id: 'bold-dramatic',
    name: 'Bold & Dramatic',
    description: 'High contrast, vibrant colors, and striking typography',
    preview: '/images/styles/bold-dramatic.webp',
  },
  {
    id: 'corporate',
    name: 'Corporate Professional',
    description: 'Traditional business aesthetic with trust and credibility',
    preview: '/images/styles/corporate.webp',
  },
  {
    id: 'futuristic-tech',
    name: 'Futuristic & Tech',
    description: 'Innovative design with gradients, glass effects, and animations',
    preview: '/images/styles/futuristic.webp',
  },
  {
    id: 'playful-fun',
    name: 'Playful & Fun',
    description: 'Bright colors, rounded shapes, and friendly illustrations',
    preview: '/images/styles/playful.webp',
  },
  {
    id: 'luxury',
    name: 'Luxury & Elegant',
    description: 'Sophisticated with premium fonts, subtle animations, and refinement',
    preview: '/images/styles/luxury.webp',
  },
];

/**
 * Layout options for Step 3
 */
export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'hero-fullwidth',
    name: 'Full-Width Hero',
    description: 'Large hero section spanning full viewport with centered content',
    thumbnail: '/images/layouts/hero-fullwidth.webp',
  },
  {
    id: 'hero-split',
    name: 'Split-Screen Hero',
    description: 'Hero divided into two columns - content on left, visual on right',
    thumbnail: '/images/layouts/hero-split.webp',
  },
  {
    id: 'bento-grid',
    name: 'Bento Box Grid',
    description: 'Modern grid layout with cards of varying sizes',
    thumbnail: '/images/layouts/bento-grid.webp',
  },
  {
    id: 'sidebar',
    name: 'Sidebar Layout',
    description: 'Fixed navigation sidebar with main content area',
    thumbnail: '/images/layouts/sidebar.webp',
  },
];

/**
 * Component options for Step 4 (categorized)
 */
export const COMPONENT_OPTIONS: ComponentOption[] = [
  // Navigation
  {
    id: 'navbar',
    name: 'Navigation Bar',
    category: 'navigation',
    description: 'Top navigation with logo and links',
    required: true,
  },
  {
    id: 'footer',
    name: 'Footer',
    category: 'navigation',
    description: 'Bottom section with links and information',
    required: true,
  },
  {
    id: 'sidebar-nav',
    name: 'Sidebar Navigation',
    category: 'navigation',
    description: 'Side navigation menu',
  },

  // Content
  {
    id: 'hero',
    name: 'Hero Section',
    category: 'content',
    description: 'Large introductory section at the top',
    required: true,
  },
  {
    id: 'features',
    name: 'Features Grid',
    category: 'content',
    description: 'Grid showcasing key features',
  },
  {
    id: 'about',
    name: 'About Section',
    category: 'content',
    description: 'Company or project information',
  },
  {
    id: 'gallery',
    name: 'Image Gallery',
    category: 'content',
    description: 'Grid or carousel of images',
  },
  {
    id: 'blog-feed',
    name: 'Blog Feed',
    category: 'content',
    description: 'List or grid of blog posts',
  },

  // Marketing
  {
    id: 'testimonials',
    name: 'Testimonials',
    category: 'marketing',
    description: 'Customer reviews and feedback',
  },
  {
    id: 'pricing',
    name: 'Pricing Table',
    category: 'marketing',
    description: 'Pricing plans comparison',
  },
  {
    id: 'cta',
    name: 'Call-to-Action',
    category: 'marketing',
    description: 'Prominent action section',
  },
  {
    id: 'stats',
    name: 'Statistics',
    category: 'marketing',
    description: 'Key numbers and metrics',
  },

  // Forms
  {
    id: 'contact-form',
    name: 'Contact Form',
    category: 'forms',
    description: 'Form for user inquiries',
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    category: 'forms',
    description: 'Email subscription form',
  },
  {
    id: 'search',
    name: 'Search Bar',
    category: 'forms',
    description: 'Search functionality',
  },

  // Other
  {
    id: 'faq',
    name: 'FAQ Section',
    category: 'other',
    description: 'Frequently asked questions',
  },
  {
    id: 'team',
    name: 'Team Members',
    category: 'other',
    description: 'Display team profiles',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    category: 'other',
    description: 'Chronological events or milestones',
  },
];

/**
 * Platform configurations
 */
export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'bolt',
    name: 'Bolt.new',
    icon: '⚡',
    description: 'Quick prototypes with Vite + React',
  },
  {
    id: 'lovable',
    name: 'Lovable',
    icon: '💜',
    description: 'Full-stack apps with Supabase',
  },
  {
    id: 'v0',
    name: 'v0 by Vercel',
    icon: '▲',
    description: 'UI components with shadcn',
  },
];

/**
 * Helper functions
 */

export function getWebsiteTypeById(id: string): WebsiteTypeConfig | undefined {
  return WEBSITE_TYPES.find((type) => type.id === id);
}

export function getStyleOptionById(id: string): StyleOption | undefined {
  return STYLE_OPTIONS.find((style) => style.id === id);
}

export function getLayoutOptionById(id: string): LayoutOption | undefined {
  return LAYOUT_OPTIONS.find((layout) => layout.id === id);
}

export function getComponentOptionById(id: string): ComponentOption | undefined {
  return COMPONENT_OPTIONS.find((component) => component.id === id);
}

export function getRequiredComponents(): ComponentOption[] {
  return COMPONENT_OPTIONS.filter((component) => component.required);
}

export function getComponentsByCategory(category: ComponentOption['category']): ComponentOption[] {
  return COMPONENT_OPTIONS.filter((component) => component.category === category);
}
