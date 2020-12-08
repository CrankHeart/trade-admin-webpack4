<template>
  <lc-dataset :dataset="dataset">
    <template slot="table-top">
      <el-button
        v-if="$permissionValidateWithEnv(1302, 1291)"
        @click="exportExcel"
        type="primary"
      >导出</el-button>
    </template>
  </lc-dataset>
</template>

<script>
import config from './listConfig'
import approveConfig from './detailConfig/approve'

export default {
  name: "changeGoodsList",
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
        confirm: async () => {
          return await this.approveDs.save()
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

      } )
    },
    exportExcel() {
      let param = {}
      this.dataset.queryDs.fields.forEach( field => {
        if ( field.hasValue ) {
          param[ field.key ] = field.value
        }
      } )
      this.$submit( API.exportPurchaseRetrunOrder, param )
    }
  },
  created() {
    //列表
    this.dataset = this.$dataSet( config )
    this.dataset.on( 'fieldClick', field => {
      if ( field.key === 'returnOrderSn' ) {
        this.$permissionValidateWithNotifyEnv( 1303, 1292 )
        this.$router.push( { path: '/procurement/changeGoodsDetail', query: { code: field.parent.value.returnOrderSn } } )
      } else if ( field.key === 'procurementOrderSn' ) {
        this.$permissionValidateWithNotifyEnv( 1306, 1295 )
        this.$router.push( `/procurement/detail/${field.value}?deliverySource=${field.parent.value.deliverySource}` )
      }
    } )
    this.dataset.on( 'approve', record => {
      this.$permissionValidateWithNotifyEnv( 1304, 1293 )
      this.approve( record )
    } )
    this.dataset.on( 'cancel', record => {
      this.$permissionValidateWithNotifyEnv( 1305, 1294 )
      this.cancel( record )
    } )
    this.dataset.value = [ { returnOrderSn: 'THH202006170004324500', procurementOrderSn: 'CG202008272159074689066', deliverySource: 0 } ]
    //弹出框审核
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
  }
};
</script>

<style lang="stylus" scoped>
</style>