# Studio — Design System

> The visual language for this boilerplate, reverse-engineered from the **Studio ·
> Agency Operations** dashboard reference. It is a calm, data-dense, light-first
> aesthetic: warm off-white canvas, crisp white surfaces, hairline borders, a
> near-black monochrome brand, and small semantic accents used only to signal
> state. The system has since grown beyond that original dashboard to cover a
> public storefront (catalog, product page, cart, checkout) and a Products CRUD
> admin — same tokens throughout; see §8.10–8.15 for the storefront/admin specs,
> and §8.2/8.5/8.6/8.7 for specs reserved from the original dashboard.
>
> Every token below is implemented as a CSS custom property in
> [`src/app/globals.css`](./src/app/globals.css) and exposed to Tailwind v4 via the
> `@theme` block, so the documentation and the code never drift apart.

---

## 1. Design Principles

1. **Monochrome first, color as signal.** The interface is built from neutrals.
   Color appears only to communicate status (on track, watch, over budget). Never
   decorate with color for its own sake.
2. **Hairlines over shadows.** Structure comes from `1px` borders and generous
   whitespace, not heavy elevation. Shadows are near-invisible and reserved for
   things that truly float (menus, popovers).
3. **Dense but breathable.** Tables and metrics pack a lot of information; rhythm
   and alignment keep it legible. Numbers are tabular and right-aligned.
4. **Quiet motion.** Transitions are short and functional — a hover fade, a panel
   slide. Nothing bounces.
5. **Typographic hierarchy through scale + weight, not many fonts.** One family
   (Inter), a handful of sizes, two weights.

---

## 2. Color

### 2.1 Neutrals (structure)

| Token                 | Value     | Usage                                             |
| --------------------- | --------- | ------------------------------------------------- |
| `--color-canvas`      | `#F6F5F2` | App background behind all panels                  |
| `--color-surface`     | `#FFFFFF` | Cards, tables, sidebar, header                    |
| `--color-surface-muted` | `#F3F1EC` | Search field, active nav pill, table header, hover fill |
| `--color-surface-hover` | `#F7F6F3` | Row / nav hover                                   |
| `--color-border-subtle` | `#ECEAE4` | Internal dividers, table row lines                |
| `--color-border`      | `#E4E1DA` | Default card & control border                     |
| `--color-border-strong` | `#D6D2C8` | Focus rings on light controls, emphasized edges   |

### 2.2 Ink (text)

| Token                   | Value     | Usage                                        |
| ----------------------- | --------- | -------------------------------------------- |
| `--color-ink`           | `#1B1A18` | Primary text, headings, metric values        |
| `--color-ink-secondary` | `#6C6A64` | Secondary text, table cell values, sub-labels |
| `--color-ink-muted`     | `#9C998F` | Meta, timestamps, placeholder, disabled       |
| `--color-ink-inverse`   | `#FBFAF8` | Text on the near-black brand fill             |

### 2.3 Brand

| Token                | Value     | Usage                                     |
| -------------------- | --------- | ----------------------------------------- |
| `--color-brand`      | `#1B1A18` | Primary buttons, logo mark, active pills  |
| `--color-brand-hover` | `#333029` | Hover state for brand-filled controls     |

The brand is intentionally the same near-black as primary ink. This is a
**monochrome brand**: emphasis comes from fill vs. outline, not from a hue.

### 2.4 Status (semantic accents)

Each status ships as a trio: a solid **base** (dots, bars), a **soft background**
(pills), and a **readable text** color for use on the soft background.

| Status  | Base (`--color-*`) | Soft bg (`--color-*-soft`) | Text (`--color-*-text`) | Meaning                          |
| ------- | ------------------ | -------------------------- | ----------------------- | -------------------------------- |
| Success | `#2F9E68`          | `#E9F5EE`                  | `#1F7A4D`               | On track · healthy               |
| Warning | `#C98A2B`          | `#FBF1DF`                  | `#9A6A18`               | Watch · over · attention needed  |
| Danger  | `#D25050`          | `#FBECEC`                  | `#A83B3B`               | Over pace · scope creep · double-booked |
| Info    | `#3D7CD1`          | `#E9F0FB`                  | `#2C5FA6`               | Neutral notice · in progress     |

**Usage rule:** a status dot uses the _base_; a status pill uses _soft bg_ + _text_;
a progress bar uses the _base_. Utilization/burn bars escalate by value:
`< 85%` success, `85–99%` warning, `≥ 100%` danger.

---

## 3. Typography

**Family:** `Inter` (variable), with a system-ui fallback stack. Loaded via
`next/font` and exposed as `--font-sans`. Numeric data uses
`font-variant-numeric: tabular-nums` so columns align.

| Role         | Token class    | Size / Line       | Weight | Tracking  | Example in reference        |
| ------------ | -------------- | ----------------- | ------ | --------- | --------------------------- |
| Hero         | `text-hero`    | `clamp(2.25rem,1.5rem+3.5vw,3.75rem) / 1.05` | 600 | `-0.03em` | Storefront landing headline |
| Display      | `text-display` | `28px / 1.15`     | 600    | `-0.02em` | "Products" (dashboard), page titles |
| Metric       | `text-metric`  | `30px / 1.1`      | 600    | `-0.02em` | Product price, checkout total |
| Section head | `text-section` | `15px / 1.3`      | 600    | `-0.01em` | "Order summary", card headers |
| Body         | `text-body`    | `14px / 1.5`      | 400    | `0`       | Card labels, nav items      |
| Body small   | `text-body-sm` | `13px / 1.45`     | 400    | `0`       | Table cells                 |
| Label        | `text-label`   | `11px / 1.2`      | 600    | `0.06em` uppercase | "MAIN MENU", spec-row keys |
| Caption      | `text-caption` | `12px / 1.4`      | 400    | `0`       | Stock signal, timestamps    |

`text-hero` is the one addition beyond the original reverse-engineered scale —
a single size above `text-display` for the storefront landing headline, sized
with `clamp()` so it scales fluidly instead of jumping at breakpoints.
Extending the scale by one step is in the system's spirit; adding a second
font family would not be (§3 stays Inter-only — see §8.10).

Only two weights are used across the whole system: **400** (regular) and **600**
(semibold). Avoid 500 and 700 to keep the type feeling consistent.

---

## 4. Spacing & Layout

**Base unit: `4px`.** All spacing is a multiple of it.

| Token       | Value  |     | Token        | Value  |
| ----------- | ------ | --- | ------------ | ------ |
| `space-1`   | `4px`  |     | `space-6`    | `24px` |
| `space-2`   | `8px`  |     | `space-8`    | `32px` |
| `space-3`   | `12px` |     | `space-10`   | `40px` |
| `space-4`   | `16px` |     | `space-12`   | `48px` |
| `space-5`   | `20px` |     | `space-16`   | `64px` |

**Layout constants**

- **Sidebar width:** `248px`, fixed, full height, `--color-surface`.
- **Content gutter:** `24px` around the main scroll area.
- **Card padding:** `20px` (standard), `16px` (compact / list rows).
- **Grid gap:** `16px` between cards; the overview uses a 12-column fluid grid.
- **Control height:** `36px` (buttons, inputs, pills), `32px` (compact).

---

## 5. Radius, Border & Elevation

| Token             | Value               | Usage                          |
| ----------------- | ------------------- | ------------------------------ |
| `--radius-xs`     | `6px`               | Badges, small chips            |
| `--radius-sm`     | `8px`               | Buttons, inputs, nav items     |
| `--radius-md`     | `10px`              | Inner tiles                    |
| `--radius-lg`     | `12px`              | Cards & panels (the default)   |
| `--radius-xl`     | `16px`              | Large containers               |
| `--radius-pill`   | `999px`             | Pills, avatars, status dots    |

**Borders** are always `1px solid var(--color-border)` unless a subtle divider
calls for `--color-border-subtle`.

**Shadows** (deliberately faint):

| Token           | Value                                                       | Usage            |
| --------------- | ---------------------------------------------------------- | ---------------- |
| `--shadow-xs`   | `0 1px 2px rgba(24,23,21,0.05)`                            | Resting cards    |
| `--shadow-sm`   | `0 1px 2px rgba(24,23,21,0.06), 0 1px 1px rgba(24,23,21,0.04)` | Hover lift    |
| `--shadow-pop`  | `0 8px 24px rgba(24,23,21,0.10), 0 2px 6px rgba(24,23,21,0.06)` | Menus, popovers |

---

## 6. Iconography

- **Library:** [`lucide-react`](https://lucide.dev), stroke width `1.5`.
- **Sizes:** `18px` in the sidebar, `16px` inline with text, `14px` in dense meta.
- **Color:** inherits `currentColor`; muted contexts use `--color-ink-muted`.

---

## 7. Motion

| Token                | Value                             |
| -------------------- | --------------------------------- |
| `--duration-fast`    | `120ms`                           |
| `--duration-normal`  | `200ms`                           |
| `--duration-slow`    | `320ms`                           |
| `--ease-out`         | `cubic-bezier(0.16, 1, 0.3, 1)`   |

- Hover fills (nav, table rows): `background-color` over `--duration-fast`.
- Panels & menus: `opacity` + small `translateY` over `--duration-normal`.
- Respect `prefers-reduced-motion`: transitions collapse to near-zero.

---

## 8. Component Specs

### 8.1 Sidebar
White surface, `248px`, right hairline border. Sections: **brand row** (logo mark
+ wordmark + collapse control), **search field** (muted fill, `⌘K` hint), grouped
**nav** under `text-label` section headers ("MAIN MENU", "MANAGE"), and a pinned
**user chip** at the bottom. Active item = `--color-surface-muted` fill + `--color-ink`
text; inactive = `--color-ink-secondary`, hovering to `--color-surface-hover`.
Count badges are muted pills aligned right.

### 8.2 Stat Card

> **Reserved — documented but not currently used.** Shipped with the original
> Agency Operations dashboard reference, removed along with it when the
> boilerplate repositioned around a storefront + Products CRUD. Kept here as
> a spec, not deleted, in case a future metrics view needs it.

`--color-surface`, `--radius-lg`, `1px` border, `20px` padding. Top: `text-label`
caption ("Billable Utilization"). Middle: `text-metric` value. Bottom: a **delta**
row — a directional arrow + magnitude + comparison ("vs last month"), tinted by
status (down-and-bad → danger). Cards sit in a 4-up row on desktop.

### 8.3 Data Table
Header row uses `text-label` on `--color-surface`, cells use `text-body-sm`. Row
lines are `--color-border-subtle`; rows hover to `--color-surface-hover`. Numeric
columns are right-aligned and tabular. A leading index column (1, 2, 3…) uses
`--color-ink-muted`. Status is expressed as a **status pill** in the final column.

### 8.4 Status Pill & Dot
- **Dot:** `8px` circle in the status _base_ color, `6px` gap before its label.
- **Pill:** soft bg + text color, `--radius-pill`, `2px 8px` padding, `text-caption`
  weight 600. Always pairs a dot or label with meaning — never color alone.

### 8.5 Progress / Burn Bar

> **Reserved — component still exists (`components/ui/ProgressBar.tsx`,
> tested), but has no current consumer** now that the Agency Operations
> dashboard it was built for is gone. Reuse it for any future utilization/burn
> visualization — the escalation rule below is exactly what the Stock Signal
> (§8.11) mirrors for inventory (success/warning/danger, inverted for "how
> much is left" instead of "how much is used").

Track = `--color-surface-muted`, height `6px`, `--radius-pill`. Fill color follows
the escalation rule (§2.4). The numeric percentage sits to the right in
`text-body-sm`, tabular.

### 8.6 Activity Feed

> **Reserved — documented but not currently used.** Removed with the Agency
> Operations dashboard; kept as a spec for a future notifications/activity
> surface.

Vertical list of events; each row = a small mono icon, a **bold title** fragment +
secondary detail (`text-body-sm`), and a `text-caption` timestamp in `--color-ink-muted`.
The most recent item may carry a status pill (e.g. "Now 124%").

### 8.7 Segmented Control (time range)

> **Reserved — documented but not currently used.** Removed with the Agency
> Operations dashboard; the underlying pill-group pattern lives on in the
> storefront's category filter pills (`ProductList`) and the Sidebar's
> active-item styling.

A pill group ("This Week / Next Week / This Month / This Quarter"). The selected
segment gets `--color-surface` fill + `--shadow-xs` + `--color-ink`; the track is
`--color-surface-muted`; unselected labels are `--color-ink-secondary`.

### 8.8 Button
- **Primary:** `--color-brand` fill, `--color-ink-inverse` text, `--radius-sm`,
  hover → `--color-brand-hover`.
- **Secondary:** `--color-surface` fill, `1px` border, `--color-ink` text, hover →
  `--color-surface-hover`.
- **Ghost:** transparent, `--color-ink-secondary`, hover fill `--color-surface-hover`.
- Height `36px`, `text-body-sm` weight 600, `12px` horizontal padding, icon+label
  gap `6px`.

### 8.9 Input
`36px` tall, `--color-surface` fill, `1px` border, `--radius-sm`, `text-body-sm`.
Placeholder `--color-ink-muted`. Focus → `--color-border-strong` border + a `2px`
focus ring in `--color-ink` at low opacity. Never remove focus outlines.

### 8.10 Storefront Hero
Centered, max-width constrained, generous vertical rhythm on `--color-canvas` —
no gradient, no decorative background flourish (§1.2: structure comes from
hairlines and whitespace, not effects). `text-hero` headline, `text-body` /
`--color-ink-secondary` subhead, one primary button. A deliberately familiar
commerce layout: the boilerplate's job is to be immediately recognizable and
easy to adapt, not to impose an art direction every adopter has to undo.
Stays Inter-only, per §3 — no second typeface was introduced for the storefront.

### 8.11 Catalog Card & Stock Signal
Catalog card: image (`aspect-[16/10]`), category badge overlaid top-left,
name (`text-body`, weight 600) + rating, summary (`text-body-sm`,
`--color-ink-secondary`, 2-line clamp), then price (tabular) and the **Stock
Signal** aligned on one row. Hover: border `--color-border` →
`--color-border-strong`, image `scale(1.03)`.

**Stock Signal** reuses the §2.4 status tokens, inverted for inventory instead
of utilization:

| Stock | Tone | Reads as |
| ----- | ---- | -------- |
| `> 10` | success | "In stock" |
| `1–10` | warning | "Only *n* left" |
| `0` | danger | "Sold out" |

Always a dot + label together (§9: never color alone). Same component is
reused on the product page, the cart drawer's line items, and the dashboard
Products table — one signal, one place it's defined
(`features/product/components/StockSignal.tsx`).

### 8.12 Product Page Spec Table
Two-column buy layout — image left, identity + price (`text-metric`, tabular)
+ Stock Signal + primary "Add to cart" right. Below the buy box, a hairline
key/value table (Category · Rating · Availability) styled like §8.3's Data
Table: `text-label` keys, `text-body-sm` values, `--color-border-subtle` row
dividers, no outer header row since there's only one column of data.

### 8.13 Cart Drawer
Right slide-over, `--shadow-pop` (the token reserved for "things that truly
float," §5 — its first real use). Line items with quantity steppers and a
remove control; subtotal in `text-metric`, tabular; a primary "Check out"
button. Empty state is an invitation ("Nothing in the cart yet" + a link back
to the catalog), not a bare icon.

Accessibility: focus-trapped while open, closes on `Escape`, restores focus to
whatever opened it on close. Stays in the DOM off-screen (`translate-x-full`)
for the slide transition, marked `inert` while closed rather than unmounted —
`inert` (not visual hiding) is what removes it from the tab order and a11y
tree; a plain "hidden" CSS check will not catch this state.

### 8.14 Checkout Summary
Single-column order summary — line items, subtotal, total (`text-metric`).
Email field plus an explicit demo notice; **deliberately no payment fields,
not even fake ones** — a payment-shaped form in a template someone will clone
invites it to be wired up as though it were real. Confirmation state shows a
generated order reference and clears the cart.

### 8.15 Confirm Dialog
Centered modal (as opposed to the Cart Drawer's slide-over — there's no exit
transition to preserve, so it unmounts on close rather than going `inert`).
Same focus-trap / `Escape` / focus-restore contract as §8.13. Title +
description, Cancel + primary action; destructive actions (e.g. delete a
product) use the `danger` Button variant so the action's weight is visible,
not just named.

---

## 9. Accessibility

- **Contrast:** primary ink on canvas/surface exceeds WCAG AA (≥ 7:1). Status
  _text_ colors are chosen to hit ≥ 4.5:1 on their soft backgrounds.
- **Never color-only:** every status is reinforced by a label or icon, not just a
  hue, so it survives color-blindness and grayscale.
- **Focus visible:** all interactive elements keep a visible focus ring.
- **Hit targets:** interactive controls are ≥ `36px` in at least one axis.
- **Motion:** honor `prefers-reduced-motion`.

---

## 10. Theming Notes

The system is authored **light-first** to match the reference. Because every color
is a token, a dark theme is a matter of overriding the `--color-*` values under a
`[data-theme="dark"]` selector — no component code changes. The `ui` store already
tracks a `theme` value and toggles the `data-theme` attribute on `<html>`, so the
wiring exists; only the dark token values need to be filled in when dark mode is
wanted. Per project convention, **do not** default to dark.

---

## 11. Token Quick Reference

Consume tokens through Tailwind utilities generated from `@theme`:

```tsx
// color
<div className="bg-surface border border-border text-ink" />
<span className="text-ink-muted" />
<span className="bg-danger-soft text-danger-text" />   // status pill

// typography
<h1 className="text-display" />
<p className="text-body-sm text-ink-secondary" />
<span className="text-label" />                        // uppercase caption

// radius / shadow
<div className="rounded-lg shadow-xs" />
```

Or read the raw variables directly in custom CSS:

```css
.custom {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}
```
