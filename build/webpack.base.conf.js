const path = require( 'path' )
const utils = require( './utils' )
const config = require( '../config' )
const VueLoaderPlugin = require( 'vue-loader/lib/plugin' )
const vueLoaderConfig = require( './vue-loader.conf' )
const ForkTsCheckerWebpackPlugin = require( 'fork-ts-checker-webpack-plugin' );
const resolve = ( dir ) => {
  return path.join( __dirname, '..', dir )
}


const createLintingRule = () => ( {
  test: /\.(js|ts|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [ resolve( 'src' ), resolve( 'test' ) ],
  options: {
    formatter: require( 'eslint-friendly-formatter' ),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
} )
const baseConfig = {
  entry: {
    app: './src/main.ts'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV ?
      config.build.assetsPublicPath : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: [ '.js', '.ts', '.vue', '.json', '.yaml' ],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve( 'src' ),
    }
  },
  performance: {
    hints: false
  },
  module: {
    rules: [
      ...( config.dev.useEslint ? [ createLintingRule() ] : [] ),
      {
        test: /\.js$/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 5
            }
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ],
        include: [ resolve( 'src' ), resolve( 'test' ), resolve( 'node_modules/webpack-dev-server/client' ) ]
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'eslint-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.html$/,
        loader: 'vue-html-loader'
      },
      {
        test: /\.yaml$/,
        type: 'json',
        exclude: /node_modules/,
        use: 'yaml-loader'
        // loader: 'json-loader!yaml-loader'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
          appendTsSuffixTo: [ /\.vue$/ ]
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1000,
          name: utils.assetsPath( 'img/[name].[hash:7].[ext]' )
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 15000,
          name: utils.assetsPath( 'fonts/[name].[hash:7].[ext]' )
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    // new ForkTsCheckerWebpackPlugin({
    //     tsconfig: resolve('tsconfig.json')
    // })
    // new RouterCreatePlugin( configRoute )
  ]
}
console.log( new Date() )
// if ( process.env.NODE_ENV ) {
//   baseConfig.externals = {
//     'vue': 'Vue',
//     'vue-router': 'VueRouter',
//     'vuex': 'Vuex',
//     'element-ui': 'ELEMENT'
//   }
// }
module.exports = baseConfig
