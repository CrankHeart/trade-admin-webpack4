import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import {
  userTypes,
  priceLevels,
  creditLevels,
  orderTypes,
  roundingTypes,
  // settlementMethods,
  isPrintPrice,
  purchasingFrequencys,
  invoiceWithGoods,
  validityFlags,
  salesDepartmentss,
  tradeStatuss,
  agreementGoods,
  invoiceKinds
} from '../const/'

@Component( {
  name: 'PorTraitMixins'
} )
export default class PorTraitMixins extends Vue {
  option = {
    userTypes,
    priceLevels,
    creditLevels,
    orderTypes,
    roundingTypes,
    // settlementMethods,
    isPrintPrice,
    purchasingFrequencys,
    invoiceWithGoods,
    validityFlags,
    salesDepartmentss,
    tradeStatuss,
    agreementGoods,
    invoiceKinds
  }
  convertData ( value, type ) {
    let source
    switch ( type ) {
      case 'userType':
        source = this.option.userTypes
        break
      case 'priceLevel':
        source = this.option.priceLevels
        break
      // case 'settlementMethod':
      //   source = this.option.settlementMethods
      //   break
      case 'creditLevel':
        source = this.option.creditLevels
        break
      case 'roundingType':
        source = this.option.roundingTypes
        break
      case 'isPrintPrice':
        source = this.option.isPrintPrice
        break
      case 'purchasingFrequency':
        source = this.option.purchasingFrequencys
        break
      case 'invoiceWithGoods':
        source = this.option.invoiceWithGoods
        break
      case 'validityFlag':
        source = this.option.validityFlags
        break
      case 'salesDepartments':
        source = this.option.salesDepartmentss
        break
      case 'tradeStatus':
        source = this.option.tradeStatuss
        break
      case 'agreementVisible':
        source = this.option.agreementGoods
        break
      case 'invoiceKind':
        source = this.option.invoiceKinds
        break
      default:
        source = []
        break
    }
    for ( let i = 0, l = source.length; i < l; i++ ) {
      let { id, name } = source[ i ]
      if ( id == value ) {
        return name
      }
    }
    return '--'
  }
}