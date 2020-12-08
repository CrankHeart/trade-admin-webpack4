const webpack = require( "webpack" )
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );
const config = require( '../config' )
const utils = require( './utils' )


const webpackConfig = {
    entry: {
        vendor1: [ 'vue/dist/vue.esm.js' ],
        vendor2: [ 'vue-router', 'vuex', 'axios' ],
        vendor3: [ 'echarts' ]
    },
    output: {
        path: config.build.dllRoot,
        filename: 'dll.[name].js',
        library: "[name]_[hash]"
    },
    plugins: [
        new webpack.DllPlugin( {
            path: utils.dllPath( 'manifest.[name].json' ),
            name: "[name]_[hash]"
        } ),
        new UglifyJsPlugin( {
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            },
            sourceMap: config.build.productionSourceMap,
            parallel: true
        } ),
    ]
}

module.exports = webpackConfig
