
var fs = require('fs');
var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ProgressPlugin = require('webpack/lib/ProgressPlugin');
var CompressionPlugin = require('compression-webpack-plugin');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var mainPath = path.resolve(__dirname, 'client', 'main.js');
var publicPath = path.resolve(__dirname, 'public');

var config = {
  progress: true,
  entry: {
    main: [
      // configuration for babel6
      'babel-polyfill',
      // example for single entry point. Multiple Entry bundle example will be added later
      './client/index.jsx'
    ]
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'public'),
    publicPath: '/'
  },
  module: {
    // preLoaders: [{
    //   test: /\.jsx$|\.js$/,
    //   loader: 'eslint-loader',
    //   include: __dirname + '/client/'
    // }],
    loaders: [{
      test: /\.jsx?$/,
      include: path.join(__dirname, 'client'),
      loader: "babel-loader",
      exclude: [nodeModulesPath]
    }, {
      test: /\.css$/,
      include: path.join(__dirname, 'client'),
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader'),
    }, {
      test: /\.(jpg|png)$/,
      loader: 'url-loader',
      options: {
        limit: 25000,
      },
    }]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: true,
    }),
    new webpack.DefinePlugin({
      __DEVELOPMENT__: false,
      __SERVERHOST__: JSON.stringify(process.env.host),
      __SERVERPORT__: JSON.stringify(process.env.port),
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('[name].css'),
    new CompressionPlugin()
  ],
  resolve: {
    // Allow to omit extensions when requiring these files
    extensions: ["", ".js", ".jsx"],
    modulesDirectories: [
      'node_modules'
    ]
  }
}

module.exports = config;