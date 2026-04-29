## Typography

- Font family (primary): Inter, system-ui, -apple-system, Segoe UI, sans-serif
- Font family (numeric/data fallback): Roboto Mono, ui-monospace, SFMono-Regular, monospace
- Weights used: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Type scale:
  - h1: 32px / 40px, 700
  - h2: 28px / 36px, 700
  - h3: 24px / 32px, 600
  - h4: 20px / 28px, 600
  - body: 16px / 24px, 400
  - small: 14px / 20px, 400
  - caption: 12px / 16px, 500

## Colour Palette

- Primary:
  - primary-500: #0EA5A4
  - primary-600: #0B8B8A
  - primary-700: #0A6F6E
- Secondary:
  - secondary-500: #2563EB
  - secondary-600: #1D4ED8
  - secondary-700: #1E40AF
- Neutral:
  - neutral-50: #F8FAFC
  - neutral-100: #F1F5F9
  - neutral-200: #E2E8F0
  - neutral-400: #94A3B8
  - neutral-600: #475569
  - neutral-800: #1E293B
  - neutral-900: #0F172A
- Semantic:
  - success: #16A34A
  - warning: #D97706
  - error: #DC2626
  - info: #0284C7

## Spacing

- Base unit: 4px
- Spacing scale:
  - 1: 4px
  - 2: 8px
  - 3: 12px
  - 4: 16px
  - 5: 20px
  - 6: 24px
  - 8: 32px
  - 10: 40px
  - 12: 48px
  - 16: 64px

## Border Radius

- Buttons: 8px
- Inputs/Selects/Textareas: 8px
- Cards: 12px
- Modals/Dialogs: 16px
- Pills/Badges: 9999px

## Shadows

- none: none
- sm: 0 1px 2px rgba(15, 23, 42, 0.08)
- md: 0 8px 20px rgba(15, 23, 42, 0.10)
- lg: 0 16px 36px rgba(15, 23, 42, 0.16)

## Core Components

### Layout

- Page container (max width with responsive padding)
- Header (module title + utility actions)
- Section block (title + body)
- Card (listing summary, comparison blocks)
- Grid/list layout for search results

### Inputs

- Button (primary, secondary, ghost)
- Text input (city)
- Select (search radius)
- Date picker (preferred move-in date)
- Textarea (message to owner)
- Form field wrapper (label, helper text, error text)

### Feedback

- Toast (success/error confirmations)
- Alert (inline validation and permission issues)
- Badge (availability, listing status)
- Spinner and skeleton loading states

### Data

- Listing cards (search result items)
- Compare panel (2+ listings side-by-side)
- Empty state block (message + CTA)
- Pagination or load-more control for results

### Overlay

- Modal/dialog (contact confirmation, unsaved-flow confirmation)
- Dropdown menu (sort or quick actions)

## Icon Set

- Library: Lucide React
- Usage convention:
  - 16px for inline icons with text
  - 20px for buttons/controls
  - 24px for section-level emphasis
  - Stroke width consistent at 1.75 to maintain visual balance
- Common icons: Search, MapPin, SlidersHorizontal, Phone, Mail, Calendar, CheckCircle, AlertCircle, XCircle

## Responsive Breakpoints

- Use Chakra breakpoint model:
  - base: 0px
  - sm: 480px
  - md: 768px
  - lg: 992px
  - xl: 1280px
  - 2xl: 1536px
- Behavior guidance:
  - base-sm: single-column layout, stacked form controls, sticky bottom primary CTA when needed
  - md-lg: two-column results/detail patterns
  - xl-2xl: wider content grid with persistent comparison panel

## Framework Notes (Chakra UI)

- Use Chakra UI as the primary component/styling system for this module.
- Prefer Chakra tokens for color, spacing, radius, and shadows to keep consistency.
- Use Chakra FormControl, Input, Select, Textarea, Button, Card, Alert, Spinner, Skeleton, Modal, and Toast as base components.
- Apply module-level theme extension for custom colors and semantic status badges instead of ad-hoc inline styles.
- Do not mix parallel UI frameworks in this module to avoid styling inconsistency.
