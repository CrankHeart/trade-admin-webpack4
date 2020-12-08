<template>
  <lc-dataset :dataset="form">
    <template slot="card-bottom" slot-scope="{card}">
      <lc-card v-if="card==='card1'" title="商品信息">
        <lc-dataset :dataset="goods"></lc-dataset>
      </lc-card>
    </template>
  </lc-dataset>
</template>

<script>
import formConfig from './config'
import goodsConfig from './goodsConfig'
import API from '../../../../API'

function Round( num ) {
  return Math.round( ( num + Number.EPSILON ) * 100 ) / 100
}

export default {
  name: "returnGoods",
  props: {
    props: ''
  },
  data() {
    return {
      form: '',
      goods: ''
    };
  },
  methods: {
    initForm() {
      let form = { serviceType: 1 }
      let storeId = this.props.list[ 0 ].storeId
      let { suppContactName, suppContactTel, procurementSn, suppliers, suppliersId, suppAddress, suppProvinceId, suppCityId, suppCountryId } = this.props.data
      form.supplierContactPerson = suppContactName
      form.supplierContactPhone = suppContactTel
      form.supplierContactAddress = [ suppProvinceId, suppCityId, suppCountryId ]
      form.supplierContactFullAddress = suppAddress
      form.supplierName = suppliers
      form.supplierId = suppliersId
      form.procurementOrderSn = procurementSn
      form.supplierId = suppliersId
      form.storeId = storeId
      this.form.value = form
    },
    initList() {
      let goodList = []
      let lcSkuCodes = []
      this.props.list.forEach( item => {
        let { lcSkuCode, storeSkuCode, name, specification, unit, storedNum, price, skuId, id } = item
        let good = { lcSkuCode, storeSkuCode, name, specification, unit, storedNum, skuPrice: price, skuId, planSkuDetailId: id }
        goodList.push( good )
        lcSkuCodes.push( { lcSkuCode } )
      } );
      this.goods.value = goodList
      let params = {
        procurementOrderSn: this.form.value.procurementOrderSn,
        skuDetailList: lcSkuCodes
      }
      // 退货数量默认设置为1，获取最大退货数量
      this.$http( API.getReturnOrExchangeSkuNum, params ).then( ( { data } ) => {
        let list = data.data.list
        this.goods.records.forEach( record => {
          let field = record.getField( 'skuNum' )
          let item = list.find( item => item.lcSkuCode === record.value.lcSkuCode )
          field.max = item.skuNum
          field.value = 1
        } )
      } )
    },
    async confirm() {
      let flag = this.goods.checkRules()
      if ( !flag ) {
        return false
      }
      this.form.value.skuDetailList = this.goods.value
      let { supplierContactPerson, supplierContactPhone, supplierContactAddress, supplierContactFullAddress, supplierName } = this.form.value
      this.form.value.supplierContactInfo = { supplierContactPerson, supplierContactPhone, supplierContactAddress, supplierContactFullAddress, supplierName }
      flag = await this.form.save()
      return flag
    },
    setDetailAdress() {
      let resonField = this.form.getField( 'supplierContactAddress' )
      let adressData = resonField.optionDs.value
      let province = adressData.find( item => item.id === resonField.value[ 0 ] )
      let city = province.result.find( item => item.id === resonField.value[ 1 ] )
      let area = city.result.find( item => item.id === resonField.value[ 2 ] )
      let detail = city.name + area.name
      let temp = new RegExp( province.name, 'g' )
      detail = detail.replace( temp, '' )
      detail = province.name + detail
      let field = this.form.getField( 'supplierContactFullAddress' )
      field.value = detail
    }
  },
  created() {
    this.form = this.$dataSet( formConfig )
    this.form.on( 'fieldChange', field => {
      if ( field.key === 'serviceType' ) {
        let resonField = this.form.getField( 'applyReason' )
        if ( field.value === 1 ) {
          resonField.name = '退货原因'
        } else {
          resonField.name = '换货原因'
        }
      } else if ( field.key === 'supplierContactAddress' ) {
        this.setDetailAdress()
      }
    } )
    this.initForm()
    this.goods = this.$dataSet( goodsConfig )
    let flag = true
    this.goods.on( 'fieldChange', field => {
      if ( field.key === 'skuNum' ) {
        let record = field.parent
        let totalField = record.getField( 'totalAmount' )
        let priceField = record.getField( 'skuPrice' )
        let total = Round( field.value * priceField.value )
        let max = Round( field.value * priceField.originValue )
        totalField.value = total
        totalField.max = max
      } else if ( field.key === 'totalAmount' ) {
        // flag用于：如果是修正的就不用重新计算了
        if ( flag ) {
          flag = false
          return
        }
        let record = field.parent
        let skuField = record.getField( 'skuNum' )
        if ( skuField.value > 0 ) {
          let priceField = record.getField( 'skuPrice' )
          let value = Round( field.value / skuField.value )
          // 修正四舍五入之后的误差
          priceField.value = value
          let total = Round( value * skuField.value )
          if ( total != field.value ) {
            flag = true
            // 下一个tick执行的原因是修正inputNumber自动更改值之后又赋值不刷新dom上的值
            this.$nextTick( () => field.value = total )
          }
        }
      }
    } )
    this.initList()
  }
};
</script>

<style lang="stylus" scoped></style>