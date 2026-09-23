import { createBrowserRouter } from 'react-router-dom';

type RouterFutureFlags = NonNullable<
  NonNullable<Parameters<typeof createBrowserRouter>[1]>['future']
>;

/**
 * React Router v6 opt-ins for behaviours that become the default in v7.
 *
 * Adopting them one at a time on v6 is what makes the eventual v7 bump a
 * dependency change rather than a behavioural one: if something regresses, it is
 * traceable to a single flag and revertable on its own. Both `createBrowserRouter`
 * call sites share this constant so the two routers can never drift apart.
 *
 * Note router tests mount a bare MemoryRouter, never a data router,
 * so they cannot exercise these flags at all.
 */
export const ROUTER_FUTURE_FLAGS = {
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_skipActionErrorRevalidation: true,
  v7_partialHydration: true,
} satisfies Partial<RouterFutureFlags>;

export default ROUTER_FUTURE_FLAGS;
