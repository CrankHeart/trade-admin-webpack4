import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'

import { http, getterConfig } from '../../utils/'
import { Notification } from 'element-ui'
import API from '../../API/'
let once = 1

function convertDataToTree ( list ) {
  let listCopy = JSON.parse( JSON.stringify( list ) )
  let o: any = {}
  listCopy.forEach( val => {
    o[ val.grade ] = o[ val.grade ] || {}
    o[ val.grade ][ val.id ] = val
  } )
  let arr = [ 1, 2 ]
  arr.forEach( key => {
    Object.keys( o[ key ] || {} ).forEach( k => {
      let val = o[ key ][ k ]
      let { parentId } = val
      try {
        o[ key - 1 ][ parentId ].children = o[ key - 1 ][ parentId ].children || []
        o[ key - 1 ][ parentId ].children.push( val )

        if ( key === 1 ) {
          val.grade0Id = val.parentId
        } else if ( key === 2 ) {
          val.grade1Id = val.parentId
          val.grade0Id = o[ 1 ][ val.parentId ].parentId
        }

      } catch ( e ) {
        console.error( val, key )
      }
    } )
  } )
  return o
}

@VuexClass( {
  modules: {}
} )
class PerimissionModule {
  permissionAll = []
  userList = []
  @Getter getterPermissionAll ( { permissionAll } ) {
    let arr = [], err = [],
      all = permissionAll.concat(),
      o1 = {}, o2 = {}, l = all.length

    for ( let x = 1; x <= 3; x++ ) {
      for ( let i = 0; i < l; i++ ) {
        let a = all[ i ]
        if ( !a ) continue;
        a.children = []
        if ( a.grade == 1 && x == 1 ) {
          o1[ a.id ] = a
          all[ i ] = null
        } else if ( a.grade == 2 && x == 2 ) {
          o2[ a.id ] = a
          if ( o1[ a.parent ] ) {
            o1[ a.parent ].children.push( a )
            all[ i ] = null
          }
        } else if ( a.grade == 3 && x == 3 ) {
          if ( o2[ a.parent ] ) {
            o2[ a.parent ].children.push( a )
            all[ i ] = null
          } else {
            err.push( a )
          }
        }
      }
    }
    for ( let i in o1 ) {
      arr.push( o1[ i ] )
    }

    if ( err.length && once ) {
      let b = []
      err.forEach( v => {
        b.push( v.permissionName )
      } )
      Notification( {
        type: 'warning',
        message: '[' + b.join( ' / ' ) + '] 权限设置有误!'
      } )
      once = 0
    }
    return arr
  }
  @Mutation setPermissionAll ( state, data ) {
    state.permissionAll = data
  }
  @Action getPermissionAll ( { commit, state }, shoudInit ) {
    // if ( state.permissionAll.length && !shoudInit ) {
    //   return state.permissionAll
    // }
    return http( API.getAllPermissions ).then( ( { data } ) => {
      commit( 'setPermissionAll', data.data )
      return data.data
    } )
  }
  @Action getUserList ( { commit, state }, params ) {
    if ( state.userList.length && !params.shoudInit ) {
      return state.userList
    }
    delete params.shoudInit
    return http( API.userListInfo,
      params ).then( ( { data } ) => {
      commit( 'setUserList', data.list )
    } ).catch( err => {
      console.log( err )
    })
  }
  @Mutation setUserList ( state, data ) {
    state.userList = data
  }

  menuList = []

  @Getter getterMenuList ( { menuList } ) {
    return convertDataToTree( menuList )
  }
  @Mutation setMenuList ( state, data ) {
    state.menuList = data
  }
  @Mutation changeMenuList ( state, { newValue, oldValue } ) {
    if ( oldValue ) {
      state.menuList = state.menuList.filter( v => v.id !== oldValue.id )
      if ( newValue ) {
        state.menuList = state.menuList.concat( newValue )
      }
    } else {
      state.menuList.push( newValue )
    }
  }
  @Action getMenuList ( { commit, state }, shoudInit = false ) {
    // if ( state.menuList.length && !shoudInit ) {
    //   return state.menuList
    // }
    return http( API.menuList ).then( ( { data } ) => {
      commit( 'setMenuList', data.data )
      return data.data
    } )
  }

  permissionMenu = []

  @Getter getterPermissionMenu ( { permissionMenu } ) {
    return convertDataToTree( permissionMenu )
  }
  @Mutation setPermissionMenu ( state, data ) {
    state.permissionMenu = data
  }

  @Action getPermissionMenu ( { commit, state }, shoudInit = false ) {
    // if ( state.permissionMenu.length && !shoudInit ) {
    //   return state.permissionMenu
    // }
    return http( API.permissionListMenu ).then( ( { data } ) => {
      commit( 'setPermissionMenu', data.data )
      return data.data
    } )
  }

  permissionData = []
  @Mutation setPermissionData ( state, data ) {
    state.permissionData = data
  }

  @Action getPermissionData ( { commit, state }, shoudInit = false ) {
    // if ( state.permissionData.length && !shoudInit ) {
    //   return state.permissionData
    // }
    return http( API.permissionListUrl ).then( ( { data } ) => {
      commit( 'setPermissionData', data.data || [] )
      return data.data
    } )
  }

  roleList: any[] = []
  @Mutation setRoleList ( state, list ) {
    state.roleList = list
  }
  @Action roleInsert ( { commit, state }, payload ) {
    return http( API.roleInsert, {
      ...payload,
      broadcast: true
    } ).then( ( { data } ) => {
      commit( 'setRoleList', state.roleList.concat( data.data ) )
    } )
  }
  @Action roleUpdate ( { commit, state }, { role, curRole } ) {
    return http( !parseInt( role.parentIds ) ? API.updateRolePermission : API.roleUpdate, {
      ...role, broadcast: true
    } ).then( () => {
      let list = state.roleList.concat()
      let index
      for ( let i = 0, l = list.length; i < l; i++ ) {
        if ( list[ i ].id == role.id ) {
          index = i
          break
        }
      }
      if ( index > -1 ) {
        list.splice( index, 1, {
          ...role,
          parentId: role.parentIds || 0,
          roleName: role.roleName || curRole.roleName
        } )
      }
      commit( 'setRoleList', list )
    } )
  }
  @Action roleDelete ( { commit, state }, payload ) {
    return http( API.roleDelete, {
      ...payload,
      broadcast: true
    } ).then( ( { data } ) => {
      let arr = state.roleList.filter( v => v.id !== payload.id ).map( val => {
        let parentIds = `${val.parentIds}`.split( ':' ).filter( v => v != payload.id ).join( ':' ) || '0'
        return {
          ...val, parentIds
        }
      } )
      commit( 'setRoleList', arr )
    } )
  }
  @Action getRoleList ( { commit, state }, shoudInit = false ) {
    if ( state.roleList.length && !shoudInit ) {
      return state.roleList
    }
    return http( API.roleList ).then( ( { data } ) => {
      commit( 'setRoleList', data.data )
      return data.data
    } )
  }
  listRoleType = []
  @Mutation setListRoleType ( state, data ) {
    state.listRoleType = data || []
  }
  @Action getListRoleType ( { commit, state }, shoudInit = false ) {
    if ( state.listRoleType.length && !shoudInit ) {
      return state.roleList
    }
    return http( API.listRoleType ).then( ( { data } ) => {
      commit( 'setListRoleType', data.data )
      return data.data
    } )
  }
}

const storeModule = extractVuexModule( PerimissionModule )
export default storeModule
