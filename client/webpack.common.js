const { join, resolve } = require('path');
const {
  IgnorePlugin,
  ContextReplacementPlugin,
  DefinePlugin,
} = require('webpack');
const DotenvPlugin = require('dotenv-webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const packageJSON = require('./package.json');
const cssIncludes = require('./css-includes.json');

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
    },
    moduleIds: 'deterministic',
  },
  plugins: [
    new DotenvPlugin({ path: ENV_DIR }),
    new IgnorePlugin({ resourceRegExp: /__test__/ }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new FaviconsWebpackPlugin({
      logo: './favicon.svg',
      inject: true,
      mode: 'auto',
    }),
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
        use: [
          'style-loader',
          { loader: 'css-loader', options: { sourceMap: false } },
          'postcss-loader',
        ],
        include: cssIncludes.map((path) => resolve(__dirname, path)),
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              modules: {
                localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
              },
            },
          },
          'postcss-loader',
          'sass-loader',
        ],
        exclude: [/node_modules/],
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
