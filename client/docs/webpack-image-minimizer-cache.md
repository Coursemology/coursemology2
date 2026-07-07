# Production build fails: "Can't handle conflicting asset info for sourceFilename"

## Symptom

`yarn build:test` (and `yarn build:production`) intermittently fails with a handful of errors like:

```
ERROR in ./app/index.tsx + 11 modules
Can't handle conflicting asset info for sourceFilename
while analyzing module asset|.../image-minimizer-webpack-plugin/dist/loader.js??ruleSet[1].rules[8]!.../app/assets/error-illustration.svg?url for concatenation
```

The failing modules are always the **`*.svg?url` imports** — currently:

- `app/assets/error-illustration.svg?url` (via `ContextualErrorPage.tsx`)
- `app/assets/forbidden-illustration.svg?url`, `not-found-illustration.svg?url` (via `ErrorPage.tsx`)
- `app/assets/powered-by-cikgo.svg?url` (via `StoriesSettings/.../Introduction.tsx`)

It is **not** related to any application code change — adding/removing feature code merely shifts which entrypoints report the error.

## Immediate workaround

```bash
rm -rf client/node_modules/.cache   # then re-run the build
```

The error only appears on a **warm** webpack filesystem cache; a cold build succeeds.

## Who is affected

| Command | Config | Affected? |
| --- | --- | --- |
| `yarn build:test`, `yarn build:production` | `webpack.prod.js` | **Yes** |
| `yarn build:development`, `yarn build:development-https` | `webpack.dev.js` | No |

`webpack.dev.js` does not run `ImageMinimizerPlugin`, so dev/HTTPS serving is unaffected. This is why
manual testing via `build:development-https` works even when `build:test` is broken.

## Root cause

Three things combine in `webpack.prod.js`:

1. **`cache: { type: 'filesystem' }`** — module `buildInfo` (including `assetInfo.sourceFilename`) is persisted
   to `node_modules/.cache` and restored on the next build.
2. **`ImageMinimizerPlugin({ test: /\.svg$/i, ... svgoMinify })`** — used in plugin form, it auto-injects a
   per-module loader (`image-minimizer-webpack-plugin/dist/loader.js`, `ruleSet[1].rules[8]`) onto every
   `type: 'asset'` SVG. Our `*.svg?url` imports are exactly those asset modules (see the `resourceQuery: /url/`
   rule in `webpack.common.js`); component SVGs go through `@svgr/webpack` and become JS, so the minimizer
   loader effectively only touches the `?url` illustrations.
3. **`ModuleConcatenationPlugin`** (default in `mode: 'production'`) — when it concatenates a scope that pulls
   in one of these asset modules, it re-derives the asset's `sourceFilename`.

On a warm cache, the `sourceFilename` restored for the minimizer-processed asset module conflicts with the one
recomputed during concatenation, and webpack throws `Can't handle conflicting asset info for sourceFilename`.
This is a known `image-minimizer-webpack-plugin` + filesystem-cache interaction (plugin v5.0.0, webpack 5.106.2).

## Candidate permanent fixes (evaluate; none applied yet)

Ranked by expected effort/impact. All should be validated with a **warm** cache (build twice) since the bug
only reproduces on the second build.

1. **Stop minifying `?url` SVGs with the plugin loader (recommended).** These four illustrations are small and
   only referenced on error/marketing pages. Narrow `ImageMinimizerPlugin`'s SVG matcher so it does not attach
   its loader to `type: 'asset'` SVGs (e.g. drop the SVG `ImageMinimizerPlugin` entirely, or minify SVGs at the
   source rule with `svgo-loader` instead). Removes the conflicting loader from the cached asset modules.
2. **Bump `image-minimizer-webpack-plugin`.** We are on `5.0.0`; check the changelog for a release fixing the
   `sourceFilename` conflict under `cache: filesystem`, then upgrade.
3. **Key the cache so stale entries can't be reused.** Add `cache.version` / `cache.name` (or
   `cache.buildDependencies`) in `webpack.prod.js`. This mostly automates the `rm -rf .cache` workaround rather
   than fixing the underlying conflict; least preferred.

## References

- `client/webpack.prod.js` — `cache`, `ImageMinimizerPlugin` (SVG), production `mode`.
- `client/webpack.common.js` — `*.svg?url` asset rule vs. `@svgr/webpack` component rule.
