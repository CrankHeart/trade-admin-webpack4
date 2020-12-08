const path = require( 'path' )
const utils = require( './utils' )
const webpack = require( 'webpack' )
const config = require( '../config' )
const merge = require( 'webpack-merge' )
const baseWebpackConfig = require( './webpack.base.conf' )
const CopyWebpackPlugin = require( 'copy-webpack-plugin' )
const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const OptimizeCSSAssetsPlugin = require( 'optimize-css-assets-webpack-plugin' )
// const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin
const AddAssetHtmlPlugin = require( 'add-asset-html-webpack-plugin' )
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' )

const createDllReferencePlugin = function () {
  return utils.dllFiles( '*.json' ).map( v => {
    return new webpack.DllReferencePlugin( {
      manifest: v
    } )
  } )
}

function resolve( dir ) {
  return path.join( __dirname, '..', dir )
}

const env = process.env.NODE_ENV === 'testing' ?
  require( '../config/test.env' ) :
  config.build.env

const webpackConfig = merge( baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: utils.styleLoaders( {
      sourceMap: config.build.productionSourceMap,
      extract: true
    } )
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath( 'js/[name].[chunkhash].js' ),
    chunkFilename: utils.assetsPath( 'js/[id].[chunkhash].js' )
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin( {
      'process.env': env
    } ),
    // process.env.NODE_ENV == 'production' ? new webpack.optimize.UglifyJsPlugin( {
    //   compress: {
    //     warnings: false,
    //     drop_debugger: true,
    //     drop_console: true
    //   },
    //   sourceMap: true
    // } ) : function () { },
    // extract css into its own file
    new MiniCssExtractPlugin( {
      filename: utils.assetsPath( 'css/[name].[contenthash].css' )
    } ),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin( {
      filename: process.env.NODE_ENV === 'testing' ?
        'index.html' : config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    } ),

    new HtmlWebpackPlugin( {
      filename: 'print.html',
      template: 'print.html',
      inject: false
    } ),

    new AddAssetHtmlPlugin( [ {
      filepath: utils.dllPath( '*.js' ),
      hash: true,
      publicPath: utils.assetsPath( '/dll' ),
      outputPath: utils.assetsPath( '/dll' ),
      includeSourcemap: false
    } ] ),
    ...createDllReferencePlugin(),
    // copy custom static assets
    // new CopyWebpackPlugin([
    //   {
    //     from: path.resolve(__dirname, '../static'),
    //     to: config.build.assetsSubDirectory,
    //     ignore: ['.*']
    //   }
    // ])
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        libs: {
          name: 'chunk-libs',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial'
        },
        elementUI: {
          name: 'chunk-elementUI',
          priority: 20,
          test: /[\\/]node_modules[\\/]element-ui[\\/]/
        },
        commons: {
          name: 'chunk-comomns',
          test: resolve( 'src/components' ),
          minChunks: 3,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: 'single',
    minimizer: [
      new UglifyJsPlugin( {
        uglifyOptions: {
          mangle: {
            safari10: true
          }
        },
        sourceMap: config.build.productionSourceMap,
        cache: true,
        parallel: true
      } ),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSAssetsPlugin( {
        cssProcessorOptions: {
          safe: true
        }
      } )
    ]
  }
} )

if ( config.build.productionGzip ) {
  const CompressionWebpackPlugin = require( 'compression-webpack-plugin' )

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin( {
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join( '|' ) +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    } )
  )
}

if ( config.build.bundleAnalyzerReport ) {
  const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin
  webpackConfig.plugins.push( new BundleAnalyzerPlugin() )
}

module.exports = webpackConfig
