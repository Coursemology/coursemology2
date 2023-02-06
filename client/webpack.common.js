const { join, resolve } = require('path');
const { IgnorePlugin, ContextReplacementPlugin } = require('webpack');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const Dotenv = require('dotenv-webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const styleLoader = 'style-loader';
const cssLoader = 'css-loader';
const sassLoader = 'sass-loader';

module.exports = {
  entry: {
    coursemology: [
      '@babel/polyfill',
      'jquery',
      './app/index',
      './app/lib/moment-timezone',
    ],
  },
  output: {
    path: join(__dirname, '..', 'public', 'webpack'),
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
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: (_module, chunks, cacheGroupKey) => {
        const allChunksNames = chunks.map((chunk) => chunk.name).join('~');
        const prefix =
          cacheGroupKey === 'defaultVendors' ? 'vendors' : cacheGroupKey;
        return `${prefix}~${allChunksNames}`;
      },
    },
    moduleIds: 'deterministic',
  },
  plugins: [
    new Dotenv(),
    new IgnorePlugin({ resourceRegExp: /__test__/ }),
    new WebpackManifestPlugin({
      publicPath: '/webpack/',
      writeToFileEmit: true,
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
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheCompression: false,
            cacheDirectory: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [styleLoader, cssLoader],
        include: [
          resolve(__dirname, 'node_modules/rc-slider/assets'),
          resolve(
            __dirname,
            'node_modules/react-image-crop/dist/ReactCrop.css',
          ),
        ],
      },
      {
        test: /\.css$/,
        use: [styleLoader, cssLoader, 'postcss-loader'],
        include: [resolve(__dirname, 'app/theme/index.css')],
      },
      {
        test: /\.scss$/,
        use: [styleLoader, cssLoader, sassLoader],
        include: [resolve(__dirname, 'app/lib/styles')],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          styleLoader,
          {
            loader: cssLoader,
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
              },
            },
          },
          sassLoader,
        ],
        exclude: [
          /node_modules/,
          resolve(__dirname, 'app/lib/styles'),
          resolve(__dirname, 'app/lib/components/core/layouts/layout.scss'),
          resolve(__dirname, 'app/lib/components/core/fields/CKEditor.scss'),
        ],
      },
      {
        test: /\.scss$/,
        use: [
          styleLoader,
          cssLoader,
          {
            loader: sassLoader,
            options: {
              sassOptions: {
                includePaths: [join(__dirname, '..', 'app/assets/stylesheets')],
              },
            },
          },
        ],
        include: [
          resolve(__dirname, 'app/lib/components/core/layouts/layout.scss'),
          resolve(__dirname, 'app/lib/components/core/fields/CKEditor.scss'),
        ],
        exclude: [/node_modules/, resolve(__dirname, 'app/lib/styles')],
      },
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: /url/, // *.svg?url
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
        test: require.resolve('jquery'),
        loader: 'expose-loader',
        options: {
          exposes: ['jQuery', '$'],
        },
      },
      {
        test: require.resolve('./app/lib/moment-timezone'),
        loader: 'expose-loader',
        options: {
          exposes: 'moment',
        },
      },
    ],
  },
};
