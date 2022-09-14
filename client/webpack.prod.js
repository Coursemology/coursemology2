const { merge } = require('webpack-merge');

const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: '[name]-[contenthash].js',
    publicPath: '/webpack/',
  },
  optimization: {
    usedExports: true,
  },
});
