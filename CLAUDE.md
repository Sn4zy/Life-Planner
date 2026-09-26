# Project: Personal Dashboard (working title)

A personal, single-user, all-in-one dashboard site: like Notion, but built for one person's own use, made of five modules behind a central hub. React only, no backend, everything persisted client-side.

## Stack
- React, functional components, hooks only, plain JS/JSX (no TypeScript)
- react-router-dom, `useNavigate` for all navigation
- framer-motion for animation (scroll reveal, pop-in, layout transitions); simple scroll/mouse-linked transforms for parallax
- localStorage for small state (schedule, notes); IndexedDB for anything with images or file blobs (bookmark thumbnails, uploaded documents), since localStorage tops out around 5MB
- Perf: `React.memo` on pure components, `useMemo`/`useCallback` for derived values and handlers, `React.lazy` + `Suspense` per route
- Shared logic lives in custom hooks (`useLocalStorage`, `useIndexedDB`, `useWeekSchedule`, `useEditMode`, etc.)

## Modules

### Home
Central hub. Bento grid of 4 tiles (Schedule, Bookmarks, Notebook, Documents), uneven sizes, glass panels, hover motion, `useNavigate` on click. This page carries most of the animation budget.

### Schedule
- 7 columns, Monday to Sunday, one week visible at a time; left/right arrows page a week
- Each day is a rounded-square card (about 10% border-radius)
- Clicking a weekday header (e.g. "Monday") sets a recurring template applied to every future occurrence of that weekday
- Clicking one specific date cell overrides just that date
- Up to 2 entries per day (e.g. Uni + Work), each with a label, a color, and optional start/end time
- Each entry's color renders as a block/dot inside the cell and as a small legend dot outside the grid, so 1 vs 2 colors on a day means 1 vs 2 things scheduled that day
- If a day has two timed entries, calculate and show the free gap between them (e.g. Uni 11:00-13:00, gap, Work 16:00-22:00)
- Persist templates and per-date overrides in localStorage

### Bookmarks ("Saves")
- "+ Add" opens a form: image upload, name, link, description/note
- Support both of these card layouts, switchable per card or globally:
  - Layout A: single square panel, image large and anchored toward the top right, text block anchored bottom left, no divider
  - Layout B: image full width across the top, a divider line, then stacked text lines below
- Hovering/focusing a card reveals an edit affordance (pencil icon, inline form) to update any field
- Persist entries in IndexedDB (image as blob or base64)

### Notebook
Single free-write space, autosaves to localStorage on a debounce as the user types.

### Documents
Upload files, list them with a search bar (filename filter), open/copy content back out, re-save edits. Store blobs in IndexedDB; note the localStorage-only limitation if IndexedDB isn't wired up yet.

## Design
- Glassmorphism (frosted translucent panels, blur, soft borders) combined with a bento grid, bento mainly on Home and card groupings, not forced everywhere
- Palette: mostly black backgrounds, white text/borders/accents
- Mood: dark fantasy, a little cinematic, layered soft shadows and subtle gradients for a light 3D feel
- Should comfortably host large user-uploaded images (manga/anime art etc.) as backgrounds or decoration without fighting the UI
- Shapes: primary containers are rounded squares (about 10% radius); secondary elements (buttons, tags, avatars) lean circular
- Motion: scroll-reveal, pop-in on modals/cards, parallax on scroll or mouse move, tasteful, not overwhelming

## Live Edit Mode
A toggle that puts the whole site into an editable state: drag/reposition, resize, recolor background/text, adjust opacity, edit text inline, swap background images, for almost any element sitewide.
- Implementation idea: a central style-override store (context plus `useLocalStorage`), keyed by element id. An `EditableBox` wrapper renders drag/resize handles and a style popover when edit mode is on, and always applies whatever override exists for its id, whether edit mode is on or off
- Build this last, once the four modules exist and have stable element ids to hook into

## Build order
1. Shell: routing, design tokens (CSS variables), Home hub, base hooks
2. Schedule
3. Bookmarks
4. Notebook and Documents
5. Animation and parallax pass
6. Live Edit Mode
