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

This README covers **setting up and configuring** the widget on a Jotform
form. Looking to develop, deploy, or maintain this repository itself (branch
structure, GitHub Pages internals, dependency version pinning, and so on)?
See [`CONTRIBUTING.md`](./CONTRIBUTING.md) instead.

## Contents

- [Setting this up in Jotform](#setting-this-up-in-jotform)
- [Demo](#demo)
- [Widget settings](#widget-settings)
  - [A note on `FormatAsYouType`](#a-note-on-formatasyoutype)
  - [A note on `OutputFormat`](#a-note-on-outputformat)
- [License](#license)

## Setting this up in Jotform

This is registered with Jotform as an **iFrame-type custom widget** - Jotform's
own guide to registering one is at
[jotform.com/developers/widgets](https://www.jotform.com/developers/widgets/),
and covers the exact current click-path through their UI. The two things
you'll need from this repo, regardless of exactly how Jotform's registration
screen looks when you get there:

- **Widget IFrame URL:**

  ```
  https://5by5media.github.io/international-phone-widget-for-jotform/widget.html
  ```

- **Additional Parameters:** add any setting you want the person building a
  form with this widget to be able to configure - see the full list of
  available parameters in [Widget settings](#widget-settings) below. Any
  parameter you don't add here simply stays fixed at its documented default,
  with no way for a form-builder to change it. (Use the exact, case-sensitive
  name of each setting - e.g. `DefaultCountry` - as its parameter name.)

Once registered, add it to a form from the Widgets toolbox in Form Builder,
same as any other widget.

## Demo

A standalone demo, hosted alongside the widget itself but outside of Jotform,
for previewing settings live and taking screenshots:

https://5by5media.github.io/international-phone-widget-for-jotform/demo.html

It has its own Configuration panel covering every setting listed below, so you
can try out different combinations and see the result immediately, without
needing to register or edit anything in Jotform first.

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

## License

MIT - see [`LICENSE`](./LICENSE).
