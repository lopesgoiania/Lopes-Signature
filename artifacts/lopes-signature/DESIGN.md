---
name: Lopes Signature
description: Existing site primitives with independently art-directed property landing pages.
colors:
  background: "hsl(43 29% 95%)"
  foreground: "hsl(0 0% 13%)"
  border: "hsl(0 0% 85%)"
  card: "hsl(0 0% 100%)"
  card-foreground: "hsl(0 0% 13%)"
  primary: "hsl(41 49% 55%)"
  primary-foreground: "hsl(0 0% 100%)"
  secondary: "hsl(0 0% 8%)"
  secondary-foreground: "hsl(43 29% 95%)"
  muted: "hsl(0 0% 90%)"
  muted-foreground: "hsl(0 0% 35%)"
  accent: "hsl(43 29% 90%)"
  accent-foreground: "hsl(0 0% 13%)"
  destructive: "hsl(5 69% 59%)"
  destructive-foreground: "hsl(0 0% 100%)"
  input: "hsl(0 0% 85%)"
  ring: "hsl(41 49% 55%)"
typography:
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
  editorial:
    fontFamily: "Cormorant Garamond, serif"
  utility:
    fontFamily: "Space Mono, monospace"
  button:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  home-body:
    fontFamily: "Signature Manrope, Arial, sans-serif"
    fontSize: "15px"
    lineHeight: 1.8
  home-headline:
    fontFamily: "Signature Manrope, Arial, sans-serif"
    fontSize: "clamp(38px, 4.5vw, 64px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.035em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  unit: "4px"
  control-x: "16px"
  control-y: "8px"
  card: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "24px"
---
# Design System: Lopes Signature

## Overview

This document records the existing shared site primitives from src/index.css and representative components. It does not establish one visual template for property landing pages. The site combines warm light surfaces, graphite, gold, rounded controls, and an existing dark institutional treatment.

Every landing page must be designed independently, without the shared site header. By explicit user request, Bauhaus now has lightweight navigation integrated into the hero image. Bauhaus is a scoped architectural editorial composition; its cream, forest, and clay palette, asymmetry, section sequence, and hero are not global identity or a template for subsequent developments.

**Key Characteristics:**
- Shared semantic controls and font families.
- Independent landing pages, without the shared site header.
- Scoped visual identity for each development.
- Home body and footer use an approved Lopes reference adaptation; opening and navigation remain preserved.

The home body and footer have an approved, surface-local adaptation of the user-supplied Lopes references (Logic, LAVIERDOR and _MODELO), implemented in React on the existing Vercel site. The initial section and navigation are preserved in full. This addition does not replace the shared system or Bauhaus's independent direction. Its direction contract is `.impeccable/surfaces/src-pages-home-tsx.md`; content evidence is in `docs/redesign-home-2026-11-07/ANALISE.md` and `COPY.md`.

## Colors

Frontmatter records the light root semantic palette in its source HSL notation, not approximate hex comments. Primary is muted gold; secondary is graphite; background and accent are warm neutrals. The `.dark` override changes background to `hsl(0 0% 4%)`, foreground to `hsl(0 0% 96%)`, and primary to `hsl(43 65% 52%)`; see src/index.css for the complete mode mapping. Existing institutional details also use metallic gold gradients and dark translucent panels.

Bauhaus-only overrides live under `.bauhaus-page` in src/pages/bauhaus-page.css: paper `#f2eee5`, ink `#29342c`, muted `#616459`, clay `#83503b`, and line `#c9c9ba`. These are page-local values, deliberately excluded from the global token frontmatter.

Home-only palette primitives live on `.hp-body` and `.hp-home-footer` in `src/pages/home-lopes.css`: warm paper (`--hl-paper: #f5f1e9`), ink (`--hl-ink: #242424`), muted text (`--hl-muted: #62645b`), matte gold (`--hl-gold: #b89a5b`), sand (`--hl-sand: #e3d4b5`) and divider (`--hl-line: #cbc7bc`). They are deliberately scoped rather than replacements for the global semantic colors.

## Typography

Plus Jakarta Sans is the shared sans family, explicitly retained by Bauhaus. Cormorant Garamond supplies editorial emphasis; Space Mono remains an existing utility family. The shared UI button uses the button role above; cards use semibold, tight title treatment and 14px descriptions. There is no single global display ramp to impose on all pages.

Bauhaus uses oversized Plus Jakarta area numerals at `clamp(100px, min(9.5vw, 14.5svh), 178px)`, section headings at `clamp(32px, 3.5vw, 54px)` with 1.15 line-height, and 15px prose with 1.85 line-height. Its serif emphasis is selective. Mobile size overrides belong to its stylesheet and do not define the next LP.

The home has an approved user-reference typography exception: Manrope from LAVIERDOR is served locally as `Signature Manrope` from `public/fonts/manrope-lopes.ttf` (variable weight 100–900, `font-display: swap`), with Arial and sans-serif fallbacks. The `home-body` and `home-headline` roles above apply only within `.hp-body` and `.hp-home-footer`; the opening and navigation retain their existing fonts and styling. Home subheadings use weight 550, 23px/1.3, with local component overrides; mobile headings are 38px/1.13 below 768px. Manrope is not the default or a requirement for other pages or future property LPs.

## Layout

The existing system uses a 4px spacing unit and 24px card interiors. Public site navigation has a 1280px maximum container and switches desktop links at the large breakpoint; it is not permitted on landing pages. Global minimum body width is 320px.

Bauhaus alone uses a full-viewport photographic cover with deep-green directional overlays, oversized area numerals, editorial location text and an integrated transparent masthead, large project images, alternating editorial sections, leisure switching, plan selection, and contact. Its section padding begins at `100px max(6vw, 24px)` with local responsive rules at 900px, 620px, and 1700px. Consult its surface contract for the narrative rather than reusing it as a shared layout.

The home body uses a 1200px maximum container with 40px desktop side gutters, 24px gutters at 1000px and below, and 20px gutters at 767px and below. Section rhythm is 100px desktop and 64px mobile. Editorial image/text pairs, ruled lists and responsive columns replace repeated decorative panels below the preserved opening; grids collapse to a single column at 767px. These measurements are home-local.

## Elevation & Depth

Existing shared cards and inputs use shadow tokens; the dark mode replaces these with transparent shadows. Institutional navigation uses blur and translucent dark fill. Property cards lift 4px and enlarge their images to 1.035 on hover. Bauhaus uses photographic scale and flat tonal regions for depth. None of these page-specific treatments mandates a universal elevation philosophy.

The home body uses photography, alternating paper and dark tonal sections, and thin dividers for depth. Its property cards remove the resting shadow; this does not change shared card elevation. Local actions transition background and color over 0.2s ease-out; home reduced-motion rules remove transitions.

## Shapes

Shared radii derive from an 8px base, with the extracted steps above. Existing property cards use 24px corners and site navigation uses a pill. Bauhaus is predominantly rectilinear with page-local control treatments. Preserve these scope boundaries instead of normalizing every surface to one corner style.

The home body uses rectilinear action buttons and contact fields, ruled links and FAQ rows, with a retained 8px radius on property cards. This user-reference grammar is scoped to the home body and footer, not a site-wide corner policy.

## Components

Shared buttons provide primary, destructive, outline, secondary, ghost, and link variants. Default controls use 8px by 16px padding, 36px minimum height, and 6px corners. Hover and active elevation overlays follow the current theme; disabled controls lose pointer interaction and use half opacity. Keyboard focus uses the shared ring plus global focus rules.

Inputs are 36px tall with 6px corners, transparent backgrounds, semantic borders, and 12px horizontal padding; text is 16px, changing to 14px at the medium breakpoint. Cards use 12px corners, semantic fill, border, shadow, and 24px interiors. Badges use 6px corners and 12px semibold text. Institutional navigation is documented only for existing non-LP pages.

Bauhaus controls use clay actions, 56px minimum action height, visible 3px focus outlines, and real image/plan switching. Form success is shown after server success, with separate pending and error states. Global motion transitions are short; reduced-motion CSS disables or minimizes them.

All ten Bauhaus image assets referenced by the page carry provenance: eight WebP perspectives have matching `.webp.json` origin sidecars; the two JPEG plans carry embedded origin metadata. Preserve these records when replacing or exporting assets. This is provenance documentation, not a new licensing determination.

The finish review disposition is `ship` for the four supplied viewport captures and source reviewed in `/tmp/bauhaus-review/review.md`. It excludes the broken full-page desktop stitch, unseen desktop sections, and a successful live lead submission. Build and typecheck were reported passed by the implementation agent.

Home-local controls include sand-filled actions with a 58px minimum height and 17px by 22px padding, underlined text links with a 44px minimum height, and visible 3px keyboard focus outlines offset by 5px. The contact panel uses labeled, square-cornered fields and separate pending, error and success states. Neighborhood links resolve from available stock; the no-stock fallback opens `/imoveis`.

Home verification evidence is stored in `.impeccable/review/home-20261107` (1440px desktop, 390px mobile and 1280px user viewport, plus architecture and form-error captures). Visual fidelity was directly compared with LAVIERDOR; this is not a claim of pixel equivalence to Logic or _MODELO, nor approval of the entire site. The independent review initially requested fixes for the neighborhood fallback and this documentation; final disposition belongs to the review record after confirmation. Seven SEO tests, the Signature build and Signature types passed; the global monorepo check has a pre-existing Vite failure in mockup-sandbox/cracha. A real successful production lead submission was not tested: the preview blocked writes and verified the error state preserves entered fields.

## Do's and Don'ts

### Do:
- Do design each property landing page independently, with its own content and real project imagery.
- Do keep every landing page free of a header.
- Do preserve the existing site outside the requested surface.
- Do retain focus visibility, reduced-motion behavior, image provenance, and truthful form feedback.
- Do preserve the home opening and navigation; apply its approved Manrope/reference grammar only to the body and home footer.

### Don't:
- Don't copy the Bauhaus palette, hero, or section sequence into the next landing page as a template.
- Don't promote scoped Bauhaus styles into global tokens.
- Don't promote home-local Manrope, palette, or layout into a mandatory LP template.
- Don't substitute generic property imagery for Bauhaus assets or invent prices, delivery, or availability.

Hero revision: supplied LP BAUHAUS.png is composition reference only, never a shipping asset. Background uses existing 1690586.webp, with a distinct mobile crop. No other page section was redesigned.

Home amendment (07/11/2026): dark sections and fields now use neutral grays (#242424, #323232, #262626, #343434); the navigation strip is black with white text/arrows. The user requested removal of the background-video pause control; reduced-motion preference and poster fallback remain. All other opening content and layout are preserved.
