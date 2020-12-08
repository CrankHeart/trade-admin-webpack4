// 客服socket
import store from '../index'

import { http, htmldecodeByRegExp, getTenantOfficeUserName } from '@/utils'
import API from '@/API'

import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'

// let myCustoms = JSON.parse(localStorage.customs || '{}')
let notifyUser = {}

const baseURL = process.env.NODE_ENV == 'production' ? 'https://op.linkedcare.cn' : 'https://etradetest.linkedcare.cn'
// const baseURL = 'https://op.linkedcare.cn'

// let io = (<any>window).io

let socket = io.connect( baseURL + ':3000/' );
let loginState: any = store.state
const adminId = loginState.login.memberId
// const adminId = 20

@VuexClass( {
  modules: {}
} )
class CustomServerModule {
  msgLists: any = {}
  customs: any = {}

  @Getter getterCustoms( state ) {
    let o = {}
    let customs = state.customs
    let i = 0
    let arr = Object.keys( customs )
    getCustomMessage( i, arr, customs )
    return customs
  }

  @Mutation setMsgLists( state, data ) {
    state.msgLists = data
    Object.keys( data ).forEach( v => {
      let d = data[ v ]
      let l = d.length
      notifyUser[ v ] = notifyUser[ v ] || {}
      notifyUser[ v ].msg = d[ l - 1 ]
    } )
  }

  @Mutation setCustoms( state, data ) {
    state.customs = data
  }

  @Action register( { commit } ) {
    socket.on( adminId, ( data ) => {
      commit( 'setMsgLists', data.msgList )
      commit( 'setCustoms', data.users )
      showNotice( data )
    } )
  }
  @Action login() {
    socket.emit( 'login', {
      id: adminId,
      type: 'admin',
      name: '客服'
    } )
  }
  @Action initData() {
    socket.emit( adminId, {} )
  }
  @Action readMsg( { commit }, data ) {
    socket.emit( 'readMsg', data.user, data.type )
  }
  @Action sendMsg( { commit }, data ) {
    socket.emit( adminId, data )
  }
}

function showNotice( data ) {
  if ( !+localStorage.showNotice ) return
  Object.keys( notifyUser ).forEach( v => {
    let userMsg = notifyUser[ v ]
    if ( data.users[ v ] && data.users[ v ].pop ) {
      let d = userMsg.msg
      if ( !userMsg.msg.type && d.content !== userMsg.bakMsg ) {
        Notification.requestPermission( function ( perm ) {
          if ( perm == 'granted' ) {
            let notification = new Notification( '客服中心:' + '来自' + data.users[ v ].name + '的消息', {
              dir: 'auto',
              lang: 'custom',
              icon: '',
              body: htmldecodeByRegExp( d.content ),
            } );
          }
        } )
        userMsg.bakMsg = userMsg.msg.content
      }
    }
  } )
}
// function commonFn(i, arr, customs, myCustoms, key) {
//   myCustoms[key] = customs[key].name
//   localStorage.customs = JSON.stringify(myCustoms)
//   return getCustomMessage(i, arr, customs, myCustoms)
// }

function getCustomMessage( i, arr, customs ) {
  if ( i > arr.length - 1 ) return;
  let key = arr[ i ]
  i++
  getTenantOfficeUserName( key ).then( name => {
    customs[ key ].name = name
    return getCustomMessage( i, arr, customs )
  } )

  // if (myCustoms[key]) {
  //   customs[key].name = myCustoms[key]
  //   return getCustomMessage(i, arr, customs)
  // } else {
  //   http(API.getTenantOfficeUserName, {
  //     id: customs[key].id
  //   }).then(({ data }) => {
  //     // console.log(data.tenantName, key)
  //     customs[key].name = data.tenantName + '-' + (data.userName || customs[key].id.split(':')[2])
  //     commonFn(i, arr, customs, myCustoms, key)
  //   }, rej => {
  //     customs[key].name = '无效的用户信息'
  //     commonFn(i, arr, customs, myCustoms, key)
  //   })
  // }
}




const storeModule = extractVuexModule( CustomServerModule )
store.registerModule( 'customServer', storeModule )


socket.on( 'afterConnect', () => {
  store.dispatch( 'customServer/register' )
  store.dispatch( 'customServer/login' )
  store.dispatch( 'customServer/initData' )
} )