import type { ExamplePRD } from '@/lib/types';

/**
 * Example PRD templates for AI analysis
 * Users can click these to instantly populate the textarea
 */
export const EXAMPLE_PRDS: ExamplePRD[] = [
  {
    id: 'saas-project-management',
    title: 'SaaS Project Management Platform',
    description: 'Modern project management tool landing page',
    category: 'SaaS',
    content: `Build a landing page for a modern project management SaaS platform called "TaskFlow".

Target Audience: Small to medium-sized teams looking for simple project management

Key Features to Highlight:
- Real-time collaboration with team members
- Visual Kanban boards and list views
- Time tracking and reporting
- File sharing and comments
- Mobile app available

Design Style:
- Modern, clean, and professional
- Tech-forward with subtle gradients
- Blue and purple color scheme
- Emphasis on simplicity and ease of use

Required Sections:
- Hero section with product screenshot
- Feature highlights with icons
- Pricing comparison table (Free, Pro, Enterprise)
- Customer testimonials from tech companies
- FAQ section
- Newsletter signup form

Technical Details:
- Fully responsive for mobile and desktop
- Fast loading with optimized images
- Clear call-to-action buttons throughout`,
  },
  {
    id: 'ecommerce-fashion',
    title: 'Fashion E-Commerce Store',
    description: 'Trendy online clothing boutique',
    category: 'E-Commerce',
    content: `Create an e-commerce website for "StyleHub" - a trendy online fashion boutique targeting millennials and Gen Z.

Product Focus:
- Contemporary streetwear and casual fashion
- Sustainable and ethical clothing brands
- Accessories and footwear

Design Aesthetic:
- Bold and eye-catching
- High-quality product photography
- Playful yet sophisticated
- Instagram-worthy visual style
- Black, white, and accent colors

Essential Features:
- Large hero banner with seasonal collection
- Product grid with filtering (size, color, price)
- Featured products carousel
- Customer reviews and ratings
- Size guide
- Shopping cart preview
- Newsletter signup (10% off first order)

User Experience:
- Easy navigation between categories
- Quick view product details
- Mobile-optimized shopping experience
- Trust badges (secure checkout, free returns)`,
  },
  {
    id: 'portfolio-photographer',
    title: 'Photography Portfolio',
    description: 'Professional photographer showcase',
    category: 'Portfolio',
    content: `Design a portfolio website for "Alex Chen Photography" - a professional lifestyle and event photographer.

Portfolio Goals:
- Showcase best work in elegant manner
- Attract potential clients for weddings, events, and portraits
- Demonstrate unique artistic style

Style Direction:
- Minimal and elegant
- Let the photography be the star
- Sophisticated black and white theme
- Luxury feel with refined typography

Page Sections:
- Full-screen hero with signature photo
- About the photographer with portrait
- Portfolio gallery organized by category:
  - Weddings
  - Events
  - Portraits
  - Lifestyle
- Client testimonials with photos
- Services and pricing overview
- Contact form for bookings
- Instagram feed integration

Technical Requirements:
- Image-heavy with lazy loading
- Lightbox gallery for viewing photos
- Smooth scroll animations
- Contact form with calendar integration
- Mobile-responsive gallery`,
  },
];

/**
 * Get example PRD by ID
 */
export function getExamplePRDById(id: string): ExamplePRD | undefined {
  return EXAMPLE_PRDS.find((prd) => prd.id === id);
}

/**
 * Get examples by category
 */
export function getExamplePRDsByCategory(category: string): ExamplePRD[] {
  return EXAMPLE_PRDS.filter((prd) => prd.category === category);
}
