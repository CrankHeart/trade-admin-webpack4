import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'

import { Notification } from 'element-ui'
import Vue from 'vue'

import loginModule from './login'
import { http } from '../../utils/'
import API from '../../API'
@VuexClass({
  modules: {}
})
class MessageModules {
  permission = []
  msgTotal = {}
  @Mutation setMsgTotal(state, data) {
    state.msgTotal = data || {}
  }
  @Getter msgTotalArr(state) {
    let arr = []
    Object.keys(state.msgTotal).forEach(key => {
      let keyStr, path, permission
      switch (key) {
        case 'aptitudeMsg':
          keyStr = '资质提醒'
          path = '/message/aptitudeRemind',
          permission = 420
          break
        case 'noImageMsg':
          keyStr = '主图提醒'
          path = '/message/mainPicRemind',
          permission = 431
          break
        case 'priceInversionMsg':
          keyStr = '价格倒挂提醒'
          path = '/message/priceInversionRemind',
          permission = 433
          break
        case 'abnormalDiscountRateMsg':
          keyStr = '折扣率异常提醒'
          path = '/message/abnormalDiscountRateRemind',
          permission = 434
          break
        case 'orderNotPaidMsg':
          keyStr = '限时未付款提醒'
          path = '/message/nonPaymentRemind',
          permission = 432
          break
        case 'activityExpired':
          keyStr = '今日活动过期提醒'
          path = '/message/activityExpired',
          permission = 667
          break
        case 'outStockRemind':
          keyStr = '缺货提醒'
          path = '/message/outStockRemind',
          permission = 758
          break
        case 'expiringStockRemind':
          keyStr = '临期库存提醒'
          path = '/message/expireStockRemind',
          permission = 759
          break
        case 'unfilledOrder':
          keyStr = '待发货订单提醒'
          path = '/message/unfilledOrder',
          permission = 1097
          break
        case 'unprocessedServiceOrder':
          keyStr = '待处理服务单提醒'
          path = '/message/unprocessedServiceOrder',
          permission = 1098
          break
        default:
          keyStr = '提醒'
          break
      }
      if ( !permission || Vue.prototype.$permissionValidate( permission ) ) {
        arr.push({
          key: keyStr,
          path,
          msg: state.msgTotal[key]
        })
      }

    })
    return arr
  }
  // @Getter permission () {
  //   let permissionArr = loginModule.state.permissionArr || []
  //   let o = ( permissionArr || [] ).reduce( ( prev, next ) => {
  //     prev[ next ] = true
  //     return prev
  //   }, {} )
  //   let cst = ( new MessageModules() )
  //   return o
  // }
  @Mutation setPermission(state, menuIds) {
    state.permission = (menuIds || []).reduce((prev, next) => {
      prev[next] = true
      return prev
    }, {})
  }
  @Action messageManage({ commit, dispatch, state }, data) {
    commit('setPermission', data.menuIds)
    // 资质提醒
    if (state.permission[419]) {
      dispatch('getMsgTotal')
    }
  }
  @Action getMsgTotal({ commit, state }, shouldInit = true) {
    if (Object.keys(state.msgTotal).length && !shouldInit) {
      return Promise.resolve(state.msgTotal)
    }
    return http(API.getMsgTotal).then(({ data }) => {
      commit('setMsgTotal', data.data)
    })
  }
  @Action msgHandled({ commit }, payload) {
    return http(API.msgHandled, payload).then(({ data }) => {
      commit('setMsgTotal', data.data)
    })
  }
}

const storeModule = extractVuexModule(MessageModules)
export default storeModule
