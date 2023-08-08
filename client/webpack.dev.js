const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const common = require('./webpack.common');
const packageJSON = require('./package.json');

const SERVER_PORT = packageJSON.devServer.serverPort;
const APP_HOST = packageJSON.devServer.appHost;

const BLUE_ANSI = '\x1b[36m%s\x1b[0m';

const logProxy = (source, destination) =>
  console.info(BLUE_ANSI, `[proxy] ${source} -> ${destination}`);

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    allowedHosts: [`.${APP_HOST}`],
    historyApiFallback: true,
    devMiddleware: {
      index: false,
    },
    proxy: {
      context: () => true,
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('origin', `http://${proxyReq.host}:${SERVER_PORT}`);
      },
      router: (request) => ({
        protocol: 'http:',
        host: request.headers.host.split(':')[0],
        port: SERVER_PORT,
      }),
      bypass: (request) => {
        const target = `${request.headers.host.split(':')[0]}:${SERVER_PORT}`;

        const isExplicitJSON = request.query.format === 'json';
        const isAttachment =
          request.url.startsWith('/uploads') ||
          request.url.startsWith('/attachments');

        if (isExplicitJSON || isAttachment) {
          logProxy(request.url, `${target}${request.url}`);
          return null;
        }

        return '/index.html';
      },
    },
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
