import API from '../../../API/'

export const fileUpload = ( vnode, { target }, { themeEventId }, callBack = ( ...arg ) => { }, type = 0 ) => {
  let file = target.files[ 0 ] || {}
  let o = {}
  let fileType = ''
  let fileSize = 0
  try {
    fileType = ( ( file.name || '' ).split( '.' ).slice( -1 )[ 0 ] || '' ).toLowerCase()
    fileSize = file.size
  } catch ( e ) { }

  if ( !( /(bmp|jp(e?)g|png|gif|svg)/.test( fileType ) ) ) {
    vnode.$message( {
      type: 'error',
      message: '上传图片格式错误！'
    } )
    return false
  }

  o[ 'imgPath[0]' ] = file
  o.type = type
  o.themeEventId = themeEventId

  const formData = new FormData()
  for ( let i in o ) {
    formData.append( i, o[ i ] )
  }

  vnode.$http( API.uploadThemeEventImg, formData, {
    headers: {
      'Content-type': 'multipart/form-data'
    }
  } ).then( ( { data } ) => {
    // console.log( data )
    callBack( data )
  } )
}