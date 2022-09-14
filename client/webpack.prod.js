const { merge } = require('webpack-merge');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: '[name]-[contenthash].js',
    publicPath: '/webpack/',
  },
  plugins: [
    new HardSourceWebpackPlugin({
      cacheDirectory: join(__dirname, 'hard-source-cache/[confighash]'),
    }),
  ],
  optimization: {
    usedExports: true,
  },
});
