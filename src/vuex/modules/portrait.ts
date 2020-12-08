import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'

import { getterConfig } from '../../utils/'

let store71 = localStorage.getItem('portraitConfig') || ''

@VuexClass({
  modules: {}
})
class PortraitModule {
  store71 = (store71 && store71.split(',')) || []
  config71 = [
    { prop: 'id', label: 'Id', width: '100'},
    { prop: 'tenantName', label: '集团名称', width: '200' },
    { prop: 'tenantId', label: 'tenantId', width: '200' },
    { prop: 'name', label: '客户名称', width: '200' },
    { prop: 'officeId', label: 'officeId', width: '200' },
    { prop: 'customerId', label: 'customerId', width: '200' },
    { prop: 'saasCode', label: 'SaaS代码', width: '150' },
    { prop: 'consumablesPerson', label: '耗材负责人', width: '150' },
    { prop: 'purchasingFrequency', label: '采购频率', width: '150' },
    { prop: 'purContactName', label: '采购联系人', width: '100' },
    { prop: 'purContactMobile', label: '采购联系人联系方式', width: '150' },
    { prop: 'type', label: '门诊类型', width: '150' },
    { prop: 'region', label: '大区', width: '' },
    { prop: 'province', label: '省', width: '' },
    { prop: 'city', label: '市', width: '' },
    { prop: 'address', label: '详细地址', width: '300px' },
    { prop: 'salesDepartments', label: '销售部门', width: '150' },
    { prop: 'salesRegion', label: '销售大区', width: '150' },
    { prop: 'salesCity', label: '销售城市', width: '150' },
    { prop: 'salesPerson', label: 'SaaS软件负责人', width: '150' },
    { prop: 'cserPrsnName', label: '口腔客户成功负责人', width: '170' },
    { prop: 'customerLevel', label: '客户等级', width: '150' },
    // { prop: 'officeLicense', label: '门诊三证', width: '150' },
    { prop: 'orderType', label: '结算类型', width: '170' },
    { prop: 'creditLevel', label: '信用等级', width: '150' },
    // { prop: 'date', label: '成长阶段' },
    { prop: 'userType', label: '用户分类', width: '150' },
    { prop: 'priceLevel', label: '会员等级', width: '150' },
    { prop: 'lastTradeTime', label: '最近下单日期', width: '200' },
    { prop: 'firstTradeTime', label: '首次交易日期', width: '200' },
    { prop: 'signed', label: '是否签约', width: '150' },
    { prop: 'isActive', label: '是否活跃', width: '150' },
    { prop: 'overdueArrears', label: '19年起逾期账款', width: '150' },
    { prop: 'control', label: '操作', width: '150', fixed: 'right' }
  ]

  @Getter portraitConfig(state) {
    return getterConfig(state.store71, state.config71)
  }

  @Mutation setPortraitConfig(state, data) {
    state.store71 = data
    localStorage.setItem('portraitConfig', data)
  }
}


const storeModule = extractVuexModule(PortraitModule)
export default storeModule