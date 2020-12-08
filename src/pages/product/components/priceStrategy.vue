<template>
  <div id="price-strategy">
    <lc-title text="定价策略"></lc-title>
    <el-card class="strategy-card">
      <div slot="header" class="clearfix">
        <el-button
          v-if="$permissionValidateWithEnv(1259, 1255) && !isEdit"
          type="primary"
          size="small"
          class="pull-right"
          @click="isEdit=true"
        >编辑</el-button>
        <template v-if='isEdit'>
          <el-button type="primary" size="small" class="pull-right" @click="submitPriceStrategy">提交</el-button>
          <el-button type="default" size="small" class="pull-right" @click="cancel">取消</el-button>
        </template>
      </div>
      <template v-if="!isEdit">
        <p class="strategy-item">履约成本占比：{{productPricingStrategy.costProportion}}%</p>
        <p class="strategy-item">A类商品利润因子范围：（-，{{productPricingStrategy.profit1Upper}}%）</p>
        <p
          class="strategy-item"
        >B类商品利润因子范围：[{{productPricingStrategy.profit2Lower}}%，{{productPricingStrategy.profit2Upper}}%）</p>
        <p class="strategy-item">C类商品利润因子范围：[{{productPricingStrategy.profit3Lower}}%，-）</p>
      </template>
      <template v-else>
        <div class="strategy-item">
          履约成本占比：
          <el-input v-model.number="productPricingStrategy.costProportion" size="small" style="width: 100px;">
            <span slot="append">%</span>
          </el-input>
        </div>
        <div class="strategy-item">
          A类商品利润因子范围：（&nbsp;
          <el-input
            v-model.number="productPricingStrategy.profit1Lower"
            :disabled="true"
            size="small"
            style="width: 100px;"
            class="strategy-item-center"
          >
            <span slot="append">%</span>
          </el-input>&nbsp;，&nbsp;
          <el-input
            @change="changeAUpper"
            v-model.number="productPricingStrategy.profit1Upper"
            size="small"
            style="width: 100px;"
          >
            <span slot="append">%</span>
          </el-input>&nbsp;）
        </div>
        <div class="strategy-item">
          B类商品利润因子范围：[&nbsp;
          <el-input
            @change="changeBLower"
            v-model.number="productPricingStrategy.profit2Lower"
            size="small"
            style="width: 100px;"
          >
            <span slot="append">%</span>
          </el-input>&nbsp;，&nbsp;
          <el-input
            @change="changeBUpper"
            v-model.number="productPricingStrategy.profit2Upper"
            size="small"
            style="width: 100px;"
          >
            <span slot="append">%</span>
          </el-input>&nbsp;）
        </div>
        <div class="strategy-item">
          C类商品利润因子范围：[&nbsp;
          <el-input
            @change="changeCLower"
            v-model.number="productPricingStrategy.profit3Lower"
            size="small"
            style="width: 100px;"
          >
            <span slot="append">%</span>
          </el-input>&nbsp;，&nbsp;
          <el-input
            v-model.number="productPricingStrategy.profit3Upper"
            :disabled="true"
            size="small"
            style="width: 100px;"
            class="strategy-item-center"
          >
            <span slot="append">%</span>
          </el-input>&nbsp;）
        </div>
      </template>
    </el-card>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import API from "../../../API"
import lcTitle from "../../../components/title.vue"
import lcCondition from "../../../components/condition.vue"
import lcTable from "../../../components/table/index"
import lcTableConfig from "../../../components/table/control.vue"
import { State, Action, Getter, Mutation } from "vuex-class"
import { matchArrItem } from '../../../utils'

@Component( {
  name: "price-strategy",
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    lcTableConfig
  }
} )
export default class ProductStrategy extends Vue {
  isEdit = false
  data: any = {}
  productPricingStrategy: any = {
    costProportion: null,
    profit1Lower: '-',
    profit1Upper: null,
    profit2Lower: null,
    profit2Upper: null,
    profit3Lower: null,
    profit3Upper: '-',
  }

  // * 两位小数
  reg1 = /(^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$)/
  // * 保留到大于等于0的两位小数
  reg2 = /(^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$)/
  // * 大于0的两位小数
  reg3 = /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/

  isValidateFunc () {
    let isValidate = true;
    Object.keys( this.productPricingStrategy ).forEach( item => {
      if ( item !== "profit1Lower" && item !== "profit3Upper" ) {
        console.log( 'item', this.productPricingStrategy[ item ] )
        if ( this.productPricingStrategy[ item ] === "" || this.productPricingStrategy[ item ] === null ) {
          this.$notify( {
            message: '选项不能为空',
            type: 'error'
          } )
          return isValidate = false
        }
        // ? 弄不清楚验证规则，先这么做了
        if ( !this.reg1.test( this.productPricingStrategy[ item ] ) ) {
          this.$notify( {
            message: `${item === 'costProportion' ? '履约成本占比' : '利润因子'}输入不合法`,
            type: 'error'
          } )
          return isValidate = false
        }
      }
    } )
    return isValidate
  }

  changeAUpper ( val ) {
    this.productPricingStrategy.profit2Lower = val
  }

  changeBLower ( val ) {
    this.productPricingStrategy.profit1Upper = val
  }

  changeBUpper ( val ) {
    this.productPricingStrategy.profit3Lower = val
  }

  changeCLower ( val ) {
    this.productPricingStrategy.profit2Upper = val
  }

  submitPriceStrategy () {
    if ( !this.isValidateFunc() ) return
    const params = { ...this.productPricingStrategy, profit1Lower: null, profit3Upper: null }
    this.$http( API.updatePricingStrategyInfo, params ).then( ( { data } ) => {
      this.isEdit = false
      this.$notify( {
        message: data.msg || '提交成功',
        type: 'success'
      } )
    } ).catch( err => {
      this.$notify( {
        message: err.data.msg || '提交失败',
        type: 'error'
      } )
    } )
  }
  cancel () {
    this.isEdit = false
    this.productPricingStrategy = {
      ...this.productPricingStrategy,
      ...this.data.productPricingStrategy,
      profit1Lower: '-',
      profit3Upper: '-'
    }
  }
  created () {
    this.$http( API.getPricingStrategyDetail ).then( ( { data } ) => {
      this.data = data
      this.productPricingStrategy = {
        ...this.productPricingStrategy,
        ...this.data.productPricingStrategy,
        profit1Lower: '-',
        profit3Upper: '-'
      }
    } )
  }
}
</script>

<style lang="stylus" scoped>
.strategy-item
  padding 12px 20px
  font-size 14px
  &:not(:last-child)
    border-bottom 1px solid #d1dbe5
</style>
<style lang="stylus">
#price-strategy
  .strategy-card
    .el-card__header
      padding 10px 20px
    .el-card__body
      padding 0
  .strategy-item
    .strategy-item-center
      input
        text-align center
</style>

