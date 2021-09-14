const webpack = require('webpack');
const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const production = env === 'production';
const development = env === 'development';
const travis = process.env.TRAVIS === 'true';

const config = {
  mode: env,

  entry: {
    coursemology: [
      '@babel/polyfill',
      'jquery',
      './app/index',
      './app/lib/moment-timezone',
    ],
  },

  output: {
    filename: production ? '[name]-[chunkhash].js' : '[name].js',
    path: path.join(__dirname, '..', 'public', 'webpack'),
    publicPath: '/webpack/',
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      lib: path.resolve('./app/lib'),
      api: path.resolve('./app/api'),
      course: path.resolve('./app/bundles/course'),
    },
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },

  plugins: [
    new webpack.IgnorePlugin(/__test__/),
    new webpack.HashedModuleIdsPlugin(),
    new ManifestPlugin({ publicPath: '/webpack/', writeToFileEmit: true }),
    // Do not require all locales in moment
    new webpack.ContextReplacementPlugin(
      /moment\/locale$/,
      /^\.\/(en-.*|zh-.*)$/
    ),
  ],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        include: [
          path.resolve(__dirname, 'app/lib/styles/MaterialSummernote.scss'),
          path.resolve(
            __dirname,
            'app/lib/styles/MaterialSummernoteModal.scss'
          ),
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
              localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
            },
          },
          'sass-loader',
        ],
        exclude: [
          /node_modules/,
          path.resolve(__dirname, 'app/lib/styles/MaterialSummernote.scss'),
          path.resolve(
            __dirname,
            'app/lib/styles/MaterialSummernoteModal.scss'
          ),
        ],
      },
      {
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: 'jQuery',
          },
          {
            loader: 'expose-loader',
            options: '$',
          },
        ],
      },
      {
        test: require.resolve('./app/lib/moment-timezone'),
        use: [
          {
            loader: 'expose-loader',
            options: 'moment',
          },
        ],
      },
    ],
  },
};

if (development) {
  const devServerPort = 8080;
  config.devServer = {
    port: devServerPort,
    headers: { 'Access-Control-Allow-Origin': '*' },
  };
  config.output.publicPath = `//localhost:${devServerPort}/webpack/`;
  config.devtool = 'cheap-module-eval-source-map';
} else {
  console.log(`\nWebpack ${env} build for Rails...`); // eslint-disable-line no-console
}

// Only enable HardSourceWebpackPlugin in Travis
if (travis) {
  config.plugins.push(
    new HardSourceWebpackPlugin({
      cacheDirectory: path.join(__dirname, 'hard-source-cache/[confighash]'),
    })
  );
}

module.exports = config;
