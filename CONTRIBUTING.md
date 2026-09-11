# Developing this repository

This document covers building, deploying, and maintaining this repo itself -
branch structure, GitHub Pages internals, file-by-file notes, and the
`intl-tel-input` version-pinning strategy. If you just want to set up or
configure the widget on a Jotform form, see [`README.md`](./README.md)
instead - none of this is needed for that.

## Contents

- [Branch structure and releases](#branch-structure-and-releases)
- [How GitHub Pages hosting works](#how-github-pages-hosting-works)
- [Files](#files)
- [Dependency version pinning](#dependency-version-pinning)
  - [Checklist for bumping this pin in the future](#checklist-for-bumping-this-pin-in-the-future)
- [Repo hygiene files](#repo-hygiene-files)
- [Badges](#badges)
- [License headers](#license-headers)

## Branch structure and releases

- **`main`** - ongoing development. Commit freely here; nothing on this
  branch is live.
- **`gh-pages`** - effectively the "release" branch. It's what GitHub Pages
  actually serves (see below), so merging `main` into `gh-pages` is the
  deliberate "publish this" moment.

To cut a release: merge `main` into `gh-pages` (a plain PR/merge works fine -
GitHub's web UI can do this directly via a pull request between the two
branches, no local git needed), then create a
[GitHub Release](https://github.com/5by5Media/international-phone-widget-for-jotform/releases)
tagged at that merge commit. Tags aren't required for anything to work
(Pages doesn't care about them at all), but they're a lightweight, permanent
way to mark "this is what was live as of this point" - and they're what
drives the "Latest release" badge on the README.

## How GitHub Pages hosting works

This repo is published via GitHub Pages, served from the `gh-pages` branch's
repo root (no `docs` folder, no build step). The widget's registered **Widget
IFrame URL** in Jotform points at:

```
https://5by5media.github.io/international-phone-widget-for-jotform/widget.html
```

`style.css` and `widget.js` are loaded by that file via ordinary relative
paths, so they need to stay alongside it - same for `demo.html`.

`README.md` itself becomes the site's homepage automatically - GitHub Pages'
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

`demo.html` mocks the real Jotform bridge script (`JFCustomWidget`) just
enough to run the real, unmodified `style.css` and `widget.js` outside of an
actual Jotform iframe - useful for previewing settings or taking screenshots
without needing a real form. Its Configuration panel writes settings into the
page's own URL query string (one param per Jotform Additional Parameter, same
names) and reloads, so a configured demo URL is directly shareable. See the
comments inside `demo.html` itself for the mechanics.

## Files

| File | Purpose |
|---|---|
| [`widget.html`](./widget.html) | The page Jotform's iframe loads |
| [`demo.html`](./demo.html) | Standalone demo/test harness outside Jotform |
| [`style.css`](./style.css) | The widget's own styling (theme variables, layout) |
| [`widget.js`](./widget.js) | All widget logic (settings parsing, validation, Jotform bridge) |
| [`LICENSE`](./LICENSE) | MIT license text |
| [`README.md`](./README.md) | Setup/configuration docs - also becomes the Pages homepage |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | This file |
| `.gitignore` / `.gitattributes` / `.editorconfig` | Repo hygiene - see [below](#repo-hygiene-files) |

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

## Repo hygiene files

- **`.gitignore`** - OS-specific ignore rules (Windows/macOS/Linux), sourced
  from [github/gitignore](https://github.com/github/gitignore) (CC0-1.0
  licensed - see the file's own header for why it doesn't carry this repo's
  usual MIT/SPDX header). No build-tool or editor-specific entries, since
  this project has no build step and is deliberately editor-agnostic.
- **`.gitattributes`** - enforces LF line endings repo-wide (`text=auto
  eol=lf`), so a mixed Windows/macOS/Linux contributor base can't
  accidentally introduce CRLF.
- **`.editorconfig`** - baseline formatting (indent size, charset, trailing
  newline) honored by most editors natively, independent of `.gitattributes`
  (which is the enforcement backstop at commit time; `.editorconfig` is the
  request at edit time).

## Badges

The three README badges are all standard [shields.io](https://shields.io)
badges reading live GitHub data - "Latest release" and "License" query
GitHub's API (with their own caching layers), "Pages Build" reads the status
of the Actions-based workflow GitHub runs internally for every Pages
deployment, even under the "deploy from a branch" method used here (no
workflow file of our own needed for that one).

One thing worth knowing if a badge ever seems stuck: GitHub's image proxy
(Camo) caches responses per exact URL. If a repo is made public after being
private, a badge queried while still private can get a "repo not found"
result cached against that exact URL - changing the URL slightly (e.g. adding
a harmless query param) forces a fresh fetch. This isn't currently an issue
(the repo's been public since before these badges were added), just useful to
know if it recurs after some future visibility change.

This cache isn't permanent, though - it's a normal, bounded HTTP cache with a
real expiration (shields.io's own default is around an hour for the license
badge specifically). So if a badge ever looks wrong, just leaving it alone
for a while and letting the next natural pageview trigger a fresh fetch works
just as well as forcing it via a URL change - the URL-change trick is only
useful when you want it fixed immediately rather than waiting it out.

## License headers

Most files carry a short header comment with a copyright line and an SPDX
license identifier (`SPDX-License-Identifier: MIT`), e.g.:

```js
// 5by5 International Phone Widget for Jotform
// Copyright (c) 2026 5by5 Media
// SPDX-License-Identifier: MIT
```

`.gitignore` is the one exception - most of its content is sourced verbatim
from a CC0-1.0-licensed template (see its own header comment), so it isn't
given this project's MIT header; only the original structure/commentary
layered on top of that template is this project's own.
