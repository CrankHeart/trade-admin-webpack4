import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'
import API from '../../API'
import oidc from 'oidc-client'
import { configs } from '@/pages/sso/sso.js'

oidc.Log.logger = console;
oidc.Log.level = oidc.Log.NONE;
const initOidcManager = new oidc.UserManager( configs )

@VuexClass( {
  modules: {}
} )
class SsoModule {
  ssoToken = ''
  ssoName = ''
  mgr = initOidcManager

  @Action ssoLogin ( { commit, state } ) {
    return state.mgr.signinRedirect().catch( err => Promise.reject( err ) )
  }

  // 每次发生请求,会调用oidc getUser()方法, 如果本次token缓存没失效,会返回本地token,如果已经续期,需要刷新我们store里面的token
  @Action async authenicate ( { commit, state } ) {
    let user = await state.mgr.getUser()
    return new Promise( ( resolve, reject ) => {
      if ( user && user.expires_at * 1000 > Date.now() ) { // 尚未过期
        // 这里写入token,name做测试用,实际的token还是以login.token为主
        state.ssoToken = user.access_token
        state.ssoName = user.profile.name
        resolve( user )
      } else {
        state.mgr.signinRedirect()
        resolve( null )
      }
    } );
  }

  @Action ssoCallback ( { commit, state, dispatch } ) {
    const options = {
      response_mode: 'query',
      userStore: new oidc.WebStorageStateStore( { store: window.localStorage } )
    };

    return new oidc.UserManager( options ).signinRedirectCallback().then( ( user ) => {
      return Promise.resolve( user )
    } ).catch( function ( e ) {
      console.error( e );
      return Promise.reject( e )
    } );
  }

  @Action ssoLogout ( { commit, state }, o ) {
    return state.mgr.signoutRedirect().then( () => {
      return Promise.resolve( 1 )
    } )
  }

}

const ssoModule = extractVuexModule( SsoModule )
export default ssoModule
