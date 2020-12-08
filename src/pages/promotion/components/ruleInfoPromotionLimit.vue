<template>
  <div class="box">
    <lc-table :config="config" :data="promotionProducts" :has-page="false">
      <template slot-scope="{row,con}">
        <template v-if="con.prop =='salesLimitNum'">
          <!-- <el-tooltip content="价格错误" placement="bottom" effect="light" v-if="!checkPrice(row)">
              <i class="el-icon-information pull-right"></i>
          </el-tooltip>-->
          <el-input
            placeholder="请输入限售数量"
            v-model.trim="row[con.prop]"
            :disabled="disabled"
            :required="true"
            size="small"
            :class="{'el-form-item':true,'is-error':!checkPrice(row),'width':'auto'}"
          ></el-input>
          <!-- <br/> <span>系统推荐数量 {{row['tuijian']||0}} </span> -->
        </template>
        <template v-else-if="['settlePrice','bottomPrice','level1Price'].includes(con.prop)">
          <span v-price-info="row[con.prop]"></span>
        </template>
        <template v-else>
          <span>{{row[con.prop]}}</span>
        </template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">

import RuleInfoMixins from './ruleInfoMixins'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { State, Mutation, Action } from 'vuex-class'
import API from '../../../API'
import lcTable from '../../../components/table/'
// let hasInited = false
@Component( {
  name: 'promotion-rule-info-promotion-limit',
  components: {
    lcTable
  }
} )
export default class PromotionRuleInfoPromotionLimit extends RuleInfoMixins {
  @Prop( { type: [ Object, Array ], default: () => { } } )
  value: any[]
  @Prop( { type: [ Object, Array ], default: () => { } } )
  promotionProducts: any[]
  @Prop( { type: Boolean, default: false } )
  disabled: boolean
  config = [
    { prop: "name", label: "商品名称", width: "210" },
    { prop: "specification", label: "商品规格", width: "220" },
    { prop: "lcSkuCode", label: "SkuCode", width: "220" },
    { prop: "settlePrice", label: "成本价", width: "250" },
    { prop: "bottomPrice", label: "综合成本价", width: "250" },
    { prop: "level1Price", label: "B价", width: "250" },
    { prop: "stock", label: "库存", width: "250" },
    { prop: "salesLimitNum", label: "限售数量", width: "230" }
  ]

  data = []
  created () {
  }

  rmbFormat ( str ) {
    return rmbFormat( str )
  }

  check () {
    // 检测输入数据是否必填
    this.isChecked = this.promotionProducts && this.promotionProducts.every( function ( item, index, array ) {
      return item.salesLimitNum && +item.salesLimitNum > 0;
    } )
    return this.isChecked
  }

  checkPrice ( item ) {
    let { salesLimitNum } = item
    if ( salesLimitNum && +salesLimitNum > 0 ) {
      return true
    } else {
      return false
    }
  }

  validate () {
    let isChecked = this.check()
    console.log( 'validate', isChecked )
    if ( !isChecked ) {
      this.$notify( {
        type: 'error',
        title: '列表信息填写错误',
        message: "数量填写有误，请填写正确的数量"
      } )
    }
    // return this.isChecked
    return isChecked
  }
}
</script>
<style lang="stylus" scoped>
.el-row
  max-width 1000px
.el-input
  max-width 200px
.el-col
  max-height 37px
  overflow hidden
.is-error
  color #FF4949
.box
  min-height 200px !important
  line-height 36px
.el-input
  width auto
</style>

