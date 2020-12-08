const utils = require( './utils' )
const webpack = require( 'webpack' )
const config = require( '../config' )
const merge = require( 'webpack-merge' )
const baseWebpackConfig = require( './webpack.base.conf' )
const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const FriendlyErrorsPlugin = require( 'friendly-errors-webpack-plugin' )

// add hot-reload related code to entry chunks
// Object.keys( baseWebpackConfig.entry ).forEach( function ( name ) {
//   baseWebpackConfig.entry[ name ] = [ './build/dev-client' ].concat( baseWebpackConfig.entry[ name ] )
// } )

const HOST = process.env.HOST
const PORT = process.env.PORT && Number( process.env.PORT )

const devWebpackConfig = merge( baseWebpackConfig, {
  mode: 'development',
  module: {
    rules: utils.styleLoaders( { sourceMap: config.dev.cssSourceMap, usePostCSS: false } )
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: true,
    hot: true,
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true,
    hotOnly: true
  },
  plugins: [
    new webpack.DefinePlugin( {
      'process.env': config.dev.env
    } ),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin( {
      filename: 'index.html',
      template: 'index.html',
      inject: true
    } ),
    new HtmlWebpackPlugin( {
      filename: 'print.html',
      template: 'print.html',
      inject: false
    } ),
    new FriendlyErrorsPlugin()
  ]
} )

module.exports = devWebpackConfig
