# 5by5 International Phone Widget for Jotform

[![Latest release](https://img.shields.io/github/v/release/5by5Media/international-phone-widget-for-jotform)](https://github.com/5by5Media/international-phone-widget-for-jotform/releases/latest)
[![License](https://img.shields.io/github/license/5by5Media/international-phone-widget-for-jotform)](./LICENSE)
[![Pages Build](https://github.com/5by5Media/international-phone-widget-for-jotform/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/5by5Media/international-phone-widget-for-jotform/actions)

A custom [Jotform widget](https://www.jotform.com/developers/widgets/) that lets a
form respondent pick their country from a searchable list and enter their phone
number in that country's format, with live formatting and validation powered by
[intl-tel-input](https://github.com/jackocnr/intl-tel-input). The hosting form
receives a single, fully-formatted, validated phone number - including the
country's dial code by default (E.164, configurable - see `OutputFormat`
below) - as the field's value.

## Contents

- [How it's hosted](#how-its-hosted)
- [Files](#files)
- [Widget settings](#widget-settings)
  - [A note on `FormatAsYouType`](#a-note-on-formatasyoutype)
  - [A note on `OutputFormat`](#a-note-on-outputformat)
- [Dependency version pinning](#dependency-version-pinning)
  - [Checklist for bumping this pin in the future](#checklist-for-bumping-this-pin-in-the-future)
- [License](#license)

## How it's hosted

This repo is published via GitHub Pages, served from the `gh-pages` branch's
repo root (no `docs` folder, no build step). The widget's registered **Widget
IFrame URL** in Jotform points at:

```
https://5by5media.github.io/international-phone-widget-for-jotform/widget.html
```

`style.css` and `widget.js` are loaded by that file via ordinary relative
paths, so they need to stay alongside it.

This README itself becomes the site's homepage automatically - GitHub Pages'
default Jekyll build includes the `jekyll-readme-index` plugin, which renders
whichever `README.md` it finds as `index.html` when no other index file is
present. No front matter, no extra files needed for that to happen.

This behavior can be overridden by adding a `_config.yml` at the repo root
with a `readme_index` block, e.g.:

```yaml
readme_index:
  enabled: false        # turn the auto-homepage behavior off entirely
  remove_originals: false  # if true, README.md itself is excluded from the published site
  with_frontmatter: false  # if true, only applies when README.md has its own front matter
```

None of this is currently needed here - no `_config.yml` exists in this repo,
so the plugin runs with its defaults (shown above) - but it's worth knowing
this is configurable rather than fixed, in case that ever changes.

## Files

| File | Purpose |
|---|---|
| [`widget.html`](./widget.html) | The page Jotform's iframe loads |
| [`style.css`](./style.css) | The widget's own styling (theme variables, layout) |
| [`widget.js`](./widget.js) | All widget logic (settings parsing, validation, Jotform bridge) |
| [`LICENSE`](./LICENSE) | MIT license text |
| [`README.md`](./README.md) | This file - also becomes the Pages homepage |

## Widget settings

These are configured as **Additional Parameters** when registering (or
editing) the widget in Jotform, and are all optional - every one has a
sensible default if left blank.

| Setting | Type | Default | Description |
|---|---|---|---|
| `DefaultCountry` | [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) code | `us` | Country selected when the field first loads |
| `PreferredCountries` | comma-separated ISO2 codes | `us,ca,gb` | Countries pinned to the top of the dropdown (no divider line is shown below the group - see note*) |
| `OnlyCountries` | comma-separated ISO2 codes | *(none - no restriction)* | If set, restricts the dropdown to only these countries |
| `ExcludeCountries` | comma-separated ISO2 codes | *(none)* | Removes specific countries from the dropdown, without restricting to a fixed list like `OnlyCountries` does |
| `AllowDropdown` | `true` / `false` | `true` | Set to `false` to disable the country selector entirely (e.g. for a genuinely single-country form) |
| `Placeholder` | text | *(none)* | Placeholder text shown before a country is selected; once a country is chosen, an example number for that country takes over |
| `StrictInputValidation` | `true` / `false` | `true` | Blocks invalid characters and over-length input as the user types |
| `RequireMobile` | `true` / `false` | `false` | Restricts valid numbers to mobile (and `FIXED_LINE_OR_MOBILE`, for countries where the two aren't distinguished) |
| `FormatAsYouType` | `true` / `false` | `true` | Live-formats the number as the user types. When `false`, the field shows raw digits while typing, and stays that way after losing focus too (see note below) |
| `SeparateDialCode` | `true` / `false` | `true` | Shows the country's dial code separated out next to the flag, rather than as part of the typed number |
| `ShowFlags` | `true` / `false` | `true` | Set to `false` for a text-only country selector (no flag icons) |
| `OutputFormat` | `E164` / `INTERNATIONAL` / `NATIONAL` / `RFC3966` | `E164` | Format of the value sent to Jotform once the number is valid - see note below |
| `AccentColor` | CSS color | `#6c9df0` | Focus border / focus-ring color |
| `BorderColor` | CSS color | `#d7dbe0` | Default input border color |
| `ErrorColor` | CSS color | `#e0402d` | Border/text color for validation errors |
| `TextColor` | CSS color | `#2b3242` | Input text color |
| `BackgroundColor` | CSS color | `#ffffff` | Input background color |
| `FontFamily` | CSS font stack | system font stack | Font used in the field |
| `FontSize` | number (px) | `15` | Input text size |
| `FieldHeight` | number (px) | `40` | Input height |
| `BorderRadius` | number (px) | `6` | Corner rounding |

\* intl-tel-input's underlying option for this (`countryOrder`) doesn't draw
the grey divider that older versions did. If you want it back, intl-tel-input
documents [a small CSS snippet](https://intl-tel-input.com/docs/faq#how-do-i-restore-the-preferredcountries-divider)
for it - not added here by default, for simplicity.

For styling beyond what these settings cover, paste CSS into the widget's own
**Custom CSS** tab in Jotform (wand icon on the field -> Custom CSS) - it's
injected after this widget's own stylesheet, so it can override any of the
above CSS variables, or target `#phone-input` directly. For the intl-tel-input
dropdown/flag/icon styling itself, prefer its own documented `--iti-*` CSS
variables ([theming docs](https://intl-tel-input.com/docs/theming)) over
targeting its internal `.iti__*` class names, since the variables are the
more stable customization surface across library versions.

### A note on `FormatAsYouType`

When disabled, the field shows raw, unformatted digits as the user types -
no live-inserted spaces/dashes. Important nuance: **it does not become nicely
formatted just by losing focus either.** intl-tel-input only reformats the
displayed value at specific moments (country selection, or a programmatic
`setNumber`/`setSelectedCountry` call) - blur on its own isn't one of them.
So this is really "continuously formatted" vs. "never automatically
formatted," not "while typing" vs. "once you're done." Either way, this only
affects what's *displayed* - validation and the value actually sent to
Jotform are unaffected, since those are always computed fresh from the
parsed number.

### A note on `OutputFormat`

This only affects the value **sent to Jotform once submitted** - it has no
effect on how the number is displayed live in the field while typing (that's
governed separately by `formatAsYouType`, which is always on).

- **`E164`** (default) - `+17024181234`. No separators; the most reliable
  format for storage, deduplication, or matching against other systems.
- **`INTERNATIONAL`** - `+1 702-418-1234`. Same information as E164 (country
  code included) but with human-readable spacing/dashes.
- **`NATIONAL`** - `(702) 418-1234`. Readable, but **omits the country's dial
  code entirely** - only use this if the stored value genuinely doesn't need
  to carry the country code (the widget still validates against the correct
  country either way; this format just doesn't include that information in
  the saved string).
- **`RFC3966`** - `tel:+1-702-418-1234`. A URI scheme, mainly useful if the
  value will be used directly in a `tel:` link rather than stored/displayed
  as a plain number.

## Dependency version pinning

The two `intl-tel-input` CDN references in
`widget.html` (and the `utils.js` import inside
`widget.js`) are pinned to **major version 29 only**
(`intl-tel-input@29`, not an exact patch like `@29.2.0`). This means:

- jsDelivr resolves the reference to the newest `29.x.y` release automatically,
  picking up non-breaking fixes and refreshed libphonenumber metadata (e.g.
  new area codes) without any action needed here.
- It will **not** automatically jump to a new major version (e.g. `30.x`) if
  one is released, since major versions are where intl-tel-input's changelog
  indicates breaking changes happen. Moving to a new major should be a
  deliberate, one-time update to this pin, with a quick check of the current
  Options/Methods/Types docs first - see the checklist below for the kind of
  thing that tends to change between majors.

### Checklist for bumping this pin in the future

intl-tel-input's breaking changes tend to follow a few recurring patterns -
worth specifically checking for each of these before updating the version
number, since none of them would be caught just by the widget failing to
load:

- **Published file paths** - confirm the CDN path structure (currently
  `dist/js/...`, `dist/css/...`) against the target version's own docs;
  it's changed before.
- **`getValidationError()`'s return type** - confirm it's still returning the
  string codes `widget.js`'s `ERROR_MESSAGES` table expects (e.g.
  `"TOO_SHORT"`, `"INVALID_COUNTRY_CODE"`, or `null`); an unnoticed change
  here fails silently (generic error text instead of specific), not loudly.
- **Renamed/replaced options** - intl-tel-input has a history of swapping a
  boolean option for a string-enum one (e.g. `allowDropdown` ->
  `countrySelectorMode`), which passes no validation error if you keep using
  the old name - it just silently does nothing.
- **Input padding/layout behavior** - check whether the library still applies
  its own left-padding automatically (an inline style, currently not
  overridable from `style.css`), in case that changes again.

## License

MIT - see [`LICENSE`](./LICENSE).
