const { join, resolve } = require('path');
const { IgnorePlugin, ContextReplacementPlugin } = require('webpack');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

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
      lib: resolve('./app/lib'),
      theme: resolve('./app/theme'),
      types: resolve('./app/types'),
      utilities: resolve('./app/utilities'),
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
        use: ['style-loader', 'css-loader'],
        include: [resolve(__dirname, 'node_modules/rc-slider/assets')],
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
