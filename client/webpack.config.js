const webpack = require('webpack');
const path = require('path');

const devBuild = process.env.NODE_ENV !== 'production';
const nodeEnv = devBuild ? 'development' : 'production';

const config = {
  entry: {
    coursemology: ['babel-polyfill', './app/index'],
    vendor: [
      'immutable',
      'jquery-ui',
      'material-ui',
      'moment',
      'react',
      'react-dom',
      'redux-form',
      'redux-immutable',
      'react-intl',
      'react-redux',
      'react-scroll',
      'redux',
      'redux-promise',
      'react-tap-event-plugin',
      'redux-thunk',
    ],
  },

  output: {
    filename: 'coursemology.bundle.js',
    chunkFilename: '[name]-[chunkhash].bundle.js',
    path: '../app/assets/webpack',
    publicPath: '/assets/',
  },

  externals: {
    jquery: 'jQuery',
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      lib: path.resolve('./app/lib'),
      api: path.resolve('./app/api'),
    },
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.bundle.js' }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(nodeEnv),
      },
    }),
  ],

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
        include: [
          path.resolve(__dirname, 'app/lib/styles/MaterialSummernote.scss'),
        ],
      },
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
          'sass-loader',
        ],
        exclude: [
          /node_modules/,
          path.resolve(__dirname, 'app/lib/styles/MaterialSummernote.scss'),
        ],
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },

  stats: {
    warnings: false,
  },
};

module.exports = config;

if (devBuild) {
  console.log('Webpack dev build for Rails'); // eslint-disable-line no-console
  module.exports.devtool = 'eval-source-map';
} else {
  config.plugins.push(
    new webpack.optimize.DedupePlugin()
  );
  console.log('Webpack production build for Rails'); // eslint-disable-line no-console
}
