import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'
import API from '../../API'
import { http } from '../../utils/'


@VuexClass( {
  modules: {}
} )
class Freight {
  freightData: any = {
    templateName: '',
    templateType: 0,
    chargeMode: 0,
    logisticCompanyId: 9,
    // freeShippingAmount: '',
    // freeShippingWeight: '',
    freeShippingCity: [],
    freeShippingRule: []
  }
  logisticCompanys: Array<any> = []
  addressList: Array<any> = []
  freeShipCondition: Array<string> = []

  @Getter addressListStatus( state ) {
    // let { addressList } = state
    return state.addressList
  }

  @Getter currAddressList( state ) {
    let freeShippingCity: Array<any> = state.freightData && state.freightData.freeShippingCity || []
    return freeShippingCity.map( v => v.provinceId )
  }

  @Mutation initFreeShipCondition( state ) {
    // let { freeShippingAmount, freeShippingWeight } = state.freightData
    // state.freeShipCondition = []
    // if ( freeShippingWeight && freeShippingWeight > 0 ) {
    //   state.freeShipCondition.push( 'freeShippingWeight' )
    // }
    // if ( freeShippingAmount && freeShippingAmount > 0 ) {
    //   state.freeShipCondition.push( 'freeShippingAmount' )
    // }
    let { freeShippingRule } = state.freightData
    state.freeShipCondition = []

    freeShippingRule.forEach( rule => {
      let condition = []
      if ( rule.startWeight !== undefined && rule.endWeight !== undefined ) {
        condition.push( 'freeShippingWeight' )
      }
      if ( rule.startAmount !== undefined && rule.endAmount ) {
        condition.push( 'freeShippingAmount' )
      }
      state.freeShipCondition.push( condition )
    } );
  }
  @Action addShippingRule( { state, commit }, index ) {
    const rule = {
      id: '' + index + Date.now(),
      startAmount: '',
      endAmount: '',
      startWeight: '',
      endWeight: ''
    }
    state.freightData.freeShippingRule.push( rule )
    state.freeShipCondition.push( [ 'freeShippingWeight' ] )
    // commit( 'initFreeShipCondition' )
  }
  @Action delShippingRule( { state, commit }, index ) {
    state.freightData.freeShippingRule.splice( index, 1 )
    state.freeShipCondition.splice( index, 1 )
    // commit( 'initFreeShipCondition' )
  }

  @Mutation setFreightData( state, data ) {
    state.freightData = data
  }
  @Action getFreightData( { commit }, params ) {
    http( API.getFreightTemplateDetail, params ).then( ( { data } ) => {
      let freightDetail = data.data
      let freeShippingCity: any = JSON.parse( freightDetail.freeShippingCity || '[]' )
      let freeShippingRule: any = JSON.parse( freightDetail.freeShippingRule || '[]' )
      freightDetail.freeShippingCity = freeShippingCity
      freightDetail.freeShippingRule = freeShippingRule
      freeShippingRule.forEach( ( item, index ) => {
        item.id = '' + index + Date.now()
      } )
      delete freightDetail.createTime
      delete freightDetail.updateTime
      commit( 'setFreightData', freightDetail )
      commit( 'initFreeShipCondition' )

    } ).catch( err => {
    } )
  }


  @Mutation setLogisticCompanys( state, data ) {
    state.logisticCompanys = data
  }

  @Action getAllLogisticCompanys( { commit, state } ) {
    let companys = state.logisticCompanys
    if ( companys.length === 0 ) {
      // http( API.allLogistic ).then( ( { data } ) => {
      //   commit( 'setLogisticCompanys', data.logisticCompanyList )
      // } )
      commit( 'setLogisticCompanys', [ { id: 9, name: '顺丰速递' }, { id: 34, name: '京东物流' } ] )
    }
  }

  @Mutation setAddressList( state, data ) {
    state.addressList = data
  }

  @Action getAddressList( { commit, state } ) {
    let address = state.addressList
    if ( address.length === 0 ) {
      http( API.getAddressList ).then( ( { data } ) => {
        commit( 'setAddressList', data.data.map( v => {
          return {
            provinceId: v.id,
            provinceName: v.name
          }
        } ) )
      } )
    }
  }

  @Mutation setFreightCity( state, data: Array<number> ) {
    state.freightData.freeShippingCity = data.map( v => ( { provinceId: v } ) )
  }




}
const freightModel = extractVuexModule( Freight )

export default freightModel
