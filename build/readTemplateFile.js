const fs = require( 'fs' )
const path = require( 'path' )

//let filePath = 'src\\pages\\themeEvent\\modules'
let filePath = path.resolve( 'src/pages/themeEvent/modules' )
//let modulePath = filePath + '\\template\\'
let modulePath = path.resolve( filePath, 'template' )
//let outFile = filePath + '\\asyncComponentNames.yaml'
let outFile = path.resolve( filePath, 'asyncComponentNames.yaml' )
fs.writeFile( outFile, '', function ( err, data ) { } )


// 调用文件遍历方法
fileDisplay( modulePath )

function fileDisplay( filePath ) {
  // 根据文件路径读取文件，返回文件列表
  fs.readdir( filePath, function ( err, files ) {
    if ( err ) {
      console.warn( err )
    } else {
      // 遍历读取到的文件列表
      files.forEach( function ( filename ) {
        // 获取当前文件的绝对路径
        const filedir = path.join( filePath, filename )
        // 根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat( filedir, function ( eror, stats ) {
          if ( eror ) {
            console.warn( '获取文件stats失败' )
          } else {
            const isFile = stats.isFile() // 是文件
            const isDir = stats.isDirectory() // 是文件夹
            if ( isFile ) {

              if ( /\.vue$/i.test( filedir ) ) {

                appendToFile( filedir )
              }
            }
            if ( isDir ) {
              fileDisplay( filedir ) // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
          }
        } )
      } )
    }
  } )
}

function appendToFile( str ) {

  // let str = 'export default ' + JSON.stringify( o.map( v => v.replace( modulePath, '' ).replace( '\\', '/' ) ) )
  // // console.log( str, 1 )
  // fs.writeFile( filePath + '/asyncComponentNames.js', '' + str, function ( err, data ) {
  //   fs.writeFile( filePath + '/asyncComponentNames.js', '/* eslint-disable */\n' + str, function ( err, data ) {

  //   } )
  // } )
  //str = str.replace( 'src\\pages\\themeEvent\\modules\\template\\', '' ).replace( '\\', '/' )
  // mac 下路径兼容修复
  str = str.replace( /(.*)template[\/\\](.*)/, '$2' ).replace( '\\', '/' )
  let key = str.replace( /(\\\w{1})/g, v => v.substr( 1 ).toUpperCase() )
  const log = fs.createWriteStream( outFile, { 'flags': 'a' } );
  // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
  log.write( '- ' + str + '\n' );

}

