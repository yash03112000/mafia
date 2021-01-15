const webpack = require('webpack');
const merge = require('webpack-merge');

const helpers = require('./helpers');
const commonConfig = require('./webpack.common');
// const UglifyJsPlugin = require("uglifyjs-3-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
module.exports = merge(commonConfig, {
  mode: 'production',

  output: {
    filename: 'js/[name].[hash].js',
    chunkFilename: '[id].[hash].chunk.js'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  }
  // plugins: [
  //   new UglifyJsPlugin({
  //     uglifyOptions: {
  //       warnings: false,
  //       ie8: false,
  //       output: {
  //       comments: false
  //         }
  //       }
  //     })
  //   ]

});
