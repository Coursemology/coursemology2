const { merge } = require('webpack-merge');

const common = require('./webpack.common');

const DEV_SERVER_PORT = 8080;

module.exports = merge(common, {
  mode: 'development',
  output: {
    filename: '[name].js',
    publicPath: `//localhost:${DEV_SERVER_PORT}/webpack/`,
    pathinfo: false,
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
});
