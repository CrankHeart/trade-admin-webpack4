import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'
import { getterConfig } from '../../utils/'

let store15 = localStorage.getItem( 'refundApplicationRecord' ) || ''

@VuexClass({
  modules: {}
})
class ReceviableModule {
  selectList: any[] = []
  isAllSelected: boolean = false // 页面是否选择全选

  
  store15 = ( store15 && store15.split( ',' ) ) || []
  config15 = [
    { prop: 'voucherSn', label: '申请编号', width: '260px' },
    { prop: 'officeName', label: '客户名称', width: '280px' },
    { prop: 'voucherStatus', label: '申请状态', width: '280px' },
    { prop: 'amount', label: '申请退款金额', width: '130px' },
    { prop: 'reviewRemark', label: '退款备注', width: '250px' },
    { prop: 'createDate', label: '创建时间', width: '200px' },
    { prop: 'updateDate', label: '最后更新时间', width: '200px' },
    { prop: 'createPerson', label: '申请人', width: '130px' },
    { prop: 'actualPayDate', label: '实际退款时间', width: '200px' },
    { prop: 'updatePerson', label: '最后更新人', width: '130px' },
    { prop: 'control', label: '操作', width: '120px', fixed: 'right' }
  ]

  @Getter procurementSkuList(state) {
    return state.selectList
  }

  @Getter refundApplicationRecordConfig ( state ) {
    return getterConfig( state.store15, state.config15 )
  }

  @Mutation setIsAllSelected(state, value) {
    state.isAllSelected = value
  }

  @Mutation setSelectlist(state, items: any = []) {
    state.selectList = items
  }

  @Mutation combineSelectlist(state, items: any = []) {
    items.forEach(item => {
      if (state.selectList.findIndex(info => info.key == item.key) === -1 && item.value) {
        state.selectList.push(item)
      } else if (state.selectList.findIndex(info => info.key == item.key) !== -1 && !item.value) {
        state.selectList = state.selectList.filter(info => info.key !== item.key)
      }
    });
  }
  // 命名冲突
  @Mutation clearReceviableCommonSkuList(state) {
    state.selectList = []
  }

  @Mutation setRefundApplicationRecordConfig ( state, data ) {
    state.store15 = data
    localStorage.setItem( 'refundApplicationRecordConfig', data )
  }
}

export default extractVuexModule(ReceviableModule)
