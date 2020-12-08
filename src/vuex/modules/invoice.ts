import { VuexClass, extractVuexModule, Mutation, Action, Getter, HasGetter } from 'vuex-class-module'
import API from '../../API'
import { maxInvoiceCount } from '../../pages/order/const/invoiceConst'
import { http } from '../../utils/'

function compare ( propName ) {
  return ( o1, o2 ) => {
    let v1 = o1[ propName ]
    let v2 = o2[ propName ]
    return v2 - v1
  }
}

@VuexClass( {
  modules: {}
} )
class InvoiceModule {
  invoiceList = []
  isNeedInvoice = false
  operInvoice = {} // 操作的的发票
  defaultInvoice = {} // 默认的发票信息

  @Getter moreNum ( state ) {
    return Math.max( 0, maxInvoiceCount - state.invoiceList.length )
  }

  @Mutation setIsNeedInvoiceMutation ( state, data ) {
    state.isNeedInvoice = data
  }

  @Mutation setInvoiceListMutation ( state, data ) {
    data.sort( compare( 'isDefault' ) )
    state.invoiceList = data
  }
  @Mutation setOperInvoiceMutation ( state, data ) {
    state.operInvoice = data
  }

  @Mutation setDefaultInvoiceMutation ( state, data ) {
    state.defaultInvoice = data
  }

  @Mutation addInvoiceMutation ( state, data ) {
    state.invoiceList.push( data )
  }

  @Mutation updateInvoiceMutation ( state, data ) {
    if ( data.index && data.params ) {
      state.invoiceList[ data.index ] = data.params
    }
  }

  @Mutation removeInvoiceMutation ( state, data ) {
    state.invoiceList = state.invoiceList.filter( ( item ) => item.id != data )
  }

  @Action getInvoiceList ( { state, commit }, params = {} ) {
    return http( API.invoiceList, params )
      .then( ( { data } ) => {
        data = data.data
        let defaultInvoice = data.find( ( item ) => item.isDefault == true )
        commit( 'setInvoiceListMutation', data )
        // 后台,每次加载时,把默认的设置为当前选择的发票
        if ( defaultInvoice && defaultInvoice.id ) {
          // 不在自动设置默认为首选项,因为有些逻辑需要自动把默认设为首选项,有些不需要
          // commit( 'setOperInvoiceMutation', defaultInvoice )
          commit( 'setDefaultInvoiceMutation', defaultInvoice )
        }
        return Promise.resolve( data )
      } )
      .catch( ( err ) => {
        return Promise.reject( err )
      } )
  }

  @Action setDefaultInvoice ( { state, commit }, params ) {
    // 把其他的isDefault 都设置为0, list 中 为 id的设置为 1
    return http( API.setDefaultInvoice, params ).then( ( { data } ) => {
      let copyList = state.invoiceList.slice()
      let defaultInvoice = {}
      copyList.forEach( ( item ) => {
        if ( item.id == params.id ) {
          item.isDefault = true
          defaultInvoice = item
        } else {
          item.isDefault = false
        }
      } )
      commit( 'setInvoiceListMutation', copyList )
      commit( 'setOperInvoiceMutation', defaultInvoice )
      commit( 'setDefaultInvoiceMutation', defaultInvoice )
      return data
    } )
  }
  @Action deleteInvoice ( { commit }, params ) {
    return http( API.deleteInvoice, params )
      .then( ( { data } ) => {
        commit( 'removeInvoiceMutation', params.id )
        return Promise.resolve( data )
      } )
      .catch( ( err ) => {
        return Promise.reject( err )
      } )
  }

  @Action getInvoice ( { state }, id ) {
    return state.invoiceList.find( ( item ) => item.id == id )
  }

  @Action updateInvoice ( { state, commit }, params ) {
    if ( params.id ) {
      let findIndex = state.invoiceList.findIndex( ( item ) => item.id == params.id )
      return http( API.updateInvoice, params )
        .then( ( data ) => {
          commit( 'updateInvoiceMutation', { index: findIndex, params } )
          return Promise.resolve( data )
        } )
        .catch( ( err ) => {
          return Promise.reject( err )
        } )
    } else {
      return http( API.addInvoice, params )
        .then( ( data: any ) => {
          params.id = data.id
          commit( 'addInvoiceMutation', params )
          return Promise.resolve( data )
        } )
        .catch( ( err ) => {
          return Promise.reject( err )
        } )
    }
  }

  @Action saveInvoiceInfo ( { state, commit }, params ) {
    // let userInvoiceDataId = data.id
    // // withGoods 1.随货发票 ,2:普通发票   ,用户在购物车付款选中时,发票withGoods状态都是1, 用户下单后,在订单页面再次点击申请发票,发票类型为普通发票
    // let params = { orderSn: this.orderInfo.orderSn, userInvoiceDataId, withGoods: this.withGoods }
    return http( API.saveInvoiceInfo, params )
      .then( ( data ) => {
        return Promise.resolve( data )
      } )
      .catch( ( err ) => {
        return Promise.reject( err )
      } )
  }
}

const storeModule = extractVuexModule( InvoiceModule )
export default storeModule
