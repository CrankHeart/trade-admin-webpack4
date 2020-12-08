const path = require( 'path' )
const glob = require( "glob" )
const config = require( '../config' )
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )

exports.assetsPath = function ( _path ) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production' ?
    config.build.assetsSubDirectory :
    config.dev.assetsSubDirectory
  return path.posix.join( assetsSubDirectory, _path )
}
exports.dllPath = function ( ..._path ) {
  return path.resolve( config.build.dllRoot, ..._path )
}
exports.dllFiles = function ( pattern ) {
  const files = glob.sync( pattern, {
    root: config.build.dllRoot,
    cwd: config.build.dllRoot,
    nodir: true,
    realpath: true
  } )
  return files
}

exports.cssLoaders = function ( options ) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }
  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders( loader, loaderOptions ) {
    const loaders = []

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if ( options.extract ) {
      loaders.push( MiniCssExtractPlugin.loader )
    } else {
      loaders.push( 'vue-style-loader' )
    }
    loaders.push( cssLoader )

    if ( options.usePostCSS ) {
      loaders.push( postcssLoader )
    }
    if ( loader ) {
      loaders.push( {
        loader: loader + '-loader',
        options: Object.assign( {}, loaderOptions, {
          sourceMap: options.sourceMap
        } )
      } )
    }

    return loaders
  }

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders( 'less' ),
    sass: generateLoaders( 'sass', { indentedSyntax: true } ),
    scss: generateLoaders( 'sass' ),
    stylus: generateLoaders( 'stylus' ),
    styl: generateLoaders( 'stylus' )
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function ( options ) {
  const output = []
  const loaders = exports.cssLoaders( options )
  for ( const extension in loaders ) {
    const loader = loaders[ extension ]
    output.push( {
      test: new RegExp( '\\.' + extension + '$' ),
      use: loader
    } )
  }
  return output
}
