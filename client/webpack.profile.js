const { merge } = require('webpack-merge');
const { ProgressPlugin } = require('webpack');

const dev = require('./webpack.dev');

module.exports = merge(dev, {
  plugins: [
    new ProgressPlugin({
      activeModules: true,
      entries: true,
      modules: true,
      profile: true,
      dependencies: true,
    }),
  ],
});
