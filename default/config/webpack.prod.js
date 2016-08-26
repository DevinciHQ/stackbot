var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge(commonConfig, {
  devtool: 'source-map',

  output: {
    path: helpers.root('dist'),
    publicPath: '/',
    filename: '[name].[hash].js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  htmlLoader: {
    minimize: false // workaround for ng2
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
        // beautify: true, //debug
        // mangle: false, //debug
        // dead_code: false, //debug
        // unused: false, //debug
        // deadCode: false, //debug
        // compress: {
        //   screw_ie8: true,
        //   keep_fnames: true,
        //   drop_debugger: false,
        //   dead_code: false,
        //   unused: false
        // }, // debug
        // comments: true, //debug

        /**
         * If true breaks the app.
         * https://github.com/mishoo/UglifyJS2/issues/999
         */
        mangle: {screw_ie8 : true, keep_fnames: true },

        beautify: false, //prod
        // mangle: {screw_ie8: true}, //prod
        compress: {screw_ie8: true}, //prod
        comments: false //prod
    }),
   new ExtractTextPlugin('[name].[hash].css'),
   //  new webpack.DefinePlugin({
   //    'process.env': {
   //      'ENV': JSON.stringify(ENV)
   //    }
   //  })
  ]
});

console.log('Ship production!');
