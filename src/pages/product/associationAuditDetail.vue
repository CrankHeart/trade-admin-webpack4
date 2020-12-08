<template>
  <div class="association-audit-detail">
    <lc-title :text="`协议申请-${tenantName}-${applySn}`"></lc-title>
    <template v-if="isAudit">
      <el-button
        size="small"
        type="primary"
        :disabled="!selectedItems.length"
        @click="batchControl(1)"
      >批量通过</el-button>
      <el-button
        size="small"
        type="primary"
        :disabled="!selectedItems.length"
        @click="batchControl(0)"
      >批量拒绝</el-button>
      <br />
    </template>
    <lc-table
      :config="tableConfig"
      :data="tableData"
      :page="page"
      @cur-change="curChange"
      @size-change="sizeChange"
      :selection="true"
      @data-selection-change="sectionChange"
      controller-name="associationAuditDetail"
    >
      <template slot-scope="{row,con}">
        <template
          v-if="con.prop=='memberLevel'||con.prop=='goalStatus'"
        >{{converData(con.prop,row[con.prop])}}</template>
        <template v-else-if="con.prop=='quoteStatus'">
          <span :class="{red:!row[con.prop]}">{{converData(con.prop,row[con.prop])}}</span>
        </template>
        <template v-else-if="con.prop=='auditStatus'">
          <el-radio-group v-model="row[con.prop]" :disabled="!isAudit">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="0">拒绝</el-radio>
          </el-radio-group>
        </template>
        <template v-else-if="con.prop=='remark'">
          <el-input v-model="row[con.prop]" type="textarea" :disabled="!isAudit"></el-input>
        </template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
      <div class="clearfix" slot="append" v-if="isAudit">
        <el-button type="primary" class="pull-right" @click="save()">保存当页</el-button>
        <el-button type="primary" class="pull-right" @click="submit()">提交</el-button>
      </div>
    </lc-table>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import lcTable from '../../components/table/'
import API from '../../API'
import { memberLevels } from '../../const'
import { quoteStatuses, goalStatuses } from './const'
import { matchArrItem } from '../../utils'

@Component( {
  name: 'association-audit-detail',
  components: {
    lcTitle,
    lcTable
  }
} )
export default class AssociationAuditDetail extends Vue {
  get applySn () {
    let { applySn } = this.$route.params
    return applySn
  }
  get isAudit () {
    return this.$route.path.indexOf( 'association/audit' ) > -1
  }
  tenantName: string = ''
  save ( list?) {
    this.$permissionValidateWithNotify( 1016 )
    list = list || this.tableData
    if ( !list.length ) {
      return
    }
    this.$http( API.saveApplyDetail, {
      applySn: this.applySn,
      broadcast: true,
      skuList: list.map( ( { id, auditStatus, remark } ) => ( { id, auditStatus, remark } ) )
    } ).then( ( { data } ) => {
      console.log( data )
    } )
  }
  submit () {
    this.$permissionValidateWithNotify( 1017 )
    this.$confirm( '此操作将会提交此申请单，是否确认提交！', '提交', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.$http( API.submitApplyDetail, {
        applySn: this.applySn,
        broadcast: true
      } ).then( ( { data } ) => {
        this.$router.replace( '/product/association?activeName=audit' )
      } )
    } )

  }
  get tableConfig () {
    const lcConfig = [
      { label: 'LC编码', prop: 'lcCode', width: '180' },
      { label: 'SKU编码', prop: 'lcSkuCode', width: '180' },
      { label: '商品名称', prop: 'productName', width: '180' },
      { label: '品牌', prop: 'brandName' },
      { label: '规格', prop: 'specification', width: '280' },
      { label: '单位', prop: 'unit' },
      { label: '售价', prop: 'salePrice' },
      { label: '会员等级', prop: 'memberLevel', width: '150' },
      { label: '会员价', prop: 'levelPrice' },
      { label: '会员折扣率', prop: 'memberRate', width: '150' },
      { label: '协议价状态', prop: 'goalStatus', width: '150' },
      { label: '协议价', prop: 'agreePrice' },
      { label: '销售底价', prop: 'guidePrice', width: '150' },
      { label: '综合成本价', prop: 'bottomPrice', width: '150' },
      { label: '厂家限价', prop: 'factoryLimitedPrice', width: '150' },
      { label: '平台限价', prop: 'platformPrice', width: '150' },
      { label: '报价状态', prop: 'quoteStatus', width: '150' },
      { label: '集团交易额', prop: 'groupTradeBalance', width: '180' } ]
    if ( this.$permissionValidate( 487 ) ) {
      lcConfig.push( { prop: 'grossProfit', label: '毛利率', width: '200' } )
    }
    return [
      ...lcConfig,
      { label: '操作', prop: 'auditStatus', fixed: 'right', width: '180' },
      { label: '备注', prop: 'remark', fixed: 'right', width: '180' }
    ]
  }
  batchControl ( bo ) {
    this.selectedItems.forEach( v => v.auditStatus = bo )
    this.save( this.selectedItems )
  }
  selectedItems = []
  sectionChange ( list ) {
    this.selectedItems = list
  }
  tabelData: any[] = []
  computeOption () {
    let o: any = { applySn: this.applySn }
    let { cur, num } = this.page
    o.start = ( cur - 1 ) * num
    o.num = num
    return o
  }
  tableData: any[] = []
  getData () {
    if ( this.isAudit ) {
      this.$permissionValidateWithNotify( 1014 )
    } else {
      this.$permissionValidateWithNotify( 1018 )
    }
    let o = this.computeOption()
    this.$http( API.getApplyDetail, o ).then( ( { data } ) => {
      let myData = data.data || {}
      this.tableData = myData.list
      this.tenantName = myData.tenantName
      this.page.total = myData.total
    }, () => {
      this.tableData = []
      this.page.total = 0
      this.tenantName = ''
    } )
  }
  curChange ( cur = 1 ) {
    this.page.cur = cur
    this.getData()
  }
  sizeChange ( size ) {
    this.page.num = size
    this.curChange()
  }
  page = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 50, 100 ]
  }
  activated () {
    this.getData()
  }
  converData ( prop, value ) {
    let arr = []
    switch ( prop ) {
      case 'quoteStatus':
        arr = quoteStatuses
        break
      case 'memberLevel':
        arr = memberLevels
        break
      case 'goalStatus':
        arr = goalStatuses
        break
    }
    return matchArrItem( value, arr, 'id' ).name
  }
}
</script>
<style lang="stylus" scoped>
.red
  color red
</style>
