# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VacaTrack is a frontend-only, single-page Progressive Web App (PWA) for tracking PTO (Paid Time Off) across custom accrual periods. The app runs entirely in the browser with local storage, designed for a **single user** (no authentication). Architecturally prepared for future Supabase backend integration.

**iOS PWA experience is the top priority** - the app must feel native when launched from iOS home screen.

## Technology Stack

- **Vite** - Build tool and dev server
- **React** + **TypeScript** - UI framework
- **TailwindCSS** - Styling with light/dark mode support (muted color palette)
- **Recharts** - Simple charting for PTO visualization
- **lucide-react** - Icons only
- **date-fns** - Date calculations only
- **vite-plugin-pwa** - PWA functionality

**Constraints:**
- No routing library (single page)
- No global state library
- No UI component frameworks
- No backend/server/authentication
- Single user only

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## GitHub Pages Deployment

The app is configured for GitHub Pages hosting:
- Base URL is set to `/VacaTrack/` in `vite.config.ts`
- PWA manifest scope and start_url match the base path
- Run `npm run deploy` to build and deploy to gh-pages branch

## Project Structure

```
src/
├── components/       # React UI components
│   ├── Modal.tsx           # Reusable modal wrapper (iOS-optimized)
│   ├── Header.tsx          # App header with settings/export/import
│   ├── Summary.tsx         # PTO summary cards + Recharts donut
│   ├── PTOForm.tsx         # Add/Edit PTO modal form
│   ├── SettingsModal.tsx   # Settings configuration modal
│   ├── ListView.tsx        # PTO entries as cards
│   ├── CalendarView.tsx    # Monthly calendar grid
│   ├── EmptyState.tsx      # First-time user prompt
│   └── Toast.tsx           # Undo notification (10s timer)
├── storage/          # Storage abstraction layer
│   ├── StorageAdapter.ts   # Interface definition
│   ├── LocalStorageAdapter.ts  # localStorage implementation
│   └── index.ts            # Export singleton instance
├── hooks/
│   └── useTheme.ts         # Theme (light/dark/system) hook
├── utils/
│   └── dateUtils.ts        # Pure date/PTO calculation functions
├── types.ts          # TypeScript interfaces
├── App.tsx           # Main app component
├── main.tsx          # React entry point
└── index.css         # Tailwind + iOS-specific CSS
```

## Architecture Principles

### Storage Abstraction Layer

The app uses a **storage abstraction pattern** to enable future backend migration:

- Create a storage interface/adapter pattern
- Initial implementation uses Local Storage
- All data operations go through this abstraction (load/save settings, CRUD for PTO entries)
- UI components must never directly access localStorage - always use the adapter
- Design so swapping to Supabase requires only changing the adapter, not UI code

### Pure Business Logic

All PTO calculations must be **pure utility functions** isolated from UI:

- Count weekdays between dates (Monday-Friday only)
- Compute overlap between PTO entries and tracking period
- Calculate: allotted days, used days, planned days, remaining days, projected remaining days
- Detect overlapping PTO entries

These utilities should be standalone and easily testable.

## Core Business Rules

### Tracking Period
- User defines custom period: start month/year → end month/year (e.g., Mar 2022 - Apr 2023)
- Internally: period start = 1st day of start month, period end = last day of end month
- PTO entries can extend beyond period, but only overlapping days count

### PTO Day Counting
- **Weekdays only** (Monday-Friday)
- **No half-days**
- **Do not exclude federal holidays**
- Each weekday = exactly 1 PTO day

### Overlap Detection
- Warn when PTO entries overlap (non-blocking)
- Allow saving despite warnings
- Update warnings live in add/edit modal

### Negative PTO Handling
- Show visible warning if projected remaining PTO goes negative
- Display in summary section and add/edit form
- Still allow saving

### Delete with Undo
- Deleting removes entry immediately
- Show toast notification with "Undo" action
- **10 second** undo window to restore deleted entry

## Component Structure

### Modal Pattern
- Use same modal component for both add and edit
- Pre-fill form when editing
- Live calculation updates as fields change
- Show inline warnings (overlap, negative projection)

### UI Sections
1. **Header**: App name, period display, settings button
2. **Add/Plan Section**: Date inputs (native HTML), type toggle, notes, live PTO count, warnings
3. **Summary Section**: Cards for allotted/used/planned/remaining/projected + chart visualization
4. **Log/Calendar Section**: Tab switch between simple list view and calendar grid

### Settings Modal
- Opens as a modal (same pattern as add/edit)
- Tracking period: month/year pickers for start and end
- Annual PTO allotment input
- Light/dark mode toggle

### Calendar View
- Shows only months within the defined tracking period
- Navigate month-by-month
- Display PTO entries on their respective dates

### First-Time Experience
- No setup wizard - user configures via Settings modal
- **Strong input validation** - clearly indicate when required settings are missing
- Show helpful empty states when no tracking period or entries exist

## iOS PWA Requirements (Top Priority)

The iOS native PWA experience is the **primary target platform**:

- Valid web app manifest with standalone display mode
- Apple touch icons (placeholder for now - will be generated later)
- Required Apple meta tags for PWA support
- Proper scroll locking for modals on iOS
- Safe area insets for notched devices
- Touch-friendly tap targets and gestures
- App must feel completely native when launched from iOS home screen
- Test thoroughly in iOS Safari and standalone mode

## Data Models

### Settings
- Tracking period start/end (month/year)
- Annual PTO allotment (days)
- Theme preference (light/dark)

### PTO Entry
- ID, type (used/planned), start/end dates, notes
- Created/updated timestamps

## What NOT to Implement

Do not add: backend, authentication, user accounts, holiday logic, half-day PTO, routing, analytics, carryover days, or third-party UI component frameworks.

## Future Backend Integration Notes

When adding Supabase:
- Replace storage adapter implementation only
- Keep UI components unchanged
- Settings and PTO entries map directly to Supabase tables
- Maintain same pure utility functions for calculations
