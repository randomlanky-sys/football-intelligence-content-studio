# Football Intelligence & Content Studio - DESIGN.md

## Visual Identity
A premium, sophisticated dark-mode design system that conveys intelligence, innovation, and professional football analysis excellence.

## Color Palette
### Primary Colors
- **Background**: #0A0A0A (Near-black, pure depth)
- **Surface**: #111111 (Elevated surfaces, cards, panels)
- **Accent**: #FCD34D (Premium gold - excellence, achievement, premium tier)
- **Secondary Accent**: #FFFFFF (Pure white for contrast and readability)
- **Success**: #10B981 (Emerald - positive actions, confirmations)
- **Warning**: #F59E0B (Amber - alerts, attention needed)
- **Error**: #EF4444 (Red - critical errors, destructive actions)

### Neutral Spectrum
- **Text Primary**: #F8FAFC (Near-white for maximum readability)
- **Text Secondary**: #CBD5E1 (Soft gray for secondary text)
- **Text Tertiary**: #64748M (Muted gray for disabled/hint text)
- **Border**: #2D3748 (Subtle definition between surfaces)
- **Hover**: #1E293B (Slight lift for interactive elements)

## Typography
### Type Scale (rem-based, 16px base)
- **Display**: 4.5rem (72px) - Hero headings, major statements
- **Heading 1**: 3rem (48px) - Section titles, important declarations
- **Heading 2**: 2.25rem (36px) - Subsection headers, feature titles
- **Heading 3**: 1.875rem (30px) - Card titles, metric labels
- **Heading 4**: 1.5rem (24px) - Form labels, table headers
- **Body Large**: 1.25rem (20px) - Body emphasis, quote text
- **Body**: 1rem (16px) - Primary body text, paragraph copy
- **Body Small**: 0.875rem (14px) - Captions, auxiliary information
- **Caption**: 0.75rem (12px) - Legal text, timestamps, metadata

### Font Families
- **Headings**: "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif
  - *Rationale*: Modern geometric sans with excellent readability and premium feel
- **Body**: "Inter", -apple-system, BlinkMacSystemFont, sans-serif
  - *Rationale*: Optimized for screen readability, neutral and professional
- **Numbers**: "IBM Plex Mono", monospace
  - *Rationale*: Technical precision for stats, timestamps, data displays
- **Accent**: "Cormorant Garamond", serif
  - *Rationale*: Elegant serif for quotes, testimonials, special emphasis

## Spacing System (8px grid)
- **XXXS**: 2px (hairlines, micro-spacing)
- **XXS**: 4px (tight compact spacing)
- **XS**: 8px (standard spacing unit)
- **S**: 16px (comfortable spacing)
- **M**: 24px (section spacing, card padding)
- **L**: 32px (major section breaks, hero padding)
- **XL**: 48px (page margins, major divisions)
- **XXL**: 64px (hero sections, full-bleed areas)
- **XXXL**: 80px (ultra-premium spacing, luxurious whitespace)

## Border Radius
- **None**: 0px (sharp edges for technical elements)
- **Sm**: 4px (subtle rounding, inputs, buttons)
- **Md**: 8px (standard cards, panels, containers)
- **Lg**: 16px (premium cards, modals, elevated surfaces)
- **Xl**: 24px (extra-large containers, special features)
- **Full**: 9999px (pills, circles, avatars)

## Shadows (Premium Elevation)
- **None**: 0 0 0 0 transparent
- **Xs**: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- **Sm**: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
- **Md**: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- **Lg**: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- **Xl**: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.01)
- **2xl**: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
- **Premium**: 0 30px 60px -15px rgba(0, 0, 0, 0.3) (for floating elements, hero cards)

## Component Specifications

### Buttons
#### Primary
- Background: #FCD34D (Premium gold)
- Text: #0A0A0A (Near-black for contrast)
- Hover: #EAB308 (Darker gold on hover)
- Active: #D97706 (Even darker on press)
- Disabled: #6B7280 (Muted gray)
- Border: None (flat design)
- Padding: 0.75rem 1.5rem (12px 24px)
- Border Radius: 8px
- Font Weight: 600 (Semi-bold)
- Transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)
- Shadow: Md elevation

#### Secondary
- Background: Transparent
- Text: #FCD34D (Premium gold)
- Border: 2px solid #FCD34D
- Hover Background: rgba(252, 211, 77, 0.1)
- Hover Border: #FCD34D
- Active Background: rgba(252, 211, 77, 0.2)
- Disabled: #6B7280 (text and border)
- Padding: 0.75rem 1.5rem
- Border Radius: 8px
- Font Weight: 500 (Medium)

#### Ghost
- Background: Transparent
- Text: #F8FAFC (Near-white)
- Border: None
- Hover Background: rgba(248, 250, 252, 0.05)
- Active Background: rgba(248, 250, 252, 0.1)
- Disabled: #64748B (40% opacity)
- Padding: 0.75rem 1.5rem
- Border Radius: 8px
- Font Weight: 500

### Cards
- Background: #111111 (Surface color)
- Border: 1px solid #2D3748 (Subtle definition)
- Border Radius: 16px (Premium rounding)
- Padding: 24px (M spacing)
- Shadow: Lg elevation
- Hover Shadow: Xl elevation (lift on hover)
- Transition: transform 0.3s ease, box-shadow 0.3s ease
- Hover Transform: translateY(-4px) (subtle lift)

### Inputs & Textareas
- Background: #111111 (Surface)
- Border: 2px solid #2D3748
- Border Radius: 8px
- Padding: 0.75rem 1rem (12px 16px)
- Font Size: 1rem (16px)
- Color: #F8FAFC (Text primary)
- Placeholder Color: #94A3B8 (60% opacity)
- Focus Border: #FCD34D (Premium gold accent)
- Focus Ring: 0 0 0 3px rgba(252, 211, 77, 0.25)
- Disabled Background: #1E293B
- Disabled Border: #64748B
- Disabled Text: #64748B
- Transition: all 0.2s ease

### Navigation
- Background: #0A0A0A (Depth black)
- Border Bottom: 1px solid #2D3748
- Height: 4rem (64px)
- Padding: 0 1.5rem (0 24px)
- Link Color: #F8FAFC (Text primary)
- Link Hover: #FCD34D (Premium gold)
- Link Active: #FCD34D (Persistent accent)
- Link Disabled: #64748B

## Imagery & Icons
### Photography Style
- **Lighting**: Dramatic, high-contrast with deep shadows and bright highlights
- **Composition**: Rule of thirds, dynamic angles, motion blur for action shots
- **Color Treatment**: Slightly desaturated with crushed blacks, preserved highlights
- **Subject Focus**: Players in motion, tactical formations, close-ups of technique
- **Treatment**: Cinematic grade, teal-and-orange split toning subtle variant

### Icon System
- **Style**: Line icons with 2px stroke weight, rounded terminals
- **Color**: #F8FAFC (Primary), #FCD34D (Active/Accent)
- **Size**: 20x20px (standard), 24x24px (large), 16x16px (small)
- **Hover**: Scale to 1.1x, color shift to #FCD34D
- **Animation**: 0.2s ease for all state transitions

## Motion & Animation
### Principles
- **Purposeful**: Every animation serves a clear functional purpose
- **Natural**: Physics-based easing, mass and weight considerations
- **Performant**: GPU-accelerated transforms and opacity changes
- **Consistent**: Same easing curves and durations across the interface

### Easing Curves
- **Standard**: cubic-bezier(0.4, 0, 0.2, 1) (Material UI standard)
- **Entrance**: cubic-bezier(0.16, 1, 0.3, 1) (Soft exit, energetic entrance)
- **Exit**: cubic-bezier(0.4, 0, 0.6, 1) (Gentle decay)
- **Motion Path**: cubic-bezier(0.68, -0.55, 0.265, 1.55) (Elastic for playful elements)

### Duration
- **Fast**: 150ms (micro-interactions, button presses)
- **Normal**: 250ms (standard transitions, fades)
- **Slow**: 350ms (page transitions, modal entrances)
- **Stagger**: 50ms (for lists, grid items)

### Specific Animations
- **Button Press**: Scale 0.97 → 1.00 (150ms fast ease)
- **Card Hover**: TranslateY(-4px) + Shadow lift (250ms normal ease)
- **Modal Entrance**: Scale 0.95 → 1.00 + Fade 0→1 (350ms slow ease)
- **Toast Slide**: TranslateX(100%) → 0% + Fade 0→1 (250ms normal)
- **Progress Bar**: Smooth width transition (250ms normal ease)
- **Data Update**: Pulse scale 1.0 → 1.05 → 1.0 (150ms fast ease)

## Accessibility (WCAG 2.1 AA)
### Contrast Ratios
- **Text**: Minimum 4.5:1 (AA for normal text)
- **Large Text**: Minimum 3:1 (AA for 18pt+ bold or 24pt+ regular)
- **UI Components**: Minimum 3:1 (borders, icons, form elements)
- **Graphical Objects**: Minimum 3:1 (charts, graphs, icons)

### Touch Targets
- **Minimum**: 44x44px (minimum tappable area)
- **Recommended**: 48x48px (comfortable tappable area)
- **Spacing**: 8px minimum between interactive elements

### Focus Management
- **Visible Focus**: 2px solid #FCD34D (Premium gold outline)
- **Focus Ring Offset**: 2px from element edge
- **Focus Visibility**: Always visible, never hidden
- **Logical Order**: DOM order matches visual and reading order

### Screen Reader Support
- **Semantic HTML**: Proper use of heading hierarchy, landmarks, labels
- **ARIA Labels**: Descriptive labels for icon-only buttons
- **Live Regions**: Status updates for asynchronous operations
- **Skip Links**: "Skip to main content" for keyboard users

## Responsive Breakpoints
- **Mobile**: < 640px (Portrait phones)
- **Tablet**: ≥ 640px (Landscape phones, small tablets)
- **Desktop**: ≥ 1024px (Standard desktops, laptops)
- **Wide**: ≥ 1280px (Large screens, ultra-wide)
- **Cinematic**: ≥ 1920px (Full HD+, immersive experiences)

## Page-Specific Guidelines

### Landing Page (Hero Section)
- **Background**: Deep space/nebula aesthetic with subtle star field
- **Overlay**: Gradient from transparent to #0A0A0A (bottom to top)
- **Content Area**: Maximum width 1280px, centered
- **Padding**: Top: 96px, Bottom: 96px, Sides: 24px
- **Hero Heading**: 4.5rem (72px) Space Grotesk, weight 800
- **Subheading**: 1.5rem (24px) Inter, weight 400, line-height 1.6
- **CTA Buttons**: Minimum 48px height, ample touch targets
- **Feature Grid**: 3-column on desktop, 2-column tablet, 1-column mobile
- **Card Spacing**: 24px gap between cards
- **Animation**: Staggered entrance (50ms delay per element)

### Project Pages
- **Card Ratio**: 3:4 (portrait orientation for project cards)
- **Hover Reveal**: Additional metadata on hover state
- **Filter Bar**: Persistent during scroll (position: sticky)
- **Empty State**: Illustrated guidance with clear action

## Implementation Notes
### CSS Variables
All design tokens should be exposed as CSS variables for easy theming and overrides:
```css
:root {
  --color-background: #0A0A0A;
  --color-surface: #111111;
  --color-accent: #FCD34D;
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #CBD5E1;
  /* ... all tokens */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  /* ... all radii */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  /* ... all shadows */
  --spacing-xxs: 4px;
  --spacing-xs: 8px;
  /* ... all spacing */
}
```

### Component Architecture
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Reusability**: Components designed for composition and reuse
- **Performance**: Lazy loading, code splitting, image optimization
- **Maintainability**: Consistent naming, clear prop interfaces, JSDoc

### Build Optimization
- **Images**: WebP format, appropriate sizing, lazy loading
- **Fonts**: Subset loading, font-display: swap
- **JavaScript**: Tree-shaking, code splitting, dynamic imports
- **CSS**: Purge unused styles, minimize, critical CSS inline