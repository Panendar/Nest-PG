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
- Media tiles: 12px
- Pills/Badges: 9999px

## Shadows

- none: none
- sm: 0 1px 2px rgba(15, 23, 42, 0.08)
- md: 0 8px 20px rgba(15, 23, 42, 0.10)
- lg: 0 16px 36px rgba(15, 23, 42, 0.16)

## Core Components

### Layout

- Page container (owner workspace with responsive padding)
- Header (page title, listing status, primary action)
- Section block (title, helper text, content area)
- Card (listing summary, form sections, media groups)
- Two-column form layout for larger screens

### Inputs

- Button (primary, secondary, ghost, destructive)
- Text input (listing name, location fields)
- Textarea (property description, notes)
- Select (listing status, availability state, categorical fields)
- Number input (pricing, occupancy, room counts where needed)
- Checkbox group (amenity-style selections if required by listing details)
- File upload / media picker
- Form field wrapper (label, helper text, error text)

### Feedback

- Toast (save success, upload success, update failure)
- Alert (validation issues, incomplete listing warning)
- Badge (active, unavailable, draft-style status if used)
- Spinner and skeleton loading states

### Data

- Listing summary card
- Media gallery grid
- Empty state block (no listings, no media, no availability set)
- Stat tiles for lightweight owner activity signals

### Overlay

- Modal/dialog (confirm delete/remove media, unsaved changes)
- Drawer or sheet for mobile-friendly edit actions
- Dropdown menu for listing-level quick actions

## Icon Set

- Library: Lucide React
- Usage convention:
  - 16px for inline icons with text
  - 20px for buttons and field affordances
  - 24px for section-level emphasis
  - Stroke width consistent at 1.75
- Common icons: Home, Building2, MapPin, Image, Upload, Pencil, Eye, EyeOff, CheckCircle, AlertCircle, Trash2

## Responsive Breakpoints

- Use Chakra breakpoint model:
  - base: 0px
  - sm: 480px
  - md: 768px
  - lg: 992px
  - xl: 1280px
  - 2xl: 1536px
- Behavior guidance:
  - base-sm: single-column forms, stacked actions, full-width save buttons
  - md-lg: split edit forms into primary content and supporting status/media areas
  - xl-2xl: persistent summary panel and wider media-management layouts

## Framework Notes (Chakra UI)

- Use Chakra UI as the primary component and styling system for this module.
- Prefer Chakra tokens for typography, color, spacing, radius, and shadows.
- Use Chakra FormControl, Input, Textarea, Select, NumberInput, Button, Card, Badge, Alert, Spinner, Skeleton, Modal, Drawer, Menu, and Toast as base components.
- Implement media upload and gallery interactions as Chakra-composed custom components rather than introducing a second UI framework.
- Apply a module-level theme extension for owner status colors, listing cards, and media-tile states instead of ad-hoc inline styling.
