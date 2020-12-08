<template>
  <div class="association-config">
    <lc-title text="协议价策略管理"></lc-title>
    <el-row :gutter="30">
      <el-col :span="16">
        <lc-table
          :config="config"
          :data="tableData"
          @cur-change="curChange"
          :page="page"
          @size-change="sizeChange"
        >
          <template slot-scope="{row,con}">
            <template
              v-if="con.prop=='lastUpdateTime' || con.prop=='createTime'"
            >{{formatTime(row[con.prop])}}</template>
            <template v-else-if="con.prop=='control'">
              <el-button type="text" @click="mixinDiscountConfig(row)">查看</el-button>
            </template>
            <template v-else>{{row[con.prop]}}</template>
          </template>
        </lc-table>
      </el-col>
      <el-col :span="8">
        <el-card v-if="$permissionValidate(1012)">
          <div slot="header">
            <span>会员折扣设置</span>
            <el-button
              type="primary"
              size="small"
              class="pull-right"
              @click="update"
              :disabled="!hasChange&&$permissionValidate(1013)"
            >提交</el-button>
            <el-button
              size="small"
              class="pull-right"
              @click="mixinDiscountConfig(defaultConfig)"
            >取消</el-button>
          </div>
          <ul>
            <li v-for="item in 4" :key="item">
              <el-checkbox
                v-model="discountConfig[`biddingStrategyLevel${item-1}Enabled`]"
                size="small"
                :true-label="1"
                :false-label="0"
              >{{discountConfig[`biddingStrategyLevel${item-1}Label`]}}</el-checkbox>
              <el-input
                v-model.number="discountConfig[`biddingStrategyLevel${item-1}`]"
                size="small"
              >
                <span slot="append">%</span>
              </el-input>
            </li>
            <li>
              <el-checkbox
                v-model="discountConfig.salesGuidePriceEnabled"
                size="small"
                :true-label="1"
                :false-label="0"
              >{{discountConfig.salesGuidePriceLabel}}</el-checkbox>
            </li>
            <li>
              <span>备注</span>
              <el-input
                v-model="discountConfig.remark"
                size="small"
                type="textarea"
                placeholder="非必填"
              ></el-input>
            </li>
          </ul>
          <div class="item">
            <span>销售指导价补偿</span>
            <el-input
              v-model="discountConfig.salesGuidePriceCompensation"
              size="small"
              placeholder="非必填"
            ></el-input>
          </div>
          <div class="item">
            <span>报价低于销售指导价</span>
            <el-radio-group v-model="discountConfig.ltSalesGuidePriceEnabled">
              <el-radio :label="0">不可以</el-radio>
              <el-radio :label="1">可以</el-radio>
            </el-radio-group>
          </div>
          <div class="item">
            <span>已有协议价的商品是否可以报价</span>
            <el-radio-group v-model="discountConfig.agreePriceCoverageEnabled">
              <el-radio :label="0">不可以</el-radio>
              <el-radio :label="1">可以</el-radio>
            </el-radio-group>
          </div>
          <div class="item">
            <span>自动审批策略</span>
            <el-radio-group v-model="discountConfig.autoAudit">
              <el-radio :label="0">不开启自动审批</el-radio>
              <el-radio :label="1">整单审批</el-radio>
              <el-radio :label="2">部分审批</el-radio>
            </el-radio-group>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import lcTitle from '../../../components/title.vue'
import lcTable from '../../../components/table'
import API from '../../../API'
import { State, Action, Mutation } from 'vuex-class'
@Component( {
  name: 'association-discount',
  components: {
    lcTitle,
    lcTable
  }
} )
export default class AssociationDiscount extends Vue {
  visible: boolean = false
  @State( state => state.association.defaultConfig ) defaultConfig
  @Mutation( 'association/setDefaultConfig' ) setDefaultConfig
  @Action( 'association/getDefaultConfig' ) getDefaultConfig
  @Inject()
  formatMyDate
  get hasChange () {
    let keys = [
      'biddingStrategyLevel0',
      'biddingStrategyLevel1',
      'biddingStrategyLevel2',
      'biddingStrategyLevel3',
      'biddingStrategyLevel0Enabled',
      'biddingStrategyLevel1Enabled',
      'biddingStrategyLevel2Enabled',
      'biddingStrategyLevel3Enabled',
      'salesGuidePriceEnabled',
      'salesGuidePriceCompensation',
      'ltSalesGuidePriceEnabled',
      'agreePriceCoverageEnabled',
      'autoAudit'
    ]
    return !keys.every( key => this.defaultConfig && this.defaultConfig[ key ] == this.discountConfig[ key ] )
  }
  config = [
    { prop: 'id', label: '序号' },
    { prop: 'createTime', label: '提交时间' },
    { prop: 'lastUpdateTime', label: '更新时间' },
    { prop: 'lastUpdateUser', label: '更新人' },
    { prop: 'control', label: '操作' },
  ]
  formatTime ( o ) {
    let time = o && o.time
    if ( time ) {
      return this.formatMyDate( new Date( time ) )
    }
    return '--'
  }
  remark: string = ''
  created () {
    this.getData()
    if ( this.$permissionValidate( 1012 ) ) {
      this.getDefaultConfig().then( config => {
        this.mixinDiscountConfig( config )
      } )
    }
  }
  discountConfig: any = {}
  tableData: any[] = []
  page = {
    cur: 1,
    total: 0,
    num: 20,
    sizes: [ 10, 20, 50, 100 ]
  }
  mixinDiscountConfig ( config ) {
    // let { biddingStrategyLevel0, biddingStrategyLevel1, biddingStrategyLevel2, biddingStrategyLevel3 } = config

    this.discountConfig = Object.assign( {}, this.defaultConfig, {
      ...config,
    } )
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.getData()
  }
  sizeChange ( size ) {
    this.page.num = size
    this.curChange( 1 )
  }
  getData () {
    this.$permissionValidateWithNotify( 1011 )
    let { cur, num } = this.page
    let o: any = {
      start: ( cur - 1 ) * num,
      num
    }
    this.$http( API.getCorpSettingOperateLog, o ).then( ( { data } ) => {
      let myData = data.data
      this.tableData = ( myData.list || [] ).map( val => ( {
        ...val,
        biddingStrategyLevel0: val.biddingStrategyLevel0 * 100 || '',
        biddingStrategyLevel1: val.biddingStrategyLevel1 * 100 || '',
        biddingStrategyLevel2: val.biddingStrategyLevel2 * 100 || '',
        biddingStrategyLevel3: val.biddingStrategyLevel3 * 100 || ''
      } ) )
      this.page.total = myData.total || 0
    } )
  }
  update () {
    let { biddingStrategyLevel0, biddingStrategyLevel1, biddingStrategyLevel2, biddingStrategyLevel3 } = this.discountConfig
    let keys = [
      'biddingStrategyLevel0',
      'biddingStrategyLevel1',
      'biddingStrategyLevel2',
      'biddingStrategyLevel3',
      'salesGuidePrice'
    ]
    let option: any = {}
    keys.forEach( key => {
      let enableKey = `${key}Enabled`
      if ( this.discountConfig[ enableKey ] ) {
        option[ key ] = this.discountConfig[ key ] / 100
      }
      option[ enableKey ] = this.discountConfig[ enableKey ]
    } )
    option.remark = this.discountConfig.remark
    option.broadcast = true

    let extendskeys = [
      'salesGuidePriceCompensation',
      'ltSalesGuidePriceEnabled',
      'agreePriceCoverageEnabled',
      'autoAudit'
    ]
    extendskeys.forEach( key => {
      option[ key ] = this.discountConfig[ key ]
    } )
    this.$http( API.updatePersonalizedSetting, option ).then( ( { data } ) => {
      this.tableData.unshift( {
        ...this.defaultConfig,
        id: undefined,
        lastUpdateTime: {
          time: ( new Date() ).getTime()
        }
      } )
      this.page.total += 1
      this.setDefaultConfig( this.discountConfig )
    } )
  }
}
</script>
<style lang="stylus" scoped>
h4
  margin-bottom 22px
li
  display flex
  line-height 34px
  margin-bottom 10px
  .el-input
    flex-grow 1
    margin-top 3px
  .el-checkbox, & > span
    flex-shrink 1
    width 150px
  & > span
    padding-left 40px
    box-sizing border-box
.item, .item span
  display block
  padding-bottom 10px
</style>

