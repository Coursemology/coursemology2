const { join, resolve } = require('path');
const {
  IgnorePlugin,
  ContextReplacementPlugin,
  DefinePlugin,
} = require('webpack');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const DotenvPlugin = require('dotenv-webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const packageJSON = require('./package.json');

const ENV_DIR = process.env.BABEL_ENV === 'e2e-test' ? './.env.test' : './.env';

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: './app/index.tsx',
  output: {
    path: join(__dirname, 'build'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      api: resolve('./app/api'),
      assets: resolve('./app/assets'),
      lib: resolve('./app/lib'),
      theme: resolve('./app/theme'),
      types: resolve('./app/types'),
      utilities: resolve('./app/utilities'),
      bundles: resolve('./app/bundles'),
      course: resolve('./app/bundles/course'),
      testUtils: resolve('./app/__test__/utils'),
      workers: resolve('./app/workers'),
      store: resolve('./app/store'),
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: (_, chunks, cacheGroupKey) => {
        /**
         * Workers are not part of the `coursemology` runtime, so their dependencies
         * are packed in a separate chunk. This chunk has `name` set to `undefined`.
         * When simply `Array.prototype.join`ed, we will get weird chunk names like
         * `vendors~coursemology~.js` or `vendors~.js` that `application_helper.rb`
         * should inject. Normally, this isn't an issue with `HtmlWebpackPlugin`, but
         * since we don't have that and are manually injecting webpack assets in
         * `layouts/default.html.slim`, we combine these `undefined` chunks into
         * `coursemology`'s runtime. So, we have one `vendors~coursemology.js`.
         */
        const allChunksNames =
          chunks
            .map((chunk) => chunk.name)
            .filter((name) => Boolean(name))
            .join('~') || 'coursemology';

        const prefix =
          cacheGroupKey === 'defaultVendors' ? 'vendors' : cacheGroupKey;

        return `${prefix}~${allChunksNames}`;
      },
    },
    moduleIds: 'deterministic',
  },
  plugins: [
    new DotenvPlugin({ path: ENV_DIR }),
    new IgnorePlugin({ resourceRegExp: /__test__/ }),
    new WebpackManifestPlugin({
      publicPath: '/webpack/',
      writeToFileEmit: true,
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new FaviconsWebpackPlugin({ logo: './favicon.svg', inject: true }),
    // Do not require all locales in moment
    new ContextReplacementPlugin(/moment\/locale$/, /^\.\/(en-.*|zh-.*)$/),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: 'write-references',
      },
    }),
    new DefinePlugin({
      FIRST_BUILD_YEAR: JSON.stringify(packageJSON.firstBuildYear),
      LATEST_BUILD_YEAR: JSON.stringify(new Date().getFullYear()),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: [
          resolve(__dirname, 'node_modules/rc-slider/assets'),
          resolve(
            __dirname,
            'node_modules/react-image-crop/dist/ReactCrop.css',
          ),
          resolve(
            __dirname,
            'node_modules/react-tooltip/dist/react-tooltip.min.css',
          ),
          resolve(__dirname, 'app/lib/components/core/fields/CKEditor.css'),
          resolve(__dirname, 'app/lib/components/core/fields/AceEditor.css'),
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
        include: [resolve(__dirname, 'app/theme/index.css')],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        include: [resolve(__dirname, 'app/lib/styles')],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
              },
            },
          },
          'sass-loader',
        ],
        exclude: [/node_modules/, resolve(__dirname, 'app/lib/styles')],
      },
      {
        test: /\.(csv|png|svg)$/i,
        type: 'asset',
        resourceQuery: /url/, // *.(csv|png|svg)?url
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              typescript: true,
              ext: 'tsx',
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.md$/,
        type: 'asset/source',
      },
    ],
  },
};
