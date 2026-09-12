// 5by5 International Phone Widget for Jotform
// Copyright (c) 2026 5by5 Media
// SPDX-License-Identifier: MIT

(function () {
  var input = document.getElementById('phone-input');
  var errorEl = document.getElementById('error-msg');
  var iti = null;
  // Format used for the value sent to Jotform once a number is valid.
  // Overridden inside the 'ready' handler based on the OutputFormat setting.
  var outputFormat = 'E164';

  // Friendly text for libphonenumber's ValidationError codes.
  // getValidationError() returns a string code, or null.
  var ERROR_MESSAGES = {
    TOO_SHORT: "Phone number too short.",
    TOO_LONG: "Phone number too long.",
    INVALID_COUNTRY_CODE: "Invalid country code.",
    INVALID_LENGTH: "Incorrect phone number length.",
    // Per libphonenumber's own definition, this means the digit count matches
    // a bare local subscriber number for the selected country/region, but is
    // missing something (like an area code) needed to reach it from anywhere
    // outside that immediate local area -- not a "local vs. international
    // format" issue, since the country itself is already set via the
    // dropdown, not something the user types.
    IS_POSSIBLE_LOCAL_ONLY: "This looks like a local number; it may be missing an area code.",
    // Catch-all: right length, but not a number recognized as actually
    // assigned/valid. libphonenumber doesn't track a more specific reason
    // than this (e.g. there's no distinct "invalid area code" category).
    IS_POSSIBLE: "Invalid phone number.",
    DEFAULT: "Enter a phone number."
  };

  function resize() {
    // Give the iframe a moment to reflow, then tell Jotform the new height
    setTimeout(function () {
      var height = document.getElementById('widget-root').offsetHeight + 4;
      JFCustomWidget.requestFrameResize({ height: height });
    }, 0);
  }

  function showError(msg) {
    input.classList.add('error');
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
    resize();
  }

  function clearError() {
    input.classList.remove('error');
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
    resize();
  }

  function currentResult() {
    // Empty field: treat as valid-but-empty unless the widget is marked required
    // by Jotform (Jotform itself enforces "required" against an empty value).
    if (!input.value.trim()) {
      return { valid: true, value: '' };
    }
    try {
      var valid = iti.isValidNumber();
      // intl-tel-input's getNumber(format) formats the number per NumberFormat:
      // E164 "+17024181234", INTERNATIONAL "+1 702-418-1234",
      // NATIONAL "(702) 418-1234" (no country code!), RFC3966 "tel:+1-702-418-1234".
      var value = valid ? iti.getNumber(outputFormat) : input.value.trim();
      return { valid: valid, value: value };
    } catch (e) {
      // isValidNumber/getNumber throw if called before the ~260KB utils
      // script has finished loading (it loads async, after page load, so
      // this is a real possibility if someone types quickly on a slow
      // connection). Treat as "not yet known" rather than letting the
      // exception break the rest of the widget's event handling.
      return { valid: false, value: input.value.trim() };
    }
  }

  function reportToForm() {
    var result = currentResult();
    JFCustomWidget.sendData({ value: result.value });
    return result;
  }

  // Converts "#rrggbb" (or "rgb(...)"/named colors) to an "r, g, b" triple
  // by letting the browser parse it via a throwaway element.
  function toRgbTriple(color) {
    var probe = document.createElement('div');
    probe.style.color = color;
    document.body.appendChild(probe);
    var computed = getComputedStyle(probe).color; // "rgb(r, g, b)"
    document.body.removeChild(probe);
    var m = computed.match(/\d+/g);
    return m ? m.slice(0, 3).join(', ') : null;
  }

  // Reads the no-code styling settings (if the form owner filled them in)
  // and applies them as CSS custom properties. Anything left blank keeps
  // the built-in default already set on :root in style.css. This runs
  // BEFORE any CSS pasted into the widget's "Custom CSS" tab is injected
  // by Jotform, so that tab always has the final say for anyone who wants
  // full control.
  function applyStyleSettings() {
    var root = document.documentElement.style;
    var map = {
      AccentColor: '--jfw-accent',
      BorderColor: '--jfw-border-color',
      ErrorColor: '--jfw-error-color',
      TextColor: '--jfw-text-color',
      BackgroundColor: '--jfw-bg',
      FontFamily: '--jfw-font',
      FontSize: '--jfw-font-size',
      FieldHeight: '--jfw-height',
      BorderRadius: '--jfw-radius'
    };
    Object.keys(map).forEach(function (settingName) {
      var val = JFCustomWidget.getWidgetSetting(settingName);
      if (!val) return;
      val = val.trim();
      if (!val) return;
      // Numeric-only settings (height, radius, font size) get "px" appended
      if (/^(FieldHeight|BorderRadius|FontSize)$/.test(settingName) && /^\d+(\.\d+)?$/.test(val)) {
        val += 'px';
      }
      root.setProperty(map[settingName], val);
    });

    // Derive the focus-ring shadow color from AccentColor, if it was set
    var accent = JFCustomWidget.getWidgetSetting('AccentColor');
    if (accent) {
      var rgb = toRgbTriple(accent.trim());
      if (rgb) root.setProperty('--jfw-accent-shadow', 'rgba(' + rgb + ', 0.18)');
    }
  }

  JFCustomWidget.subscribe('ready', function (formInfo) {
    applyStyleSettings();

    var defaultCountry = (JFCustomWidget.getWidgetSetting('DefaultCountry') || 'us').toLowerCase();
    // NOTE: intl-tel-input removed "preferredCountries" (v22+) in favor of
    // "countryOrder" - same shape (an array of iso2 codes), but the setting
    // name here is kept as "PreferredCountries" since that's the concept
    // form-builders actually want, even though the underlying library option
    // it maps to has a different name.
    var preferredRaw = JFCustomWidget.getWidgetSetting('PreferredCountries') || '';
    var countryOrder = preferredRaw
      .split(',')
      .map(function (c) { return c.trim().toLowerCase(); })
      .filter(Boolean);
    var excludeRaw = JFCustomWidget.getWidgetSetting('ExcludeCountries') || '';
    var excludeCountries = excludeRaw
      .split(',')
      .map(function (c) { return c.trim().toLowerCase(); })
      .filter(Boolean);
    var onlyRaw = JFCustomWidget.getWidgetSetting('OnlyCountries') || '';
    var onlyCountries = onlyRaw
      .split(',')
      .map(function (c) { return c.trim().toLowerCase(); })
      .filter(Boolean);
    // If the field is restricted to a specific country list and the default
    // country isn't one of them, fall back to the first allowed country
    // rather than silently ignoring the restriction.
    if (onlyCountries.length && onlyCountries.indexOf(defaultCountry) === -1) {
      defaultCountry = onlyCountries[0];
    }
    var placeholder = JFCustomWidget.getWidgetSetting('Placeholder');
    if (placeholder) input.placeholder = placeholder;

    // Boolean settings normally come through as plain text ("true"/"false")
    // when typed directly into a Jotform Additional Parameter -- but if a
    // "toggle"-style Field Type is used instead, it's not confirmed exactly
    // what literal value that control sends (could plausibly be "1"/"0" or
    // "yes"/"no" under the hood). Recognizing several common truthy/falsy
    // representations here costs nothing and avoids a toggle silently doing
    // nothing if it doesn't happen to emit the exact string "true"/"false".
    var TRUTHY_VALUES = ['true', '1', 'yes', 'on'];
    var FALSY_VALUES = ['false', '0', 'no', 'off'];
    function getBoolSetting(name, defaultValue) {
      var raw = JFCustomWidget.getWidgetSetting(name);
      if (raw === undefined || raw === null || raw.trim() === '') return defaultValue;
      var normalized = raw.trim().toLowerCase();
      if (TRUTHY_VALUES.indexOf(normalized) !== -1) return true;
      if (FALSY_VALUES.indexOf(normalized) !== -1) return false;
      // Unrecognized value -- fall back rather than guessing.
      return defaultValue;
    }

    var strictInputValidation = getBoolSetting('StrictInputValidation', true);
    var requireMobile = getBoolSetting('RequireMobile', false);
    var separateDialCode = getBoolSetting('SeparateDialCode', true);
    var showFlags = getBoolSetting('ShowFlags', true);
    var formatAsYouType = getBoolSetting('FormatAsYouType', true);
    var allowDropdown = getBoolSetting('AllowDropdown', true);

    // Which format the value sent to Jotform is in, once the number is valid.
    // E164 (default) has no separators - most reliable for storage/matching.
    // INTERNATIONAL is E164 with human-readable spacing/dashes, dial code
    // included - usually the right pick if you specifically want it
    // "readable" but still want the country code embedded in the value.
    // NATIONAL omits the country's dial code entirely (e.g. "(702) 418-1234"
    // for a US number, no "+1") - only use this if you genuinely don't need
    // the country code in the stored value itself.
    // RFC3966 wraps E164 in a "tel:" URI scheme, mainly useful for tel: links.
    var VALID_OUTPUT_FORMATS = ['E164', 'INTERNATIONAL', 'NATIONAL', 'RFC3966'];
    var requestedFormat = (JFCustomWidget.getWidgetSetting('OutputFormat') || 'E164').trim().toUpperCase();
    outputFormat = VALID_OUTPUT_FORMATS.indexOf(requestedFormat) !== -1 ? requestedFormat : 'E164';

    var itiOptions = {
      initialCountry: defaultCountry,
      // "countryOrder" replaced the removed "preferredCountries" option -
      // same array-of-iso2-codes shape, just a new name in the library.
      countryOrder: countryOrder.length ? countryOrder : ['us', 'ca', 'gb'],
      separateDialCode: separateDialCode,
      showFlags: showFlags,
      strictMode: strictInputValidation,
      formatAsYouType: formatAsYouType,
      autoPlaceholder: 'aggressive',
      loadUtils: function () {
        return import('https://cdn.jsdelivr.net/npm/intl-tel-input@29/dist/js/utils.js');
      }
    };
    // Only add restrictions/overrides if the form owner actually configured
    // them - passing e.g. an empty array, or explicitly setting a value to
    // undefined, is not always treated the same as omitting the option
    // entirely, so these all stay conditional rather than always-present.
    if (onlyCountries.length) {
      itiOptions.onlyCountries = onlyCountries;
    }
    if (excludeCountries.length) {
      itiOptions.excludeCountries = excludeCountries;
    }
    if (!allowDropdown) {
      // "allowDropdown" (old boolean) was replaced by "countrySelectorMode".
      // Only set this when the form owner wants the dropdown disabled -
      // leaving the key out entirely keeps the library's own default
      // ("AUTO") intact, rather than risking it being overridden by an
      // explicit "undefined".
      itiOptions.countrySelectorMode = 'OFF';
    }
    if (requireMobile) {
      // FIXED_LINE_OR_MOBILE is included because many countries (the US among
      // them) don't distinguish mobile from landline in their numbering plan,
      // so libphonenumber reports genuinely-mobile numbers under that combined
      // type rather than "MOBILE" outright - excluding it would wrongly reject
      // valid mobile numbers from those countries.
      itiOptions.allowedNumberTypes = ['MOBILE', 'FIXED_LINE_OR_MOBILE'];
    }

    iti = window.intlTelInput(input, itiOptions);

    // Restore a previously submitted value (e.g. user is editing a submission)
    var existingValue = formInfo && formInfo.value;
    if (existingValue) {
      // getValue() alone is not exposed pre-init in this state; setNumber works
      // once utils are loaded, so give it a brief window.
      setTimeout(function () {
        try { iti.setNumber(existingValue); } catch (e) {}
        resize();
        // Report the restored value once it's actually in place -- reporting
        // any earlier would race ahead of setNumber and report the empty
        // pre-restoration state instead.
        reportToForm();
      }, 150);
    } else {
      // No existing value to restore -- report the starting (empty) state
      // right away, rather than leaving the form (or this demo's status
      // panel) waiting until the user's first interaction to hear anything.
      reportToForm();
    }

    resize();

    input.addEventListener('countrychange', function () {
      // Re-validate against the newly selected country's rules
      if (input.value.trim()) validateLive();
      reportToForm();
    });

    input.addEventListener('input', function () {
      clearError();
      reportToForm();
    });

    input.addEventListener('blur', validateLive);

    function validateLive() {
      var result = currentResult();
      if (result.value === '' ) { clearError(); return; }
      if (!result.valid) {
        var code = null;
        try {
          code = typeof iti.getValidationError === 'function' ? iti.getValidationError() : null;
        } catch (e) {
          // Same utils-not-ready race as currentResult() - fall through to
          // the generic message below rather than letting this throw.
        }
        showError((code && ERROR_MESSAGES[code]) || ERROR_MESSAGES.DEFAULT);
      } else {
        clearError();
      }
    }

    JFCustomWidget.subscribe('submit', function () {
      var result = currentResult();
      if (result.value && !result.valid) {
        validateLive();
      }
      JFCustomWidget.sendSubmit({ valid: result.valid, value: result.value });
    });
  });

  // Keep Jotform aware of size changes generally
  window.addEventListener('resize', resize);
})();
