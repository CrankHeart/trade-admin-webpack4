import Vue from 'vue'
import axios from 'axios'

import VueScrollTo from 'vue-scrollto'
import { http, validatePermissions } from '../utils/index'
import { submit } from '../server/'
import store from '../vuex/index'
import { isArray } from 'util'

let scrollTo = ( element, duration, options ) => VueScrollTo.scrollTo( element, duration, options )

Vue.prototype.$http = http
Vue.prototype.$submit = submit
Vue.prototype.$scrollTo = scrollTo

Vue.prototype.$permissionValidateWithEnv = ( devPID, proPID ) => {
  let permissionObj = ( <any> store ).getters[ 'login/permissionObj' ]
  let devId
  let proId
  if ( Array.isArray( devPID ) ) {
    devId = devPID[ 0 ]
    proId = devPID[ 1 ]
  } else {
    devId = devPID
    proId = proPID
  }
  let pid = process.env.NODE_ENV != 'production' ? devId : proId
  return validatePermissions( permissionObj, [ pid ] )
}

Vue.prototype.$permissionValidate = ( ...arg ) => {
  let permissionObj = ( <any> store ).getters[ 'login/permissionObj' ]
  return validatePermissions( permissionObj, ...arg )
}

Vue.prototype.$permissionValidateWithNotify = function ( ...arg ) {
  if ( !this.$permissionValidate( ...arg ) ) {
    this.$notify( {
      type: 'error',
      message: `${arg}权限不足，请联系管理员！`
    } )
    throw new Error( '权限不足' )
  } else {
    return true
  }
}
Vue.prototype.$permissionValidateWithNotifyEnv = function ( devPID, proPID ) {
  if ( !this.$permissionValidateWithEnv( devPID, proPID ) ) {
    this.$notify( {
      type: 'error',
      message: `${[ devPID, proPID ]}权限不足，请联系管理员！`
    } )
    throw new Error( '权限不足' )
  } else {
    return true
  }
}

Vue.prototype.$isProduct = process.env.NODE_ENV == 'production'

Vue.prototype.$submitFile = function ( url, params, name ) {
  axios.post( url, params, {
    responseType: 'blob'
  } ).then( ( res ) => {
    const blob = res.data;
    const reader = new FileReader();
    reader.readAsDataURL( blob );
    reader.onload = ( e ) => {
      const a = document.createElement( 'a' );
      a.download = `${name}.xls`;
      a.href = e.target.result;
      document.body.appendChild( a );
      a.click();
      document.body.removeChild( a );
    };
  } )
}
