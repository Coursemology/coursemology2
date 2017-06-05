const webpack = require('webpack');
const path = require('path');
const StatsPlugin = require('stats-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const production = env === 'production';
const development = env === 'development';

// must match config.webpack.dev_server.port
const devServerPort = 8080;

const config = {
  entry: {
    coursemology: ['babel-polyfill', './app/index'],
    lib: [
      'babel-polyfill',
      'axios',
      'brace',
      'immutable',
      'mirror-creator',
      'moment',
      'moment-timezone',
      'react',
      'react-ace',
      'react-dnd',
      'react-dnd-html5-backend',
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
      'webfontloader',
    ],
    // Vendor contains the libraries that are not in a single bundle (size could change depends on
    // application code)
    vendor: [
      'jquery-ui',
      'material-ui',
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
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      lib: path.resolve('./app/lib'),
      api: path.resolve('./app/api'),
      course: path.resolve('./app/bundles/course'),
    },
  },

  plugins: [
    new webpack.IgnorePlugin(/__test__/),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'lib', 'manifest'], // `vendor` depends on `lib` depends on `manifest`
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    // Do not require all locles in moment
    new webpack.ContextReplacementPlugin(/moment\/locale$/, /^\.\/(en-.*|zh-.*)$/),
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
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
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
        ],
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
