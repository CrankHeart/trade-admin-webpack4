import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'
import API from '../../API/'

import { getterConfig } from '../../utils/'
// import store from '../index'

let store31 = localStorage.getItem( 'couponConfig' ) || ''

import { couponTypes } from '../../pages/coupon/const/'
@VuexClass( {
  modules: {}
} )
class CouponModule {
  couponTypes = couponTypes
  // 券码列表
  store31 = store31 && store31.split( ',' ) || []
  config31 = [
    { prop: 'id', label: '活动Id', width: '' },
    { prop: 'activityName', label: '活动名称', width: '' },
    { prop: 'type', label: '券码类别', width: '' },
    { prop: 'time', label: '有效期', width: '' },
    { prop: 'stockLevel', label: '库存水平', width: '' },
    { prop: 'writeOffRate', label: '核销率', width: '' },
    { prop: 'control', label: '操作', width: '' },
    { prop: 'status', label: '状态', width: '' }
  ]

  @Getter couponConfig ( state ) {
    return getterConfig( state.store31, state.config31 )
  }

  @Mutation setCouponConf ( state, data ) {
    state.store31 = data
    localStorage.setItem( 'couponConfig', data )
  }
}

const storeModule = extractVuexModule( CouponModule )
// store.registerModule('coupon', storeModule)
export default storeModule
