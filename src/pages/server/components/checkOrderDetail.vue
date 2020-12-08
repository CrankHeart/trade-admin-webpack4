<template>
  <div class="check-order-detail">
    <el-dialog v-model="showDialog" size="large" title="对账单对账明细">
      <div class="el-table el-table--fit el-table--striped el-table--border">
        <table cellpadding='0' cellspacing='0' width='100%'>
          <colgroup>
            <col v-for="item in config" :key="item.prop" :width="item.width">
            </col>
          </colgroup>
          <thead>
            <th v-for="(con, index) in config" :key="index" style="text-align:center;">
              <div class="cell">{{con.label}}</div>
            </th>
          </thead>
        </table>
      </div>
      <div class="table-height el-table el-table--fit el-table--striped el-table--border">
        <table cellpadding='0' cellspacing='0' width='100%'>
          <colgroup>
            <col v-for="item in config" :key="item.prop" :width="item.width">
            </col>
          </colgroup>
          <tbody>
            <tr v-for="product in productList" :key="product.sn" class="center">
              <td v-for="con in config" :key="con.prop">
                <div class="cell">
                  <template v-if="con.prop==='amount'">
                    {{toFixed2((product.skuNum|| product.number)*product.price, con.prop)}}
                  </template>
                  <template v-else-if="con.prop==='discount'" >
                    {{ toFixed2(product.subtotal-(product.skuNum|| product.number)*product.price,con.prop)}}
                  </template>
                  <template v-else>{{toFixed2(product[con.prop],con.prop)}}</template>

                </div>
              </td>
            </tr>
            <tr class="el-table__empty-block" v-if='productList.length==0'>
              <td :colspan="config.length">
                <div class="cell">暂无数据</div>
              </td>
            </tr>
          </tbody>
          <tbody v-for="( server, index ) in serverList" :key="index">
            <tr class="server-row">
              <td :colspan="config.length">
                <div class="cell">
                  <span>服务单号：{{server.serviceSn}}</span>
                  <span>申请时间：{{ formatMyDate( server.applyDate.time ) }}</span>
                </div>
              </td>
            </tr>
            <tr v-for="product in server.financialReceivableDetailList " :key="product.lcSkuCode" class="center">
              <td v-for="con in config" :key="con.prop">
                <div class="cell">
                  <template
                      v-if="con.prop==='amount'"
                    >{{toFixed2((product.skuNum|| product.number)*product.price, con.prop)}}</template>
                    <template
                      v-else-if="con.prop==='discount'"
                    >
                    {{ toFixed2(product.subtotal-(product.skuNum|| product.number)*product.price,con.prop)}}</template>
                    <template v-else>{{toFixed2(product[con.prop] ,con.prop)}}</template>

                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import API from '../../../API'
import lcTable from '../../../components/table/'

@Component( {
  name: 'check-order-detail',
  components: {
    lcTable
  }
} )
export default class CheckOrderDetail extends Vue {
  @Inject() formatMyDate

  @Prop( { default: false } )
  value: boolean

  @Prop( { default: '' } )
  orderSn: string
  toFixed2(val, key)  {
    let toFixed2Arr: any[] = ['price', 'amount', 'discount', 'subtotal']
    return typeof val === 'number' && (toFixed2Arr.includes(key) || key == undefined) ? val.toFixed(2) : val
  }
  @Watch( 'value' )
  viewValue ( newVal ) {
    if ( newVal ) {
      this.checkingOrderDetail()
    }
  }

  get showDialog () {
    return this.value
  }

  set showDialog ( v ) {
    this.$emit( 'input', v )
  }

  config: any[] = [
    { prop: 'skuName', label: '商品名称', width: '180' },
    { prop: 'specification', label: '规格', width: '180' },
    { prop: 'unit', label: '单位', width: '180' },
    { prop: 'skuNum', label: '数量', width: '180' },
    { prop: 'price', label: '单价', width: '180' },
    { prop: 'amount', label: '金额', width: '180' },
    { prop: 'discount', label: '单项优惠', width: '180' },
    { prop: 'subtotal', label: '小计', width: '180' },
  ]

  // 正常商品列表
  productList: any[] = []

  // 服务单列表
  serverList: any[] = []

  accountCheckSn: String = ''

  activated () {
    this.accountCheckSn = this.$route.params.id
  }

  checkingOrderDetail () {
    this.$permissionValidateWithNotify( 1075 )
    this.$http( API.checkingOrderDetail, {
      orderSn: this.orderSn,
      accountCheckSn: this.accountCheckSn
    } ).then( ( { data } ) => {
      let { normalFinancialReceivableDetailList,accountStamentServiceOrderVoList } = data
      // const returnProducts = []
      this.productList = normalFinancialReceivableDetailList
      this.serverList = accountStamentServiceOrderVoList
      // normalFinancialReceivableDetailList.forEach( item => {
      //   if ( item.businessType === 1 ) {
      //     if ( item.name === '运费' ) {
      //       item.discount = ''
      //       item.number = ''
      //       item.price = ''
      //     }
      //     this.productList.push( item )
      //   } else if ( item.businessType === 2 ) {
      //     returnProducts.push( item )
      //   } else { }
      // } )

      // this.serverList = returnProducts.map( item => {
      //   const obj = {}
      //   if ( obj[ item.sn ] ) {
      //     obj[ item.sn ] = [ ...obj[ item.sn ], item ]
      //   } else {
      //     obj[ item.sn ] = [ item ]
      //   }
      //   return obj
      // } ).map( item => {
      //   let key = Object.keys( item )[ 0 ]
      //   return {
      //     serverSn: key,
      //     actionTime: item[ key ][ 0 ].actionTime,
      //     list: item[ key ]
      //   }
      // } )
    } )
  }
}
</script>

<style lang="stylus" scoped>
.check-order-detail
  .server-row
    background #e3e3e3
    height 43px
    line-height 43px
.table-height
  max-height 450px
  overflow auto
</style>
