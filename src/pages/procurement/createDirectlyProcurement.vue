<template>
  <div id="procurement-create">
    <lc-title :text="(procurementSn?'编辑':'新建')+'直发采购单'"></lc-title>

    <create-hd v-model="form" @change="changeSupplierSkuInfo" />

    <directly-procurement-sku @add-callback="addCallback"></directly-procurement-sku>

    <div class="footer amount-content">
      <div class="amount-message">
        商品金额：¥ {{goodsAmount || '0.00'}}
        <br />运费：¥
        <el-input-number v-model="form.freight" :min="0" inline size="small"></el-input-number>
        <br />
        优惠金额：¥
        {{totalDiscountAmount || '0.00'}}
        <!-- <el-input-number v-model="form.discountAmount" :min="0" inline size="small"></el-input-number> -->
        <br />
        应付金额：¥ {{totalAmount || '0.00'}}
        <br />
      </div>
    </div>
    <procurement-member
      v-if="memberOrder && Object.keys(memberOrder).length > 0"
      :member-order="memberOrder"
    ></procurement-member>
    <lc-card title="备注信息">
      <el-input v-model.trim="form.remark" type="textarea"></el-input>
    </lc-card>
    <div style="text-align:right">
      <el-button v-if="$permissionValidate(685)" @click="save" type="primary">保存</el-button>
      <el-button v-if="$permissionValidate(689)" @click="submitBtn" type="primary">提交</el-button>
      <el-button @click="clear">取消</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Watch } from 'vue-property-decorator'
import { Getter, State, Mutation, Action } from 'vuex-class'
import API from '../../API'
import { isSyncPrice, preferSupplier } from './const'
import lcTitle from '../../components/title.vue'
import createHd from './components/createHd.vue'
import directlyProcurementSku from './components/directlyProcurementSku.vue'
import procurementMember from './components/procurementMember.vue'
const warnText = {
  wareHouse: '入库仓',
  suppliers: '供应商',
  supplierId: '供应商',
  taxPoint: '税率',
  freight: '运费',
  // discountAmount: '优惠金额'
}
@Component( {
  name: 'create-directly-procurement',
  components: {
    lcTitle,
    createHd,
    directlyProcurementSku,
    procurementMember
  },
  beforeRouteEnter ( to: Object, from: Object, next: Function ) {
    next( CreateDirectlyProcurement => {
      let vm = CreateDirectlyProcurement
      if ( !vm.procurementSn && !vm.directlyDeliverySn ) {
        vm.$router.back()
      }
    } )
  }
} )
export default class CreateDirectlyProcurement extends Vue {
  @State( state => state.procurement.directlySkuMap ) directlySkuMap
  @State( state => state.procurement.directlyDeliverySn ) directlyDeliverySn
  @State( state => state.procurement.memberOrder ) memberOrder
  @Getter( 'procurement/directlySkuList' ) directlySkuList
  @Mutation( 'procurement/setDirectlyDeliverySn' ) setDirectlyDeliverySn
  @Mutation( 'procurement/setDirectlySkuMap' ) setDirectlySkuMap
  @Mutation( 'procurement/clearDirectlySkuMap' ) clearDirectlySkuMap
  @Mutation( 'procurement/changeDirectlySkuPrice' ) changeDirectlySkuPrice
  @Mutation( 'procurement/setMemberOrder' ) setMemberOrder
  @Inject() formatMyDate


  form = {
    suppliers: '',
    supplierId: '',
    deliverySource: 1,
    taxPoint: '',
    remark: '',
    freight: 0,
    discountAmount: 0,
    wareHouse: '',
    isSync: false,
    isPreferred: false,
    bankName: '',
    settlementAccounts: '',
    procurementSn: '',
    settlementMethod: '',
    invoiceType: ''
  }
  needCheckValid: string[] = [ 'wareHouse', 'suppliers', 'suppliersId', 'taxPoint', 'freight' ]

  get procurementSn () {
    return this.$route.params.procurementSn
  }

  get goodsAmount (): string {
    let total = 0
    this.directlySkuList.forEach( v => {
      let { number, price, supplyNum } = v
      let goodsAmount = ( ( +number || 0 ) + ( +supplyNum || 0 ) ) * ( +price || 0 ) * 100
      // let goodsAmount = ( +supplyNum || 0 ) * ( +price || 0 ) * 100
      total += goodsAmount
    } )
    return ( total / 100 ).toFixed( 2 )
  }
  get totalDiscountAmount () {
    let amount = 0
    this.directlySkuList.forEach( line => {
      if ( line.skuDiscountAmount ) {
        amount += line.skuDiscountAmount
      }
    } );
    return amount
  }
  get totalAmount (): string {
    return ( ( ( +this.goodsAmount ) * 100 + ( +this.form.freight || 0 ) * 100 - ( +this.totalDiscountAmount || 0 ) * 100 ) / 100 ).toFixed( 2 )
  }

  activated () {
    this.initForm()
    if ( this.procurementSn ) {
      this.getData()
    }
  }
  deactivated () {
    this.clearDirectlySkuMap()
    this.$destroy()
  }
  beforeDestroy () {
    this.clearDirectlySkuMap()
  }
  initForm () {
    Object.keys( this.form ).forEach( v => {
      this.form[ v ] = ''
    } )
    this.form[ 'deliverySource' ] = 1
    this.form[ 'freight' ] = 0
    this.form[ 'discountAmount' ] = 0
    this.form[ 'isSync' ] = false
    this.form[ 'isPreferred' ] = false
  }
  getData () {
    this.$permissionValidateWithNotify( 687 )
    this.$http( API.selectProcurement, { procurementSn: this.procurementSn } ).then( ( { data } ) => {
      let d = data.data || {}
      d = d.list && d.list[ 0 ] || { planSkuDetails: [] }
      Object.keys( this.form ).forEach( v => {
        this.form[ v ] = d[ v ]
      } )
      isSyncPrice.forEach( ( value, key, map ) => {
        if ( value === d.isSync ) this.form.isSync = key
      } )

      preferSupplier.forEach( ( value, key, map ) => {
        if ( value === d.isPreferred ) this.form.isPreferred = key
      } )

      this.setMemberOrder( d.memberOrders[ 0 ] || {} )
      this.setDirectlyDeliverySn( d.deliverySn )
      let o: any = {}
      d.planSkuDetails.forEach( v => {
        let deliveryDate: any = v.deliveryDate || {}
        v.deliveryDate = this.formatMyDate( deliveryDate && deliveryDate.time, 'yyyy-MM-dd' )
        this.setDirectlySkuMap( v )
      } )
    }, () => {
      this.$notify( {
        type: 'error',
        message: '查询错误，请确认！'
      } )
    } )
  }

  changeSupplierSkuInfo ( supplier ) {
    let { name = '', id = '', taxPoint = '', bankName = '', settlementAccounts = '', settlementMethod = '', invoiceType = '' } = supplier
    this.form.taxPoint = taxPoint
    this.form.supplierId = id
    this.form.bankName = bankName
    this.form.settlementAccounts = settlementAccounts
    this.form.settlementMethod = settlementMethod
    this.form.invoiceType = invoiceType
    this.form.suppliers = name
    // let lcSkuCodes = Object.keys( this.directlySkuMap )

    // let params = {
    //   supplierId: this.form.supplierId,
    //   lcSkuCodes: lcSkuCodes
    // }
    // if ( params.lcSkuCodes.length === 0 ) return
    // this.$http( API.supplierSkuInfo, params ).then( ( { data } ) => {
    //   let d = data.data
    //   d.forEach( ( { lcSkuCode, agreePrice } ) => {
    //     this.changeDirectlySkuPrice( { lcSkuCode, price: agreePrice } )
    //   } )
    // } )
    // this.changeSkuPrice( { lcSkuCode: '2200000001002', price: 123 })
  }


  validate () {
    for ( let i in this.form ) {
      if ( this.needCheckValid.indexOf( i ) > -1 && this.form[ i ] === '' ) {
        this.$notify( {
          type: 'error',
          message: warnText[ i ] + '请正确输入！'
        } )
        return false
      }
    }
    if ( this.directlySkuList.length === 0 ) {
      this.$notify( {
        type: 'error',
        message: '请指定采购商品'
      } )
      return false
    }

    for ( let i = 0, l = this.directlySkuList.length; i < l; i++ ) {
      let mm = this.directlySkuList[ i ]
      if ( !mm.price ) {
        this.$notify( {
          type: 'error',
          message: '请确定价格输入正确！'
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
    }

    if ( +this.totalAmount <= 0 ) {
      this.$notify( {
        type: 'error',
        message: '请确定价格输入正确！'
      } )
      return false
    }
    return true
  }

  formatOption () {
    this.form.discountAmount = this.totalDiscountAmount
    let o: any = {
      ...this.form,
      planSkuDetails: this.directlySkuList,
      deliverySn: this.directlyDeliverySn,
      goodsAmount: this.goodsAmount,
      totalAmount: this.totalAmount
    }
    o.isSync = isSyncPrice.get( o.isSync )
    o.isPreferred = preferSupplier.get( o.isPreferred )
    if ( this.procurementSn ) {
      o.procurementSn = this.procurementSn
    }
    let orderSn = this.memberOrder && this.memberOrder.sn || undefined
    o.directOrderSn = orderSn
    if ( this.memberOrder ) {
      let { sn, createDate, member, memberName, addressDetail } = this.memberOrder
      createDate = this.formatMyDate( createDate && createDate.time, 'yyyy-MM-dd hh:mm:ss' )
      let obj = { orderSn: sn, createDate, member, memberName, addressDetail }
      o.directOrderInfoVO = obj
    }
    return o
  }

  save () {
    if ( !this.validate() ) {
      return
    }
    this.$http( API.addProcurement, this.formatOption() ).then( ( { data } ) => {
      this.$router.push( '/procurement/list' )
    } )
  }
  submitBtn () {
    if ( this.form.isSync ) {
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
    this.$http( API.submitProcurement, this.formatOption() ).then( ( { data } ) => {
      this.$router.push( '/procurement/list' )
    } )
  }
  clear () {
    Object.keys( this.form ).forEach( v => {
      this.form[ v ] = ''
    } )
    this.$router.push( '/procurement/list' )
  }
  addCallback ( data ) {
    console.log( 'addCallback', data )
    Object.assign( this.form, { freight: data.freight, discountAmount: data.discount, suppliersId: data.supplierId, suppliers: data.supplierName } )
  }
}
</script>
<style lang="stylus" scoped>
.total
  line-height 40px
  // margin-top 20px
.el-input-number
  vertical-align middle
.footer
  margin-top 20px
  .procurement-member
    margin-right 400px
  .msg
    margin-right 50px
.amount-content
  position relative
  height 200px
  .amount-message
    position absolute
    right 0
</style>
