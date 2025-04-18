const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');

const common = require('./webpack.common');

const AVAILABLE_CPUS = +process.env.AVAILABLE_CPUS;

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
  plugins: [new MomentTimezoneDataPlugin({ startYear: 2014 })],
});
