const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const common = require('./webpack.common');

const AVAILABLE_CPUS = +process.env.AVAILABLE_CPUS;

/**
 * @type {import('webpack').Configuration}
 */
module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: '[name]-[contenthash].js',
    publicPath: '/static/',
  },
  optimization: {
    usedExports: true,
    minimizer: [
      new TerserPlugin({
        parallel: AVAILABLE_CPUS || true,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
    ],
  },
});
