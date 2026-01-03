# CLI AI AGENT PROMPT  
## Generate a Single-Page PWA: **VacaTrack**

You are a senior frontend engineer tasked with generating a **production-quality, single-page Progressive Web App (PWA)** called **VacaTrack**.

This app must be optimized for **iOS PWA usage**.  
The architecture must be future-proofed so a backend can be added later without rewriting the UI or logic.

Do **not** include explanatory text, sample data, or tutorial content. Generate only the application structure and implementation.

---

## 1. Technology Stack (Mandatory)

Use the **simplest possible stack** that satisfies all requirements:

- Vite
- React
- TypeScript
- TailwindCSS
- lucide-react (icons only)
- date-fns (date calculations only)
- vite-plugin-pwa
- No routing library
- No global state library
- No UI component framework

---

## 2. Application Type

- Single-page application
- Installable PWA
- Offline-capable (cache app shell only)
- Optimized for iOS Safari and iOS “Add to Home Screen” behavior

---

## 3. Core Purpose

VacaTrack allows a user to track **PTO usage** across a **custom accrual period defined by month and year**, showing:

- Total allotted PTO days
- Used PTO days
- Planned PTO days
- Remaining PTO days
- Projected remaining PTO days

This is **not** a calendar-year app.

---

## 4. Tracking Period Rules (Critical)

- The user defines a **custom tracking period**:
  - Start: Month + Year (MM/YYYY)
  - End: Month + Year (MM/YYYY)
  - Example: March 2022 through April 2023
- Internally:
  - Period start = first day of the start month
  - Period end = last day of the end month
- PTO entries may extend beyond the period, but **only days overlapping the period are counted**

---

## 5. PTO Day Counting Rules

- Count **weekdays only (Monday–Friday)**
- No half-days
- Do **not** exclude federal holidays
- Each weekday counts as exactly one PTO day

---

## 6. Data Models (Conceptual)

### Settings
- Tracking period start date
- Tracking period end date
- Annual PTO allotment (in days)
- Optional carryover days

### PTO Entry
- Unique ID
- Type: Used or Planned
- Start date
- End date
- Optional notes
- Created timestamp
- Updated timestamp

---

## 7. Storage Architecture

- Implement a storage abstraction layer
- Use a Local Storage adapter initially
- The abstraction must support:
  - Loading and saving settings
  - Listing PTO entries
  - Adding entries
  - Updating entries
  - Deleting entries
- Structure the app so the adapter can later be swapped without UI changes

---

## 8. Required Business Logic (Pure Functions)

All calculations must be isolated into reusable, pure utility functions:

- Count weekdays between two dates
- Compute overlap between an entry and the tracking period
- Calculate totals:
  - Allotted days
  - Used days
  - Planned days
  - Remaining days
  - Projected remaining days
- Detect overlapping PTO entries

---

## 9. Guardrails and UX Rules

### Overlap Detection
- Warn the user if a PTO entry overlaps another entry
- The warning must be **non-blocking**
- Saving must still be allowed

### Negative PTO
- If projected remaining PTO becomes negative:
  - Display a visible warning in the summary
  - Display a warning in the add/edit form
  - Still allow saving

### Add / Edit Modal
- Adding and editing must use the **same modal component**
- Editing pre-fills the form
- All calculations and warnings update live as fields change

### Delete with Undo
- Deleting an entry removes it immediately
- Show a toast notification with an “Undo” action
- Undo restores the deleted entry within a short timeout window

---

## 10. UI Layout and Structure

Design must be **clean, modern, minimal, and columnar**, using Tailwind only.

### Header
- App name: VacaTrack
- Current tracking period display (e.g., “Mar 2022 – Apr 2023”)
- Settings button
- Export / Import buttons

### Add / Plan Section
- Start date input
- End date input
- Used vs Planned toggle
- Notes input
- Live calculated PTO day count
- Inline warnings (overlap, negative projection)

### Summary Section
- Cards for:
  - Allotted
  - Used
  - Planned
  - Remaining
  - Projected Remaining
- Visual progress indicator

### Log / Calendar Section
- Tab switch between:
  - List view (grouped by month)
  - Calendar month grid
- Click entries to edit
- Icons for edit and delete actions

---

## 11. iOS-First PWA Requirements

- Valid web app manifest
- Standalone display mode
- Apple touch icons
- Required Apple meta tags for PWA support
- Proper scroll locking for modals on iOS
- App must feel native when launched from the home screen

---

## 12. Export and Import

- Allow exporting the entire app state as a JSON file
- Allow importing a JSON file to replace the current state
- Validate imported data before applying it

---

## 13. Explicitly Exclude

Do **not** implement:
- Any backend or server
- Authentication
- User accounts
- Holiday logic
- Half-day PTO
- Routing
- Charting libraries
- Analytics
- Third-party UI frameworks

---

## 14. Output Expectations

Generate a complete, ready-to-run project including:

- Project scaffold
- Folder structure
- Components
- Storage abstraction
- Utility logic
- PWA configuration
- Tailwind setup

The app must run immediately after dependency installation and development startup.

Focus on **clarity, correctness, maintainability, and simplicity**.
