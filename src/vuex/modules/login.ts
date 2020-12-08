import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'

import { http, delCookie, getCookie, setCookie } from '../../utils/'
import API from '../../API/'
// import { myAxios } from '../utils/http'
// import { injectScript } from '../../utils/'
import extendRouteByPermission from '../../router/availableRouter'

// import MessageModule from './message'

const encodeMySearch = ( str: string ) => {
  let arr = str.split( '?' )
  str = arr.pop()
  let o: any = {}
  let arr2 = str.split( '&' )
  arr2.forEach( v => {
    let ar = v.split( '=' )
    o[ ar[ 0 ] ] = ar[ 1 ]
  } )
  return o
}
const getLoginType = function () {
  return localStorage.getItem( 'loginType' ) ? localStorage.getItem( 'loginType' ) : 'COMMON'
}
let loginCookie = getCookie( 'login' )
let loginIfor = {}

if ( loginCookie && loginCookie !== '%7B%7D' ) {
  loginIfor = JSON.parse( loginCookie )
} else {
  loginIfor = encodeMySearch( location.href )
}

const currentStoreList = JSON.parse( localStorage.getItem( 'currentStoreList' ) || '[]' )
const storeId = Number( localStorage.getItem( 'storeId' ) ) || 0

@VuexClass( {
  modules: {
    // MessageModule
  }
} )
class MyModule {
  loginIfor = loginIfor
  @HasGetter userName = ''
  @HasGetter memberId = ''
  @HasGetter token = ''
  @HasGetter email = ''
  storeId = storeId

  // 商家店铺
  currentStoreList = currentStoreList

  permissionArr = []
  roleArr = []
  isCustomServer = false
  usr: any = {}
  @Getter permissionObj ( state ) {
    if ( !state.permissionArr ) state.permissionArr = []
    return state.permissionArr.reduce( ( total, prev ) => {
      total[ prev ] = true
      return total
    }, {} )
  }
  @Getter permissionList ( state ) {
    let permissionArr = state.permissionArr || []
    let o: any = {}
    permissionArr.forEach( v => o[ v ] = 1 )
    return o
  }

  @Getter roleNames ( state ) {
    let roleArr = state.roleArr || []
    let o: any = {}
    roleArr.forEach( v => o[ v ] = 1 )
    return o
  }

  @Mutation freshToken ( state, data ) {
    state.token = data
    state.loginIfor = Object.assign( {}, state.loginIfor, { token: data } )
    setCookie( 'login', JSON.stringify( state.loginIfor ), 7 * 24 * 60 * 60 * 1000 )
  }

  @Mutation logIn ( state, data ) {
    const { userName, memberId, token, userType, isThirdPartyLogin } = data
    state.loginIfor = { userName, memberId, token, userType, isThirdPartyLogin }
    state.userName = userName
    state.memberId = memberId
    state.token = token
    state.userType = userType

    // 设置登录成功, cookie有效期7天
    for ( let i in data ) {
      localStorage.setItem( 'isLogin', 'true' )
      return setCookie( 'login', JSON.stringify( state.loginIfor ), 7 * 86400000 )
    }

    return delCookie( 'login' )
  }
  // 登录之后 保存用户名左侧下拉列表的【商户列表】到 localStorage
  @Mutation setStoreList ( state, currentStoreList ) {
    localStorage.setItem( 'currentStoreList', JSON.stringify( currentStoreList ) )
    state.currentStoreList = currentStoreList
  }
  // 当前选择下拉列表的 商户id
  @Mutation setStoreId ( state, storeId ) {
    localStorage.setItem( 'storeId', storeId )
    state.storeId = storeId
  }

  @Mutation setIsCustonServer ( state ) {
    state.isCustomServer = true
  }

  @Mutation setUsr ( state, data ) {
    let user = data.user || {}
    state.usr = user
    state.email = user.emailAddress
    state.permissionArr = data.menuIds
    state.roleArr = data.roleNames
  }

  @Action getToken ( { state } ) {
    return state.token
  }

  // 这里先不用,先看看是否稳定,如果靠静默刷新token不稳定,再使用每次请求再次刷新token
  @Action getTokenSso ( { state, commit, dispatch } ) {
    let loginType = getLoginType()
    if ( loginType == 'SSO' ) {
      return dispatch( 'sso/authenicate', {}, { root: true } ).then( ( user ) => {
        if ( state.token != user.access_token ) {
          state.token = user.access_token
          // commit( 'logIn', { userName: user.profile.email, memberId: '', token: user.access_token, storeId: '', userType: 0 } )
        }
        return user.access_token
      } )
    } else {
      return state.token
    }
  }

  @Action logInAsync ( { commit, dispatch }, o: object ): Promise<any> {
    localStorage.setItem( 'loginType', 'COMMON' )
    return http( API.login, o ).then( ( res: any ) => {
      // 以兼容sso旧的token签名,老的token签名加字符串'console '
      res.data.token = 'console ' + res.data.token
      commit( 'logIn', res.data )

      dispatch( 'extendRouteByPermission' )
      return res
    } )
  }

  @Action logInSso ( { commit, dispatch }, token ): any {
    localStorage.setItem( 'loginType', 'SSO' )
    return http( API.loginFromSSO, token ).then( ( res: any ) => {
      let { storeId, storeInfos } = res.data || {};
      storeInfos = ( storeInfos || [] ).map( ( { id, storeName } ) => ( { id, storeName } ) );

      commit( 'logIn', res.data )
      commit( 'setStoreId', storeId )
      commit( 'setStoreList', storeInfos )
      dispatch( 'extendRouteByPermission' )
      return res
    } )
  }

  @Action extendRouteByPermission ( { commit, dispatch, state, getters } ) {
    if ( !state.memberId ) {
      return Promise.reject( new Error( 'error' ) )
    }
    return dispatch( 'getUsr' ).then( res => {
      let permissionList = getters.permissionList || {}
      extendRouteByPermission( permissionList )
      return res
    } )
  }

  @Action getUsr ( { commit, state } ) {
    let loginType = getLoginType()
    let apiUrl = loginType == 'SSO' ? API.userInfoFromToken : API.userInfo
    return http( apiUrl, { affectedUserName: state.userName } ).then( ( res: any ) => {

      commit( 'setUsr', res.data )
      return Promise.resolve( res )
    }, ( err ) => {
      commit( 'logIn', {} )
      return Promise.reject( err )
    } )
  }

  @Action logout ( { commit, dispatch }, o: object ): Promise<any> {
    commit( 'logIn', {} )
    localStorage.setItem( 'isLogin', 'false' )
    // 登出后,清除菜单
    sessionStorage.setItem( 'detailNav', '' )
    return Promise.resolve( 1 )
  }

}

const loginModule = extractVuexModule( MyModule )
export default loginModule
