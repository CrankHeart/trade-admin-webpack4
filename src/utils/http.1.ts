import axios from 'axios'

import API, { baseURL } from '../API'

import { MessageBox, Notification } from 'element-ui'

import store from '../vuex/index'

Object.assign(axios.defaults, {
  // baseURL
  headers: {
    'content-type': 'text/plain;charset=UTF-8'
  }
})

axios.interceptors.request.use((config: any) => {
  config.data = config.data || {}
  config.broadcast = config.data.broadcast || false
  let url = config.url
  if (/^http/.test(url)) {
    config.url = url
    return config
  } else {
    config.url = baseURL + url
  }

  if (config.url.indexOf(API.login) > -1) return config
  let state: any = store.state
  const { userName, memberId, token } = state.login
  config.headers.authorization = token

  if (config.data instanceof FormData) {
    config.data.append('userName', userName)
    config.data.append('memberId', memberId)
  } else {
    config.data.userName = userName
    config.data.memberId = memberId
  }
  return config
}, error => {
  return Promise.reject(error);
})

axios.interceptors.response.use(res => {
  let data = res.data
  if (data.code === 'B0001') {
    store.commit('login/logIn', {})
    // window.location.reload()
    location.href = '/trade-manage/'
  } else if (data.code === 'B0002') {
    Notification({
      type: 'error',
      title: '权限不足',
      message: '当前用户没有操作权限！'
    })
    return
  }
  let config: any = res.config
  if (config.broadcast) {
    let type = data.code === 'A0000' ? 'success' : 'error'
    Notification({
      type: type,
      message: data.msg || type,
    })
  }

  if (data.code === 'A0000') {
    return res
  } else {
    return
  }
}, rej => {
  Notification({
    type: 'error',
    message: '网络异常'
  })
  return { data: {} }
})

const post = axios.post

export default post
export const myAxios = axios



// const post = ( ...arg ) => {
//   return new Promise( ( resolve, reject ) => {
//     let responseInterceptors: any = axios.interceptors.response
//     let myIndex = responseInterceptors.use( ( res: any = { data: {} } ) => {
//       let data = res.data
//       if ( data.code === 'B0001' ) {
//         store.commit( 'login/logIn', {} )
//         // window.location.reload()
//         location.href = '/trade-manage/'
//       } else if ( data.code === 'B0002' ) {
//         Notification( {
//           type: 'error',
//           title: '权限不足',
//           message: '当前用户没有操作权限！'
//         } )
//         return
//       }
//       let config: any = res.config
//       if ( config.broadcast ) {
//         let type = data.code === 'A0000' ? 'success' : 'error'
//         Notification( {
//           type: type,
//           message: data.msg || type,
//         } )
//       }
//       responseInterceptors.eject( myIndex )
//       if ( data.code === 'A0000' ) {
//         resolve( res )
//         return res
//       } else {
//         reject( res )
//         return
//       }
//     } )
//     axios.post.apply( null, arg ).catch( res => {
//       console.log( arg[0], res )
//       Notification( {
//         type: 'error',
//         message: '网络异常'
//       } )
//     } )
//     return this
//   } )
// }
// export default post
// export const myAxios = axios
