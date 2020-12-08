<template>
  <div class="box">
    <h3>
      第三步：设置规则
      <!-- <el-tooltip placement="bottom" class="pull-right">
        <div slot="content" v-html="tipsHtml"></div>
        <i class="el-icon-information"></i>
      </el-tooltip>-->
    </h3>
    <hr />设置规则类型
    <el-select :disabled="disabled" v-model="subType" placeholder="请选择">
      <el-option v-for="(item,index) in giftSubTypes" :label="item" :value="index" :key="index"></el-option>
    </el-select>

    <el-row
      v-for="(item,index) in ruleList"
      :gutter="20"
      :key="index"
      :class="{'is-error':item.err}"
      class="center"
    >
      <el-row :gutter="20">
        <el-col :span="1" :xs="2">{{index+1}}</el-col>
        <el-col :span="4" :md="5" :sm="5" :xs="5">满</el-col>
        <el-col :span="6" :md="6" :sm="8" :xs="8" class="left">
          <el-input
            :disabled="disabled"
            v-model.trim="item.condition"
            name="condition"
            @change="check"
            :key="'condition-'+index"
            @blur="fixed(item)"
          ></el-input>
        </el-col>
        <el-col :span="6" class="left">
          <span v-if="subType==1">元</span>
          <span v-if="subType==0">件</span>
          <el-button :disabled="disabled" @click="delRule(index)" type="text" icon="delete">删除规则</el-button>
        </el-col>
      </el-row>
      <el-row v-for="(sku,ind) in item.discount" :key="ind" :gutter="20">
        <el-col :span="1" :xs="2">-</el-col>
        <el-col :span="4" :md="5" :sm="5" :xs="5">送商品</el-col>
        <el-col :span="6" :md="6" :sm="8" :xs="8" class="left">
          <el-input
            :disabled="disabled"
            v-model.trim="sku.lcSkuCode"
            name="discount"
            @change="checkSku(item,sku,'lcSkuCode')"
            :key="'discount-'+index+'-'+ind"
            placeholder="请输入sku商品lc code"
          ></el-input>
        </el-col>
        <el-col :span="6" :md="6" :sm="8" :xs="8" class="left">
          <el-input
            :disabled="disabled"
            v-model.trim="sku.skuNum"
            name="discount"
            @change="checkSku(item,sku,'skuNum')"
            :key="'discount-'+index+'-'+ind"
            placeholder="请输入sku商品件数"
          ></el-input>
        </el-col>
        <el-col :span="1">件</el-col>
        <el-col :span="5" :md="5" :sm="13" :xs="13" class="left">
          <el-button :disabled="disabled" @click="delSku(index,ind)" type="text" icon="delete">删除SKU</el-button>
        </el-col>
      </el-row>
      <el-col class="left" :sm="{span:22,offset:2}" :xs="{span:20,offset:4}">{{item.err}}</el-col>
      <el-col class="left" :sm="{span:22,offset:2}" :xs="{span:20,offset:4}">
        <el-button :disabled="disabled" @click="addSku(index)" type="text" icon="plus">新增SKU</el-button>
      </el-col>
      <hr color="#efefef" />
    </el-row>
    <el-button
      :disabled="disabled"
      @click="addRule()"
      type="text"
      v-if="ruleList.length"
      icon="plus"
    >新增规则</el-button>
  </div>
</template>
<script lang="ts">
import RuleInfoMixins from './ruleInfoMixins'
import { Component, Inject, Watch, Prop } from 'vue-property-decorator'
import { State, Mutation, Action } from 'vuex-class'
import API from '../../../API'
import { giftSubTypes } from '../const'
// let hasInited = false
@Component( {
  name: 'promotion-rule-info-gift'
} )
export default class PromotionRuleInfoGift extends RuleInfoMixins {

  giftSubTypes = giftSubTypes
  get ruleList () {
    return this.ruleInfo.ruleInfo || []
  }

  isChecked: boolean = true
  store: any = {}
  created () {
    let { subType } = this.ruleInfo
    if ( subType !== '' ) {
      this.subType = +subType || 0
    }
  }
  validate () {
    this.check()
    let hasNoNull = this.ruleList.every( val => { // 判断是否有未填写项
      return val.condition && val.discount.every( v => v.lcSkuCode && v.skuNum )
    } )

    if ( !this.isChecked || !hasNoNull ) {
      this.$notify( {
        type: 'error',
        title: '规则设置有误',
        message: "请重新设置后再次尝试"
      } )
    }
    return this.isChecked && hasNoNull
  }
  addRule () {
    this.ruleList.push( { condition: '', discount: [ { lcSkuCode: '', skuNum: '' } ] } )
  }
  delRule ( index ) {
    let ruleInfo = this.ruleList
    ruleInfo.splice( index, 1 )
    if ( !ruleInfo.length ) {
      ruleInfo.push( { condition: '', discount: [ { lcSkuCode: '', skuNum: '' } ] } )
    }
  }
  addSku ( index ) {
    this.ruleList[ index ].discount.push( { lcSkuCode: '', skuNum: '' } )
  }
  delSku ( index, col ) {
    let discount = this.ruleList[ index ].discount
    discount.splice( col, 1 )
    if ( !discount.length ) {
      discount.push( { lcSkuCode: '', skuNum: '' } )
    }
    this.check()
  }
  isInteger ( number ) {
    let n = number % 1
    return !!n
  }
  checkSku ( item, sku, propName ) {
    let discount = item.discount
    sku.lcSkuCode = sku.lcSkuCode.trim()
    sku.skuNum = sku.skuNum.trim()
    delete item.err
    let checkRule = discount.filter( val => val.lcSkuCode == sku.lcSkuCode )
    if ( checkRule.length > 1 ) {
      item.err = '单条规则下配置的商品不能相同'
      this.isChecked = false
      return
    }
    if ( propName == 'lcSkuCode' ) {
      if ( !sku.lcSkuCode ) {
        item.err = '赠送商品的名称需填写'
        this.isChecked = false
        return
      }
    } else if ( propName == 'skuNum' ) {
      let skuNum = sku.skuNum
      if ( !+skuNum || +skuNum < 1 || this.isInteger( skuNum ) ) {
        item.err = '赠送商品的数量需有效'
        this.isChecked = false
        return
      }
    }
  }
  check () {
    let ruleInfo = this.ruleList
    this.isChecked = true
    for ( let i = -1, l = ruleInfo.length; i < l; ++i ) {
      let rule = ruleInfo[ i ],
        nextRule = ruleInfo[ i + 1 ]

      if ( !nextRule ) {
        continue
      }
      if ( nextRule.err ) {
        delete nextRule.err
      }
      let condition = nextRule.condition
      if ( !( +condition ) ) {
        nextRule.err = '单条规则条件设定错误'
        this.isChecked = false
        return
      }
      if ( i == -1 ) continue
      if ( +rule.condition >= +condition ) {
        nextRule.err = '此层级设置的条件不能低于上一层级'
        this.isChecked = false
      }
    }
  }
  fixed ( item ) {
    let v = +item.condition || 0
    if ( this.subType === 1 ) {
      this.$set( item, 'condition', v.toFixed( 2 ) )
    }
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
.el-select
  margin-bottom 30px
.box
  min-height 200px !important
  line-height 36px
</style>

