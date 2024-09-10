declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.svg' {
  import { SVGProps, VFC } from 'react';

  const SVG: VFC<SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.svg?url' {
  const svg: string;
  export default svg;
}

declare module '*.csv?url' {
  const csv: string;
  export default csv;
}

declare module '*.png?url' {
  const png: string;
  export default png;
}

declare const FIRST_BUILD_YEAR: string;
declare const LATEST_BUILD_YEAR: string;

declare module '*.md' {
  const markdown: string;
  export default markdown;
}

interface Window {
  _CSRF_TOKEN?: string;

  /**
   * Safe Exam Browser (SEB) JavaScript API. This should be available in SEB 3.4 for Windows
   * and SEB 3.0 for iOS and macOS, or later.
   *
   * For macOS configurations, set the `browserWindowWebView` to the policy "Prefer Modern"
   * (value `3`) to enable the SEB JavaScript API.
   *
   * @see https://safeexambrowser.org/developer/seb-config-key.html
   *
   * Types are obtained from the SEB source code.
   *
   * @see https://github.com/SafeExamBrowser/seb-mac/blob/6208692490f312566db251532b76b62ed33b9176/Classes/BrowserComponents/SEBAbstractModernWebView.swift
   */
  SafeExamBrowser?: {
    /**
     * Has the format `appDisplayName_<OS>_versionString_buildNumber_bundleID`. `<OS>` currently
     * can have the values `iOS`, `macOS` or `Windows`.
     *
     * This is set regardless whether `updateKeys()` is called.
     */
    version: string;
    security: {
      appVersion: string;

      /**
       * The Browser Exam Key (BEK) hashed with the URL of the page.
       *
       * @see https://safeexambrowser.org/developer/seb-config-key.html
       */
      browserExamKey: string;

      /**
       * The Config Key (CK) hashed with the URL of the page.
       *
       * @see https://safeexambrowser.org/developer/seb-config-key.html
       */
      configKey: string;

      /**
       * In SEB 3.0 for macOS/iOS, this function needs to be invoked first (for example in
       * `<body onload="...">`). Indicate a `callback` function as parameter, which will be called
       * asynchronously by SEB after updating `browserExamKey` and `configKey`.
       *
       * In SEB 3.3.2 for Windows and SEB 3.1 for macOS and iOS, calling this function is not
       * necessary, the `browserExamKey` and `configKey` are already set when the page is loaded.
       */
      updateKeys: (callback: () => void) => void;
    };
  };
}
