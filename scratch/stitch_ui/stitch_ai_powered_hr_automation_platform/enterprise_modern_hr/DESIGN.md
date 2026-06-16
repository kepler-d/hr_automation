---
name: Enterprise Modern HR
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001e2f'
  on-tertiary-container: '#008cc7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  container-max: 1440px
  gutter: 24px
  sidebar-width: 260px
---

## Brand & Style
The brand personality is authoritative yet assistive, embodying the role of a "trusted advisor." This design system targets HR professionals and operations leaders who manage sensitive data and high-volume workflows. The UI must evoke feelings of stability, privacy, and precision.

The design style follows a **Corporate Modern** approach with a focus on **Tonal Layering**. It prioritizes high information density without sacrificing clarity. Visual flourishes are used sparingly and only to highlight AI-driven insights or critical actions, ensuring the interface feels like a professional tool rather than a consumer app. The "intelligence" of the platform is signaled through subtle gradients and refined motion, rather than heavy skeuomorphism.

## Colors
The palette is rooted in **Deep Navy (#0F172A)**, used for text and primary navigation to establish institutional trust. **Action Blue (#0EA5E9)** is reserved for primary functional interactions like buttons and links.

**AI-Purple (#6366F1)** is a distinct accent color used exclusively for "Intelligent" features—such as confidence scores, automated suggestions, and AI-generated summaries. **Slate Grays** form the structural foundation, providing a neutral background for data-rich tables and complex dashboards.

## Typography
**Inter** is the primary typeface, chosen for its exceptional legibility in data-heavy environments. To distinguish between standard UI text and technical/system-generated data, **JetBrains Mono** is used for labels, status codes, and confidence percentages.

Hierarchy is enforced through weight rather than size alone. Headlines use a tighter letter-spacing for a modern, authoritative feel. Body text is optimized for long-form reading in employee records and policy documents.

## Layout & Spacing
The design system utilizes a **12-column Fixed Grid** for main content areas on desktop, centered within a max-width of 1440px. The sidebar is fixed at 260px to provide a consistent navigation anchor.

Spacing follows a **4px baseline grid**. For data density, use "Compact" spacing (8px) within tables and "Roomy" spacing (24px) for dashboard cards and page headers. On mobile, gutters reduce to 16px and the layout collapses to a single column with a bottom navigation bar or a condensed hamburger menu.

## Elevation & Depth
Depth is achieved through **Tonal Layers** rather than heavy shadows. The base surface uses a very light slate (#F8FAFC). Cards and containers are raised using a white background and a subtle 1px border (#E2E8F0).

For interactive elements, use **Ambient Shadows**: ultra-soft, low-opacity shadows (4% alpha) with a slight navy tint to maintain the professional aesthetic. When an AI feature is active (like an insight card), use a subtle violet glow or a 2px AI-Purple left-border to indicate "intelligence" level elevation.

## Shapes
The shape language is **Soft (0.25rem)**. This provides a balance between the rigid precision of enterprise software and the approachability of modern AI tools. Large containers like Insight Cards or Upload Zones should use `rounded-lg` (0.5rem), while buttons and input fields stay at the base `rounded` (0.25rem). Status badges and avatars are the only exceptions, using a full "pill" radius.

## Components
- **Data Tables:** High-density with sticky headers. Alternate row striping is used for readability. Action icons (Edit, View) appear on hover.
- **AI Insight Cards:** These feature a distinct `AI-purple` top-border and include a "Confidence Score" using the monospaced label font. They often contain a "Verify" action to keep the human-in-the-loop.
- **Status Badges:** Pill-shaped with low-opacity background fills matching the semantic color (e.g., Green text on light-green background for "Active").
- **Drag-and-Drop Zones:** Dashed borders using `neutral_color_hex` that transition to `secondary_color_hex` (Action Blue) and a thicker border on drag-over.
- **Buttons:** Primary buttons are solid `Action Blue`. Secondary buttons are outlined. AI-trigger buttons use a subtle gradient from Action Blue to AI-Purple.
- **Inputs:** Clean, 1px bordered boxes with clear label hierarchy. Focus states use a 2px blue ring with offset.