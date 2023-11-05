import ResizeObserverPonyfill from 'resize-observer-polyfill';

/**
 * The native `ResizeObserver` class if available, otherwise the ponyfill.
 * `@babel/preset-env` does not polyfill `ResizeObserver` because it's not an
 * ECMAScript specification.
 *
 * @see https://babeljs.io/docs/babel-preset-env#corejs
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#specifications
 */
const ResizeObserver = window.ResizeObserver || ResizeObserverPonyfill;

export default ResizeObserver;
