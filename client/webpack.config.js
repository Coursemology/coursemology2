const webpack = require('webpack');
const path = require('path');
const WebpackMd5Hash = require('webpack-md5-hash');
const StatsPlugin = require('stats-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const production = env === 'production';
const development = env === 'development';

// must match config.webpack.dev_server.port
const devServerPort = 8080;

const config = {
  entry: {
    coursemology: ['babel-polyfill', './app/index'],
    vendor: [
      'axios',
      'immutable',
      'jquery-ui',
      'material-ui',
      'moment',
      'react',
      'react-ace',
      'react-dom',
      'react-intl',
      'react-redux',
      'react-router',
      'react-scroll',
      'react-summernote',
      'react-tap-event-plugin',
      'redux',
      'redux-form',
      'redux-immutable',
      'redux-promise',
      'redux-thunk',
    ],
  },

  output: {
    filename: production ? '[name]-[chunkhash].js' : '[name].js',
    chunkFilename: production ? '[name]-[chunkhash].js' : '[name].js',
    path: path.join(__dirname, '..', 'public', 'webpack'),
    publicPath: '/webpack/',
  },

  externals: {
    jquery: 'jQuery',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true,
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      lib: path.resolve('./app/lib'),
      api: path.resolve('./app/api'),
    },
  },

  plugins: [
    new webpack.IgnorePlugin(/__test__/),
    new WebpackMd5Hash(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    // must match config.webpack.manifest_filename
    new StatsPlugin('manifest.json', {
      chunkModules: false,
      source: false,
      chunks: false,
      modules: false,
      assets: true,
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
};

if (development) {
  config.devServer = {
    compress: true,
    port: devServerPort,
    headers: { 'Access-Control-Allow-Origin': '*' },
  };
  config.output.publicPath = `//localhost:${devServerPort}/webpack/`;
  config.devtool = 'cheap-module-eval-source-map';
} else {
  console.log(`\nWebpack ${env} build for Rails...`); // eslint-disable-line no-console
}

module.exports = config;
