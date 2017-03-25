import injectTapEventPlugin from 'react-tap-event-plugin';
import EventPluginRegistry from 'react-dom/lib/EventPluginRegistry';

/**
 * Injects tap event plugin if it has not already been injected.
 */
export default function () {
  if (!EventPluginRegistry.registrationNameModules.onTouchTap) {
    // Needed for onTouchTap http://stackoverflow.com/a/34015469/988941
    injectTapEventPlugin();
  }
}
