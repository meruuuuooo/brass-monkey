```markdown
# Design System Strategy: The Industrial Atelier

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Refined Foundry."** 

This system rejects the sterile, "app-like" aesthetic of modern SaaS in favor of a tactile, editorial experience that feels forged rather than coded. We are blending the raw, structural integrity of a 19th-century workshop with the precision of a high-end luxury watchmaker. To break the "template" look, we employ **intentional structural asymmetry**: layouts should feel like a curated blueprint, utilizing the `24 (8.5rem)` spacing tokens for dramatic white space and overlapping serif typography that breaks the container bounds.

The experience must feel heavy, permanent, and handcrafted. Every interaction should mimic the dampened click of a brass toggle switch or the soft glow of a filament bulb.

---

## 2. Colors & Tonal Depth
Our palette is rooted in the depth of `surface` (#131313) and the radiance of `primary` (#f2ca50). 

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. Structural separation must be achieved through **Value Shifting**. Use `surface-container-low` (#1c1b1b) for large background sections and `surface-container-high` (#2a2a2a) for elevated content areas. The transition between these deep charcoals creates a sophisticated, "milled" look that a line cannot replicate.

### Surface Hierarchy & Nesting
Treat the UI as a physical workbench. 
- **Base Layer:** `surface` (#131313).
- **Secondary Work Area:** `surface-container-low` (#1c1b1b).
- **Interactive Insets:** `surface-container-lowest` (#0e0e0e) should be used for input fields or code blocks to create a "recessed" effect.

### The "Luminescence" Rule
To achieve the "modern twist," we use `primary` (#f2ca50) and `primary-container` (#d4af37) not just as flat fills, but as light sources. For hero elements or CTAs, apply a subtle linear gradient from `primary` to `primary-fixed-dim` (#e9c349) at a 135-degree angle to mimic the sheen of polished brass.

---

## 3. Typography: Heritage vs. Precision
The typographic voice is a dialogue between the past and the future.

- **The Voice (Display & Headline):** Use `notoSerif`. This is our "Heritage Serif." At `display-lg` (3.5rem) and `headline-lg` (2rem), the serif should feel authoritative. Use `primary` (#f2ca50) for headlines against dark backgrounds to ensure they feel like embossed brass plates.
- **The Engine (Body & Labels):** Use `manrope`. This clean, geometric sans-serif provides the "Modern Twist." It ensures legibility in dense data. 
- **Letter Spacing:** Increase letter-spacing by 0.05rem for all `label-md` and `label-sm` styles to evoke the feel of vintage technical manuals.

---

## 4. Elevation & Depth
In "The Refined Foundry," depth is tactile, not digital.

- **The Layering Principle:** Avoid traditional shadows. Instead, stack `surface-container-high` (#2a2a2a) on top of `surface-dim` (#131313).
- **Ambient Brass Glows:** For floating elements (Modals/Popovers), use a custom shadow: `0px 20px 40px rgba(181, 166, 66, 0.08)`. This replaces the standard black shadow with a warm, brassy "underlight" that suggests a glow from below.
- **The "Ghost Border" Fallback:** If a boundary is required for accessibility, use `outline-variant` (#4d4635) at **15% opacity**. This creates a "scratched-in" guide line rather than a heavy stroke.
- **Industrial Glass:** For navigation bars or overlays, use `surface` at 80% opacity with a `20px` backdrop-blur. This allows the "Exposed Brick" textures of the background to bleed through softly, maintaining the industrial context.

---

## 5. Components

### Buttons: The Machined Toggle
- **Primary:** Background of `primary` (#f2ca50), text of `on-primary` (#3c2f00). Shape: `md` (0.375rem). On hover, add a `box-shadow: 0 0 15px #d4af37` to simulate brass luminescence.
- **Secondary:** Transparent background with a `Ghost Border` (outline-variant at 20%). Text in `primary-fixed`.
- **Tertiary:** Pure text in `label-md` using `primary-container` (#d4af37) with an underline that appears only on hover.

### Input Fields: The Recessed Slot
- Background must be `surface-container-lowest` (#0e0e0e) to look "etched" into the interface. 
- Bottom-only border of `outline-variant` (#4d4635). 
- Active state: The border transitions to `primary` (#f2ca50) with a 2px "glow" shadow.

### Cards & Lists: The Blueprint Grid
- **Forbid Dividers:** Separate list items using `spacing-4` (1.4rem) of vertical gap. 
- Use a `surface-container-low` (#1c1b1b) card body with a `headline-sm` title in `on-surface-variant` (#d0c5af).

### Signature Component: The "Heritage Badge"
- Use a `primary-container` (#d4af37) background with `on-primary-container` (#554300) text. 
- Apply `rounded-full` (9999px) and a `label-sm` font. This mimics a brass serial number plate found on vintage machinery.

---

## 6. Do's and Don'ts

### Do:
- Use **Asymmetric Spacing**: Pair a `16 (5.5rem)` left margin with a `4 (1.4rem)` right margin to create a dynamic, editorial feel.
- Use **Texture Sparingly**: Apply a subtle, low-opacity "Exposed Brick" noise texture only to the `surface` background, never to interactive components.
- Use **High Contrast Scale**: Jump from `display-lg` to `body-md` directly to emphasize the "Heritage" headline.

### Don't:
- **Don't use 100% white (#FFFFFF).** Use `on-surface` (#e5e2e1) for all "white" text to maintain the weathered, matte aesthetic.
- **Don't use "Full" rounding on cards.** Stick to `md` (0.375rem) or `sm` (0.125rem) to keep the structural, "machined" feel.
- **Don't use standard blue for links.** All interactive text must be in the brass spectrum (`primary` or `tertiary` tokens).
- **Don't use divider lines.** If a separation is needed, use a `surface-container` shift or a 1px gap showing the background `surface` color.```