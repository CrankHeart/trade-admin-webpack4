import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'

let store21 = localStorage.getItem( 'userConfig' ) || ''


import { getterConfig } from '../../utils/'
@VuexClass( {
  modules: {}
} )
class UserModule {
  store21 = store21 && store21.split( ',' ) || []
  config21 = [
    { prop: 'tenantName', label: '名称', width: '' },
    { prop: 'tenantId', label: 'tenant ID', width: '' },
    { prop: 'userType', label: '分类', width: '160px' },
    { prop: 'region', label: '区域', width: '' },
    { prop: 'province', label: '省', width: '' },
    { prop: 'city', label: '城市', width: '' },
    { prop: 'memberLevel', label: '会员等级', width: '120px' },

    { prop: 'saleCity', label: '销售城市', width: '120px' },
    { prop: 'saleResponsiblePerson', label: '销售负责人', width: '120px' },
    { prop: 'custResponsiblePerson', label: '客服负责人', width: '120px' },

    { prop: 'roundingType', label: '货币精确度', width: '190px' },
    { prop: 'label', label: '标签汇总', width: '' },
    { prop: 'control', label: '操作', width: '100px' },
  ]

  @Getter userConfig ( state ) {
    return getterConfig( state.store21, state.config21 )
  }

  @Mutation setUserConf ( state, data ) {
    state.store21 = data
    localStorage.setItem( 'userConfig', data )
  }
}

const storeModule = extractVuexModule( UserModule )
export default storeModule