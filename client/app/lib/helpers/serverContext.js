const serverContext = document.querySelector("meta[name='server-context']");

function getServerContextAttribute(attributeName) {
  return serverContext ? serverContext.getAttribute(attributeName) : null;
}

const modulePath = getServerContextAttribute('data-controller-name');
const i18nLocale = getServerContextAttribute('data-i18n-locale');
const timeZone = getServerContextAttribute('data-time-zone');

const csrfTag = document.querySelector('meta[name="csrf-token"]');
const csrfToken = csrfTag ? csrfTag.getAttribute('content') : null;

export { modulePath, i18nLocale, timeZone, csrfToken };
