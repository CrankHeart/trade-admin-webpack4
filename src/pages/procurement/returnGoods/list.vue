<template>
  <lc-dataset :dataset="dataset">
    <template slot="table-top">
      <el-button
        v-if="$permissionValidateWithEnv(1291, 1281)"
        @click="exportExcel"
        type="primary"
      >导出</el-button>
    </template>
  </lc-dataset>
</template>

<script>
import config from './listConfig'
import approveConfig from './detailConfig/approve'
import API from '../../../API'

export default {
  name: "backGoodsList",
  data() {
    return {
      dataset: '',
      approveDs: ''
    };
  },
  methods: {
    approve( record ) {
      this.$popup( {
        title: '审核',
        props: this.approveDs,
        confirm: () => {
          let flag = this.approveDs.checkRules()
          if ( !flag ) {
            return false
          }
          let params = {
            returnOrderSn: record.value.returnOrderSn,
            reviewInfo: this.approveDs.value,
            broadcast: true
          }
          this.$http( API.purchaseReturnOrder, params ).then( () => {
            // 0是同意
            if ( this.approveDs.value.reviewFlag === 0 ) {
              record.value.returnOrderStatus = 0
            } else {
              record.value.returnOrderStatus = 2
            }
          } )
          return true
        },
        close: () => {
          this.approveDs.reset()
        }
      } )
    },
    cancel( record ) {
      this.$confirm( '请确认是否取消采购退货单', '提示', {
        type: 'warning'
      } ).then( () => {
        let params = {
          returnOrderSn: record.value.returnOrderSn,
          broadcast: true
        }
        this.$http( API.purchaseCancelOrder, params ).then( () => {
          record.value.returnOrderStatus = 2
        } )
      } )
    },
    exportExcel() {
      let param = {}
      this.dataset.queryDs.fields.forEach( field => {
        if ( field.hasValue ) {
          param[ field.key ] = field.value
        }
      } )
      this.$submitFile( API.exportPurchaseRetrunOrder, param, '采购退货单' )
    }
  },
  created() {
    // 列表
    this.dataset = this.$dataSet( config )
    this.dataset.on( 'fieldClick', field => {
      if ( field.key === 'returnOrderSn' ) {
        this.$permissionValidateWithNotifyEnv( 1292, 1282 )
        this.$router.push( { path: '/procurement/returnGoodsDetail', query: { code: field.value } } )
      } else if ( field.key === 'procurementOrderSn' ) {
        this.$permissionValidateWithNotifyEnv( 1295, 1285 )
        this.$router.push( `/procurement/detail/${field.value}` )
      }
    } )
    this.dataset.on( 'approve', record => {
      this.$permissionValidateWithNotifyEnv( 1293, 1283 )
      this.approve( record )
    } )
    this.dataset.on( 'cancel', record => {
      this.$permissionValidateWithNotifyEnv( 1294, 1284 )
      this.cancel( record )
    } )
    this.dataset.query()
    // 弹出框审核
    this.approveDs = this.$dataSet( approveConfig )
    this.approveDs.on( 'fieldChange', field => {
      if ( field.key === 'reviewFlag' ) {
        let _field = this.approveDs.getField( 'reviewMsg' )
        if ( field.value === 1 ) {
          _field.required = true
        } else {
          _field.required = false
          _field.error = ''
        }
      }
    } )
    this.approveDs.value = {}
  }
};
</script>

<style lang="stylus" scoped></style>