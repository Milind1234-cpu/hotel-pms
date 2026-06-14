---
name: Azure Hospitality System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737687'
  outline-variant: '#c3c5d8'
  surface-tint: '#0052de'
  primary: '#0048c6'
  on-primary: '#ffffff'
  primary-container: '#0f5ef7'
  on-primary-container: '#ebedff'
  inverse-primary: '#b5c4ff'
  secondary: '#0d4edc'
  on-secondary: '#ffffff'
  secondary-container: '#3869f6'
  on-secondary-container: '#fffbff'
  tertiary: '#47546b'
  on-tertiary: '#ffffff'
  tertiary-container: '#5f6c84'
  on-tertiary-container: '#e7eeff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174c'
  on-primary-fixed-variant: '#003dab'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#00164f'
  on-secondary-fixed-variant: '#003bb0'
  tertiary-fixed: '#d6e3ff'
  tertiary-fixed-dim: '#bac7e2'
  on-tertiary-fixed: '#0e1c30'
  on-tertiary-fixed-variant: '#3a475d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 24px
  margin: 32px
  sidebar_width: 280px
---

## Brand & Style

The design system is engineered to evoke a sense of high-precision luxury and effortless enterprise control. It targets boutique hotel owners and global hospitality chains who demand the reliability of a banking application with the aesthetic polish of a premium consumer product.

The visual style is a fusion of **Corporate Modern** and **Glassmorphism**. It utilizes the "Stripe-esque" clarity of ample white space and sharp typography, while introducing deep layers of depth through translucent sidebar overlays and soft, luminous shadows. The interface prioritizes a "calm dashboard" philosophy—minimizing visual noise to ensure that critical property data remains the focal point.

**Key Brand Pillars:**
- **Refinement:** Every border radius and shadow is meticulously calibrated to feel substantial and expensive.
- **Precision:** Clear information hierarchy allows for rapid decision-making in high-pressure hospitality environments.
- **Fluidity:** Smooth transitions and subtle gradients signify a high-performance, modern tech stack.

## Colors

The palette is anchored by **Vibrant Blue**, used strategically for primary actions and status indicators. To establish luxury and authority, a **Dark Navy** is utilized for structural elements like sidebars and deep navigation layers, creating a sophisticated "dark core" within a light UI.

- **Primary & Secondary Blues:** Use for buttons, active states, and focus indicators. The secondary blue (#0A4DDB) acts as the hover/active counterpart to the primary.
- **Deep Accents:** The Dark Navy (#071529) is the foundation of the high-end SaaS look, providing high-contrast grounding for the navigation.
- **Surface Strategy:** The background uses a soft #F8FAFC to reduce eye strain, while cards and modals use pure white (#FFFFFF) to pop forward.
- **Functional States:** Success (Emerald), Warning (Amber), and Error (Rose) should be used in desaturated "pastel" variations to maintain the premium feel.

## Typography

This design system relies exclusively on **Inter**, a typeface designed for highly functional user interfaces. The hierarchy is built on a modular scale that emphasizes legibility in dense data views.

- **Headlines:** Use tighter letter-spacing and semi-bold weights to create a "locked-in" professional look.
- **Labels:** Small caps or slightly tracked-out uppercase labels should be used for section headers within sidebars or above input groups.
- **Numbers:** In data tables or room availability grids, use `font-variant-numeric: tabular-nums;` to ensure alignment across different values.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid model**. The navigation sidebar is fixed to the left, while the main dashboard area utilizes a fluid grid with a maximum content width of 1440px to prevent excessive line lengths on ultra-wide monitors.

- **Grid:** Use a 12-column grid for the main content area.
- **Density:** Maintain "High-End Spacing"—don't be afraid of generous 32px or 48px gaps between major sections to let the UI breathe.
- **Breakpoints:**
  - **Mobile (<768px):** Sidebar collapses to a bottom navigation bar or hamburger menu; margins reduce to 16px.
  - **Tablet (768px - 1024px):** Sidebar collapses to icons only (compact mode).
  - **Desktop (>1024px):** Full sidebar and 32px external margins.

## Elevation & Depth

Depth is used to signify importance and "physicality" in the digital space.

- **The Backdrop:** The Dark Navy sidebar (#071529) exists on the lowest Z-index, acting as the foundation.
- **The Surface:** Main content cards use a "Floating Glass" style: white backgrounds with a subtle 1px border (#E2E8F0) and a soft, wide-dispersion shadow (Offset: 0, 10px; Blur: 30px; Color: rgba(7, 21, 41, 0.04)).
- **The Interaction:** Hover states on cards should lift slightly (TranslateY: -4px) and increase the shadow intensity to simulate the element moving closer to the user.
- **Glassmorphism:** Modals and dropdowns should use `backdrop-filter: blur(12px)` with a 80% white opacity to maintain context of the background while focusing the user's attention.

## Shapes

The design system uses a **Large Roundedness** philosophy to soften the enterprise nature of the product.

- **Primary Containers:** Dashboard cards and main content sections use a 24px radius (`rounded-xl` / `rounded-2xl`).
- **Interactive Elements:** Buttons and input fields use a 12px radius, providing a modern "squircle" feel that is friendly yet professional.
- **Status Chips:** Use fully pill-shaped (100px) radii to distinguish them clearly from interactive buttons.

## Components

### Buttons
- **Primary:** Gradient from #0F5EF7 to #0A4DDB. Smooth hover transition that increases the saturation.
- **Secondary:** White background with a subtle border and the primary blue for text.
- **Ghost:** No border or background; uses the Navy color at 60% opacity for text.

### Inputs & Floating Labels
- Use **Floating Labels** that shrink and move to the top-left of the border when focused.
- Input focus should show a 3px "glow" shadow using the primary blue at 15% opacity.

### Elegant Cards
- Must include a subtle internal padding of 24px or 32px.
- Use a 1px border (#F1F5F9) instead of heavy shadows for a cleaner, modern look.

### Professional Data Tables
- Header rows should be #F8FAFC with uppercase `label-md` typography.
- No vertical borders; use subtle horizontal dividers only.
- Row hover state should be a very pale blue (#F0F7FF) to assist with tracking data horizontally.

### Property Navigation
- High-end property selectors should use a glassmorphic dropdown with a small thumbnail of the hotel icon, emphasizing the "Premium SaaS" identity.