const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

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
    clean: true,
  },
  cache: {
    type: 'filesystem',
  },
  optimization: {
    usedExports: true,
    minimizer: [
      new TerserPlugin({
        parallel: AVAILABLE_CPUS || true,
        minify: TerserPlugin.swcMinify,
        extractComments: false,
        terserOptions: {
          compress: true,
          mangle: true,
          format: { comments: false },
        },
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
  plugins: [
    new MomentTimezoneDataPlugin({ startYear: 2014 }),
    new ImageMinimizerPlugin({
      test: /\.(jpe?g|png|gif)$/i,
      minimizer: {
        implementation: ImageMinimizerPlugin.sharpMinify,
        options: {
          encodeOptions: {
            png: {
              quality: 90,
              compressionLevel: 9,
            },
          },
        },
      },
    }),
    new ImageMinimizerPlugin({
      test: /\.svg$/i,
      minimizer: {
        implementation: ImageMinimizerPlugin.svgoMinify,
      },
    }),
  ],
});
