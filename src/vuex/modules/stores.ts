import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'
import { http } from '../../utils/'
import API from '../../API/'

/**
 * 5  领健自营
 * 280  领健服务
 * 282  领健图书
 * 284  领健硬件
 */
const ziYingStoreIds = [ 5, 280, 282, 284 ]

@VuexClass( {
  modules: {}
} )
class StoreModule {
  // storeListData: any[] = [] // 完整storeInfo
  @HasGetter storeList = []

  @Mutation setAllStores ( state, data ) {
    state.storeList = data
  }
  // @Mutation setStoreListData ( state, data ) {
  //   state.storeListData = data
  // }
  @Action getAllStores ( { commit } ) {
    http( API.getAllStoreInfos ).then( ( { data } ) => {
      commit( 'setAllStores', data.data )
    } )
  }

  @Action getAllStoresWithCache ( { state, commit } ) {
    if (state.storeList && state.storeList.length > 0) {
      return state.storeList
    } else {
      return http( API.getAllStoreInfos ).then( ( { data } ) => {
        commit( 'setAllStores', data.data )
        return data.data
      } )
    }
  }
  // 判断当前店铺是否是第三方
  @Getter is3rdParty (state) {
    const storeId = window.localStorage.getItem('storeId')
    return !ziYingStoreIds.includes(+storeId)
  }

  // @Action getStoreListData ( { commit } ) {
  //   http( API.getStoreList ).then( ( { data } ) => {
  //     commit( 'setStoreListData', data.data.list )
  //   } )
  // }
  // [id...] 是否全部是自营店,只有全部是自营店才能够开电子发票
  @Action isZiYing ( { commit }, ids ) {
    let arrTemp = []
    if ( !Array.isArray( ids ) ) {
      ids = [ ids ]
    }
    return ids.every( item => ziYingStoreIds.indexOf( item ) > -1 )
  }
}

const storeModule = extractVuexModule( StoreModule )
export default storeModule
