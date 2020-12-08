<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="详情" name="detail">
      <el-button
        v-if="$permissionValidateWithEnv( 1293, 1283 ) && status===3"
        type="primary"
        @click="approve"
      >审核</el-button>
      <el-button
        v-if="$permissionValidateWithEnv( 1294, 1284 ) && (status===3 || status===0)"
        type="primary"
        @click="cancel"
      >取消</el-button>
      <lc-dataset :dataset="detailDs">
        <template slot="card-bottom" slot-scope="{card}">
          <lc-card v-if="card==='card1'" title="商品信息">
            <lc-dataset :dataset="goodsDs">
              <template slot="table-bottom">
                <div
                  class="table-bottom"
                >{{`商品总数量：${totalMsg.totalNum} 退款总金额：${totalMsg.totalAmount}`}}</div>
              </template>
            </lc-dataset>
          </lc-card>
          <lc-card v-else-if="card==='card2'" title="备注信息">
            <template slot="title">
              <el-button
                type="primary"
                size="mini"
                @click="addRemark"
                v-if="$permissionValidateWithEnv(1297, 1286)"
              >添加</el-button>
            </template>
            <lc-dataset :dataset="remarkDs"></lc-dataset>
          </lc-card>
        </template>
      </lc-dataset>
    </el-tab-pane>
    <el-tab-pane v-if="$permissionValidateWithEnv(1298, 1287)" label="操作记录" name="action">
      <lc-dataset :dataset="actionDs"></lc-dataset>
    </el-tab-pane>
    <el-tab-pane
      v-if="$permissionValidateWithEnv(1299, 1288) && outhousekDs.records.length>0"
      label="出库记录"
      name="out"
    >
      <div>{{`状态：${outMsgHead.returnStatusName}，发货单号：${outMsgHead.serviceSn}， 下推时间： ${formatMyDate(outMsgHead.pushWmsTime)} 下推WMS：${outMsgHead.pushWmsTypeName}，物流公司：${outMsgHead.logisticName || ''}，物流单号：${outMsgHead.logisticNo || ''}，回传时间：${formatMyDate(outMsgHead.callBackDate)}`}}</div>
      <lc-dataset :dataset="outhousekDs"></lc-dataset>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import detailConfig from './detailConfig/detail'
import goodsConfig from './detailConfig/goods'
import remarkConfig from './detailConfig/remark'
import actionConfig from './detailConfig/action'
import outhouseConfig from './detailConfig/outhouse'

import formRemarkConfig from './detailConfig/formRemark'
import approveConfig from './detailConfig/approve'

import API from '../../../API'
import { formatMyDate } from '../../../utils/index'

export default {
  name: "returnGoodsDetail",
  props: {},
  data() {
    return {
      activeName: 'detail',
      detailDs: '',
      goodsDs: '',
      remarkDs: '',
      actionDs: '',
      outhousekDs: '',
      formRemarkDs: '',
      approveDs: '',
      outMsgHead: {}
    };
  },
  computed: {
    totalMsg() {
      let records = this.goodsDs.value
      let totalNum = 0, totalAmount = 0
      if ( records && records.length > 0 ) {
        records.forEach( record => {
          totalNum += record.skuNum
          totalAmount += record.totalAmount
        } )
      }
      return { totalNum, totalAmount }
    },
    status() {
      return this.detailDs.value.returnOrderStatus
    }
  },
  methods: {
    formatMyDate( value ) {
      return value ? formatMyDate( value, 'yyyy-MM-dd' ) : ''
    },
    addRemark() {
      this.$popup( {
        title: '添加备注',
        props: this.formRemarkDs,
        confirm: () => {
          let flag = this.formRemarkDs.checkRules()
          if ( !flag ) {
            return false
          }
          let params = {
            returnOrderSn: this.detailDs.value.returnOrderSn,
            remarkInfo: this.formRemarkDs.value
          }
          this.$http( this.formRemarkDs.saveUrl, params ).then( data => {
            this.detailDs.query( { returnOrderSn: this.$route.query.code } )
          } )
          return true
        },
        close: () => {
          this.formRemarkDs.reset()
        }
      } )
    },
    approve() {
      this.$popup( {
        title: '审核',
        props: this.approveDs,
        confirm: () => {
          let flag = this.approveDs.checkRules()
          if ( !flag ) {
            return false
          }
          let params = {
            returnOrderSn: this.detailDs.value.returnOrderSn,
            reviewInfo: this.approveDs.value,
            broadcast: true
          }
          this.$http( API.purchaseReturnOrder, params ).then( () => {
            // 0是同意
            if ( this.approveDs.value.reviewFlag === 0 ) {
              this.detailDs.value.returnOrderStatus = 0
              this.modifyListStatus( 0 )
            } else {
              this.detailDs.value.returnOrderStatus = 2
              this.modifyListStatus( 2 )
            }
          } )
          return true
        },
        close: () => {
          this.approveDs.reset()
        }
      } )
    },
    cancel() {
      this.$confirm( '请确认是否取消采购退货单', '提示', {
        type: 'warning'
      } ).then( () => {
        let params = {
          returnOrderSn: this.detailDs.value.returnOrderSn,
          broadcast: true
        }
        this.$http( API.purchaseCancelOrder, params ).then( () => {
          this.detailDs.value.returnOrderStatus = 2
          this.modifyListStatus( 2 )
        } )
      } )
    },
    modifyListStatus( code ) {
      let record = this.listDs.value.find( item => item.returnOrderSn === this.detailDs.value.returnOrderSn )
      if ( record ) {
        record.returnOrderStatus = code
      }
    },
    queryOutMsg() {
      this.$http( API.getOutBoundTitle, { serviceSn: this.$route.query.code } ).then( ( { data } ) => {
        this.outMsgHead = data.data
      } )
    }
  },
  created() {
    // 列表的ds,从缓存中取
    this.listDs = this.$dataSet( 'purchaseReturnOrder' )
    // 单据信息
    this.detailDs = this.$dataSet( detailConfig )
    this.detailDs.query( { returnOrderSn: this.$route.query.code } )
    this.detailDs.on( 'querySuccess', data => {
      // 获取操作记录
      let list = data.data.remarkInfoList.map( ( item, index ) => {
        item.index = index + 1
        return item
      } )
      this.remarkDs.value = list
    } )
    // 商品信息
    this.goodsDs = this.$dataSet( goodsConfig )
    this.goodsDs.query( { returnOrderSn: this.$route.query.code } )
    // 备注列表
    this.remarkDs = this.$dataSet( remarkConfig )
    // 操作记录
    this.actionDs = this.$dataSet( actionConfig )
    this.actionDs.params = { returnOrderSn: this.$route.query.code }
    this.actionDs.query()
    // 出库记录
    this.outhousekDs = this.$dataSet( outhouseConfig )
    this.outhousekDs.params = { serviceSn: this.$route.query.code }
    this.outhousekDs.query()
    this.queryOutMsg()
    // 弹出框的备注
    this.formRemarkDs = this.$dataSet( formRemarkConfig )
    this.formRemarkDs.value = {}
    // 弹出框审核
    this.approveDs = this.$dataSet( approveConfig )
    this.approveDs.on( 'fieldChange', field => {
      if ( field.key === 'auditState' ) {
        let _field = this.approveDs.getField( 'remark' )
        if ( field.value === 0 ) {
          _field.required = true
        } else {
          _field.required = false
          _field.error = ''
        }
      }
    } )
    this.approveDs.value = {}
  },
  deactivated() {
    this.$destroy()
  }
};
</script>

<style lang="stylus" scoped>
.table-bottom
  padding 5px 0
  text-align right
</style>