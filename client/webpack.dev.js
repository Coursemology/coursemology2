const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const common = require('./webpack.common');

const DEV_SERVER_PORT = 8080;
const DEFAULT_LOCALHOST_HOST = 'localhost:5000';

module.exports = merge(common, {
  mode: 'development',
  output: {
    filename: '[name].js',
    pathinfo: false,
    publicPath: `//localhost:${DEV_SERVER_PORT}/webpack/`,

    /**
     * If the host name of the app (e.g., `localhost:5000`) is different from
     * that of webpack-dev-server's (e.g., `localhost:8080`), worker scripts
     * and assets packed by webpack will be hosted under webpack-dev-server's
     * host name. Accessing these resources from the app's host name will
     * trigger `SecurityError` in-browser due to the different origins. Forcing
     * webpack-dev-server's `publicPath` to the app's host name bypasses this,
     * but may not work if the app is hosted on multiple different domains,
     * e.g., on both `localhost` and ngrok.
     */
    workerPublicPath: `//${DEFAULT_LOCALHOST_HOST}/webpack/`,
  },
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    port: DEV_SERVER_PORT,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
  },
  plugins: [new ReactRefreshWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheCompression: false,
            cacheDirectory: true,
            plugins: ['react-refresh/babel'],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
});
