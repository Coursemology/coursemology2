/**
 * @see https://safeexambrowser.org/developer/seb-config-key.html
 */
export interface SafeExamBrowserAPI {
  version: string;
  security: {
    configKey: string;
    browserExamKey: string;
    updateKeys: () => void;
  };
}

export const getSEBConfigKey = (): string | undefined => {
  if (!('SafeExamBrowser' in globalThis)) return undefined;

  const SafeExamBrowser = globalThis.SafeExamBrowser as SafeExamBrowserAPI;
  return SafeExamBrowser.security.configKey;
};
