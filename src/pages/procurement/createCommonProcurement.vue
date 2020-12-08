<template>
  <div id="procurement-create">
    <lc-title :text="(procurementSn?'编辑':'新建')+'普通采购单'"></lc-title>

    <create-hd v-model="delivery" @change="changeSupplierSkuInfo" />
    <create-result-normal @add-callback="addCallback"></create-result-normal>
    <div class="total amount-content">
      <div class="amount-message">
        商品金额：¥ {{goodsAmount || '0.00'}}
        <br />运 费：¥
        <el-input-number v-model="delivery.freight" :min="0" inline size="small"></el-input-number>
        <br />
        优惠金额：¥ {{totalDiscountAmount || '0.00'}}
        <!-- <el-input-number v-model="delivery.discountAmount" :min="0" inline size="small"></el-input-number> -->
        <br />
        应付金额：¥ {{totalAmount || '0.00'}}
        <br />
        <p v-show="!isMonthSupplier" class="notice">非月结供应商，请提交财务进行打款</p>
      </div>
    </div>
    <lc-card title="备注信息">
      <el-input v-model.trim="delivery.remark" type="textarea"></el-input>
    </lc-card>
    <div style="text-align:right">
      <el-button
        v-if="$permissionValidate(684)"
        @click="save"
        type="primary"
        :loading="saveLoading"
      >保存</el-button>
      <el-button
        v-if="$permissionValidate(688)"
        @click="submitBtn"
        type="primary"
        :loading="submitLoading"
      >提交</el-button>
      <el-button @click="clear">取消</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { set } from 'vue'
import { Mutation, State, Action } from 'vuex-class'
import { Component, Inject, Watch } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
// import CreateEditProcurement from './components/CreateEditProcurement.vue'
import createHd from './components/createHd.vue'
import createResultNormal from './components/createResultNormal.vue'
import { isSyncPrice, preferSupplier } from './const'
import API from '../../API'

const warnText: any = {
  wareHouse: '入库仓',
  suppliers: '供应商',
  // supplierId: '供应商',
  suppliersId: '供应商',
  taxPoint: '税率',
  freight: '运费',
  // discountAmount: '优惠金额'
}

@Component( {
  name: 'create-common-procurement',
  components: {
    lcTitle,
    createHd,
    createResultNormal
  },
} )
export default class CreateCommonProcurement extends Vue {
  @State( state => state.procurement.selectSupplier ) selectSupplier

  @State( state => state.procurement.commonSkuList ) commonSkuList
  @State( state => state.procurement.isMonthSupplier ) isMonthSupplier
  @Mutation( 'procurement/setMonthSupplier' ) setMonthSupplier
  @Mutation( 'procurement/setSupplier' ) setSupplier

  @Mutation( 'procurement/addCommonSkuList' ) addCommonSkuList
  @Mutation( 'procurement/clearCommonSkuList' ) clearCommonSkuList
  @Mutation( 'procurement/changeSkuPrice' ) changeSkuPrice
  @State( state => state.supplier.supplierList ) supplierList
  @Inject() formatMyDate

  delivery = {
    suppliers: '',
    // supplierId: '',
    suppliersId: '',
    wareHouse: '',
    taxPoint: '',
    remark: '',
    deliverySource: 0,
    isSync: false,
    isPreferred: false,
    freight: '',
    discountAmount: '',
    bankName: '',
    settlementAccounts: '',
    procurementSn: '',
    settlementMethod: '',
    invoiceType: ''
  }
  needCheckValid: string[] = [ 'wareHouse', 'suppliers', 'suppliersId', 'taxPoint', 'freight' ]

  saveLoading: boolean = false
  submitLoading: boolean = false

  @Watch( 'selectSupplier', { immediate: true } )
  watchSelectSupplier ( newVal ) {
    let supplier = newVal || {}
    let { name = '', id = '', taxPoint = '', bankName = '', settlementAccounts = '', settlementMethod = '', invoiceType = '' } = supplier
    this.delivery.suppliers = name
    this.delivery.suppliersId = id
    this.delivery.taxPoint = taxPoint
    this.delivery.bankName = bankName
    this.delivery.settlementAccounts = settlementAccounts
    this.delivery.settlementMethod = settlementMethod
    this.delivery.invoiceType = invoiceType
  }

  get procurementSn () {
    let sn = this.$route.params.procurementSn || ''
    return sn
  }
  get goodsAmount (): number {
    let total = 0
    this.commonSkuList.forEach( item => {
      let { price } = item
      const v = ( price + '' ).split( '.' )[ 1 ]
      if ( v && v.toString().length > 2 ) {
        price = Number( price ).toFixed( 2 )
      }
      item.price = price
      total += ( +item.price * item.supplyNum )
    } )
    return parseFloat( total.toFixed( 2 ) )
  }

  get totalDiscountAmount () {
    let amount = 0
    this.commonSkuList.forEach( line => {
      if ( line.skuDiscountAmount ) {
        amount += line.skuDiscountAmount
      }
    } );
    return amount
  }

  get totalAmount (): string {
    let { freight } = this.delivery
    freight = freight || 0
    let goodsAmount = +this.goodsAmount
    return ( goodsAmount + ( +freight ) - ( +this.totalDiscountAmount ) ).toFixed( 2 )
  }

  activated () {
    if ( this.procurementSn ) {
      this.getData()
    } else {
      // 新建普通采购单，初始化所选商品的价格
      this.changeSupplierSkuInfo( this.selectSupplier )
    }
  }

  getData () {
    this.$permissionValidateWithNotify( 686 )
    this.$http( API.selectProcurement, { procurementSn: this.procurementSn } ).then( ( { data } ) => {
      let d = data.data || {}
      d = d.list && d.list[ 0 ] || { planSkuDetails: [] }
      Object.keys( this.delivery ).forEach( v => {
        this.delivery[ v ] = d[ v ]
      } )

      this.delivery.isSync = !!+d.isSync
      this.delivery.isPreferred = !!+d.isPreferred
      this.setSupplier( {
        name: this.delivery.suppliers,
        id: this.delivery.suppliersId,
        taxPoint: this.delivery.taxPoint,
        bankName: this.delivery.bankName,
        settlementAccounts: this.delivery.settlementAccounts,
        settlementMethod: this.delivery.settlementMethod,
        invoiceType: this.delivery.invoiceType
      } )

      let o: any = {}
      d.planSkuDetails.forEach( ( v: any ) => {
        let deliveryDate: any = v.deliveryDate || {}
        v.deliveryDate = this.formatMyDate( deliveryDate && deliveryDate.time )
        v.supplyNum += v.number
        this.addCommonSkuList( v )
      } )
    }, () => {
      this.$notify( {
        type: 'error',
        message: '查询错误，请确认！'
      } )
    } )
  }

  changeSupplierSkuInfo ( supplier?: any ) {
    if ( !supplier.id ) return
    if ( supplier ) {
      this.setMonthSupplier( supplier.settlementMethod )
      this.setSupplier( supplier )
      // this.delivery.suppliers = supplier
    }
    let lcSkuCodes = this.commonSkuList.map( v => v.lcSkuCode )
    if ( lcSkuCodes.length === 0 ) return

    let params = {
      supplierId: supplier.id,
      lcSkuCodes: lcSkuCodes
    }
    this.$http( API.supplierSkuInfo, params ).then( ( { data } ) => {
      let d = data.data
      // d.forEach( ( { lcSkuCode, agreePrice } ) => {
      //   this.changeSkuPrice( { lcSkuCode, price: agreePrice } )
      // } )
      let totalSku = d.reduce( ( total, curr ) => {
        total[ curr.lcSkuCode ] = curr
        return total
      }, {} )
      lcSkuCodes.forEach( v => {
        let currSku = totalSku[ v ] || {}
        let price = currSku.agreePrice || 0
        this.changeSkuPrice( { lcSkuCode: v, price } )
      } )
    } ).catch( ( { data } ) => {
      this.$notify( {
        type: 'error',
        message: data.msg
      } )
    } )

  }

  deactivated () {
    // this.setMonthSupplier( 1 )
    // this.clearCommonSkuList()
    // Object.keys( this.delivery ).forEach( v => {
    //   this.delivery[ v ] = ''
    // } )
    // this.delivery.deliverySource = 0
    // this.delivery.isSync = false
    // this.delivery.isPreferred = false
    // this.setSupplier( {} )
    this.$destroy()
  }
  beforeDestroy () {
    this.clearCommonSkuList()
  }

  validate () {
    for ( let i in this.delivery ) {
      if ( this.needCheckValid.indexOf( i ) > -1 && this.delivery[ i ] === '' ) {
        this.$notify( {
          type: 'error',
          message: warnText[ i ] + '请正确输入！'
        } )
        return false
      }
    }

    for ( let i = 0, l = this.commonSkuList.length; i < l; i++ ) {
      let mm = this.commonSkuList[ i ]
      if ( !+mm.price ) {
        this.$notify( {
          type: 'error',
          message: `请确定商品【${mm.lcSkuCode}】价格输入正确！`
        } )
        return false
      }
      if ( !mm.deliveryDate ) {
        this.$notify( {
          type: 'error',
          message: `请确定商品【${mm.lcSkuCode}】交货日期输入正确！`
        } )
        return false
      }
      if ( !+mm.supplyNum ) {
        this.$notify( {
          type: 'error',
          message: `请确定商品【${mm.lcSkuCode}】数量输入正确！`
        } )
        return false
      }
    }

    if ( +this.totalAmount <= 0 ) {
      this.$notify( {
        type: 'error',
        message: '请确定价格输入正确！'
      } )
      return false
    }

    let arr = []
    this.commonSkuList.forEach( element => {
      arr.push( element.lcSkuCode + '-' + element.skuLabel )
    } );
    let arr2 = new Set( arr )
    if ( arr.length != arr2.size ) {
      this.$notify( {
        type: 'error',
        message: '不能存在suk编码和类型都一样的行！'
      } )
      return false
    }
    return true
  }

  ajaxOption () {
    this.delivery.discountAmount = this.totalDiscountAmount
    let o: any = {
      ...this.delivery,
      planSkuDetails: [],
      deliverySn: [],
      goodsAmount: this.goodsAmount,
      totalAmount: this.totalAmount
    }
    this.commonSkuList.forEach( item => {
      item.deliveryDate = this.formatMyDate( item.deliveryDate )
      o.planSkuDetails.push( item )
    } )

    if ( this.procurementSn ) {
      o.procurementSn = this.procurementSn
    }
    o.isSync = isSyncPrice.get( o.isSync )
    o.isPreferred = preferSupplier.get( o.isPreferred )
    return o
  }

  save () {
    if ( !this.validate() ) {
      return
    }
    this.saveLoading = true
    this.$http( API.addProcurement, this.ajaxOption() ).then( ( { data } ) => {
      this.saveLoading = false
      this.clear()
    } ).catch( ( { data } ) => {
      this.$notify( {
        type: 'error',
        message: data.msg
      } )
      this.saveLoading = false
    } )
  }
  submitBtn () {
    if ( this.delivery.isSync ) {
      let self = this
      this.$confirm( '确定同步供应商关系和报价吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      } ).then( () => {
        this.submit()
      } )
    } else {
      this.submit()
    }
  }
  submit () {
    if ( !this.validate() ) {
      return
    }
    this.submitLoading = true
    this.$http( API.submitProcurement, this.ajaxOption() ).then( ( { data } ) => {
      this.submitLoading = false
      this.clear()
    } ).catch( ( { data } ) => {
      this.$notify( {
        type: 'error',
        message: data.msg
      } )
      this.submitLoading = false
    } )
  }
  clear () {
    Object.keys( this.delivery ).forEach( v => {
      this.delivery[ v ] = ''
    } )
    this.$router.push( '/procurement/list' )
  }

  addCallback ( data ) {
    Object.assign( this.delivery, { freight: data.freight, discountAmount: data.discount, suppliersId: data.supplierId, suppliers: data.supplierName } )
    if ( data.supplierId && this.supplierList && this.supplierList.length > 0 ) {
      let record = this.supplierList.find( item => item.id === data.supplierId )
      let { bankName, settlementAccounts, settlementMethod, invoiceType, taxPoint } = record
      this.setSupplier( {
        name: data.supplierName,
        id: data.supplierId,
        taxPoint: taxPoint,
        bankName: bankName,
        settlementAccounts: settlementAccounts,
        settlementMethod: settlementMethod,
        invoiceType: invoiceType
      } )
    }
    this.commonSkuList.forEach( element => {
      if ( !element.taxPoint ) {
        element.taxPoint = 13
      }
      if ( element.skuLabel === undefined ) {
        element.skuLabel = 1
      }
    } );
  }

}
</script>
<style lang="stylus" scoped>
.total
  line-height 40px
.el-input-number
  vertical-align middle
.product-detail
  margin-bottom 10px
  display flex
  align-items center
  h4
    margin-right 10px
.notice
  color red
.amount-content
  position relative
  height 200px
  .amount-message
    position absolute
    right 0
</style>
