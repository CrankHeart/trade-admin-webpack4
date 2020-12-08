import { VuexClass, extractVuexModule, Mutation, Action, Getter } from 'vuex-class-module'

import { http } from '../../utils/'

import API from '../../API'


@VuexClass( {
  modules: {}
} )
class SupplierModule {
  supplierList: any[] = []

  shouldInit: boolean = false

  personInCharge: any = []

  supplierDetail: any = {}

  @Mutation setAllSuppliers ( state, data ) {
    state.supplierList = []
    state.supplierList.push( ...data )
  }
  @Mutation setShouldInit ( state, data: boolean ) {
    state.shouldInit = data
  }
  @Mutation setPersonIncharge ( state, data ) {
    state.personInCharge = data
  }
  @Mutation setSupplierDetail ( state, data ) {
    state.supplierDetail = data
  }

  @Action getAllSuppliers ( { commit, state }, bo = false ) {
    if ( state.supplierList.length && !state.shouldInit && !bo ) {
      return Promise.resolve( state.supplierList )
    }
    return http( API.getSupplierInfos, { start: 0, num: 1000 } ).then( ( { data } ) => {
      let d = data.data
      let supplierList = ( d.list || [] ).map( v => ( {
        id: v.id,
        name: v.supplierName,
        taxPoint: v.taxPoint,
        settlementMethod: v.settlementMethod,
        bankName: v.bankName,
        settlementAccounts: v.settlementAccounts,
        invoiceType: v.invoiceType
      } ) )
      commit( 'setAllSuppliers', supplierList )
      commit( 'setShouldInit', false )
      return supplierList
    } )
  }

  @Action getPersonIncharge ( { commit, state } ) {
    let { personInCharge } = state
    if ( personInCharge.length ) {
      return Promise.resolve( personInCharge )
    }
    return http( API.roleGetUser2, {
      // roleId: 6
      roleName: '采购员'
    } ).then( ( { data } ) => {
      let item = data.data.map( v => ( { ...v, name: v.userName } ) )
      commit( 'setPersonIncharge', item )
      return item
    } )
  }

}
const storeModule = extractVuexModule( SupplierModule )
export default storeModule