import axios from 'axios'

import API, { baseURL } from '../API'

import { MessageBox, Notification } from 'element-ui'

import store from '../vuex/index'

Object.assign( axios.defaults, {
  // baseURL,
  headers: {
    'content-type': 'text/plain;charset=UTF-8'
  }
} )

axios.interceptors.request.use( ( config: any ) => {
  // config.data = Object.assign( {}, config.data )
  config.data = config.data || {}
  config.broadcast = config.data.broadcast || false
  let url = config.url
  // 如果是pms的接口content-type设置为application/json
  let str = url.slice( 0, 5 )
  if ( str === '/pms/' ) {
    config.headers[ 'content-type' ] = 'application/json'
  }
  if ( /^http/.test( url ) ) {
    config.url = url
    return config
  } else {
    // if ( process.env.NODE_ENV == 'production' && str === '/pms/' ) {
    //   config.url = baseURL.replace( /\/eop$/, '' ) + url
    // } else {
    //   config.url = baseURL + url
    // }
    config.url = baseURL + url
  }

  if ( config.url.indexOf( API.login ) > -1 ) return config
  let state: any = store.state
  const { userName, memberId, token } = state.login
  config.headers.authorization = token

  if ( config.data instanceof FormData ) {
    config.data.append( 'userName', userName )
    config.data.append( 'memberId', memberId )
    config.data.append( 'clientType', 'Admin' )
  } else {
    config.data.userName = userName
    config.data.memberId = memberId
    config.data.clientType = 'Admin'
  }
  return config
}, error => {
  return Promise.reject( error );
} )

const post = ( ...arg ) => {
  return new Promise( ( resolve, reject ) => {
    axios.post.apply( null, arg ).catch( res => {
      Notification( {
        type: 'error',
        message: '网络异常'
      } )
    } ).then( ( res: any = { data: {} } ) => {
      let data = res.data
      if ( data.code === 'B0001' ) {
        store.commit( 'login/logIn', {} )
        // window.location.reload()
        location.href = '/trade-manage/'
      } else if ( data.code === 'B0002' ) {
        Notification( {
          type: 'error',
          title: '权限不足',
          message: '当前用户没有操作权限！'
        } )
        return reject( res )
      }
      let config: any = res.config || {}
      if ( config.broadcast ) {
        let type = data.code === 'A0000' ? 'success' : 'error'
        Notification( {
          type,
          message: data.msg || type,
        } )
      }
      if ( data.code === 'A0000' || ( process.env.NODE_ENV == 'development' && data.code === 'YX0000' ) ) {
        resolve( res )
        if ( data.code === 'YX0000' && process.env.NODE_ENV == 'development' ) {
          Notification( {
            type: 'warning',
            message: `启动mock数据！请注意\r\n${arg[ 0 ]}`,
          } )
        }
      } else {
        reject( res )
      }
    }, res => {
      reject( { data: {} } )
    } )
  } )
}

/** export const get = ( ...arg ) => {
  return new Promise( ( resolve, reject ) => {
    axios.get.apply( null, arg ).catch( res => {
      Notification( {
        type: 'error',
        message: '网络异常'
      } )
    } ).then( ( res: any = { data: {} } ) => {
      let data = res.data
      resolve( data )
    }, res => {
      reject( res )
    } )
  } )
}
*/
export default post
export const myAxios = axios
