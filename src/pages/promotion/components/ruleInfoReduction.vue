<template>
  <div class="box">
    <h3>
      第三步：设置规则
      <el-tooltip placement="bottom" class="pull-right">
        <div slot="content" v-html="tipsHtml"></div>
        <i class="el-icon-information"></i>
      </el-tooltip>
    </h3>
    <hr />
    <el-row
      v-for="(item,index) in ruleInfo"
      :key="index"
      :class="{'is-error':item.err}"
      class="center"
    >
      <el-col :span="2" :xs="4">{{index+1}}</el-col>
      <el-col :span="3" :md="3" :sm="6" :xs="6">优惠条件：满</el-col>
      <el-col :span="6" :md="6" :sm="14" :xs="14">
        <el-input
          :disabled="disabled"
          v-model="item.condition"
          @change="check('condition')"
          @blur="fixed(item,'condition')"
          placeholder="需满足金额"
        ></el-input>
      </el-col>
      <el-col
        :span="3"
        :md="{span:3,offset:0}"
        :sm="{span:6,offset:2}"
        :xs="{span:6,offset:4}"
      >促销内容：减</el-col>
      <el-col :span="6" :md="6" :sm="14" :xs="14">
        <el-input
          :disabled="disabled"
          v-model="item.discount"
          @change="check('discount')"
          @blur="fixed(item,'discount')"
          placeholder="将减免金额"
        ></el-input>
      </el-col>
      <el-col :span="4" :md="{span:4,offset:0}" :sm="{span:22,offset:2}" :xs="{span:20,offset:4}">
        <el-button
          :disabled="disabled"
          type="text"
          @click="add(index,ruleInfo)"
          v-if="index == (ruleInfo.length-1)"
          icon="plus"
        >添加</el-button>
        <el-button
          :disabled="disabled"
          type="text"
          v-if="ruleInfo.length!==1"
          @click="del(index,ruleInfo)"
          icon="delete"
        >删除</el-button>
      </el-col>
      <el-col :sm="{span:22,offset:2}" :xs="{span:20,offset:4}" v-if="item.err">{{item.err}}</el-col>
    </el-row>
  </div>
</template>
<script lang="ts">

import RuleInfoMixins from './ruleInfoMixins'
import { Component, Prop } from 'vue-property-decorator'
import { State, Mutation, Action } from 'vuex-class'
import API from '../../../API'

// let hasInited = false
@Component( {
  name: 'promotion-rule-info-reduction'
} )
export default class PromotionRuleInfoReduction extends RuleInfoMixins {
  @Prop( { default: () => [] } )
  value: any[]
  tipsHtml = `促销层级1，满X元必须填值
        <br /> 促销层级1，减Y元必须填值
        <br /> 促销层级1，满减现金必须小于单笔消费总额
        <br /> 促销层级2，满X元必须大于层级1
        <br /> 促销层级2，减Y元必须大于层级1`

  created () {
    let ruleInfo = this.ruleInfo
    console.log( JSON.stringify( ruleInfo ) )
    this.ruleInfo = ruleInfo.length ? ruleInfo : [ { condition: '', discount: '' } ]
  }
  validate () {
    this.check()
    if ( !this.isChecked ) {
      this.$notify( {
        type: 'error',
        title: '规则设置有误',
        message: "请重新设置后再次尝试"
      } )
    }
    return this.isChecked
  }
  check ( type?) {
    let ruleInfo = this.ruleInfo
    this.isChecked = true
    const conErr = '满减现金不能超过单笔消费总额'

    for ( let i = -1, l = ruleInfo.length; i < l - 1; ++i ) {
      let rule = ruleInfo[ i ]
      let nextRule = ruleInfo[ i + 1 ]
      delete nextRule.err
      if ( !( +nextRule.condition ) || !( +nextRule.discount ) ) {
        // nextRule.err = '满减规则必须填写有效值！'
        this.isChecked = false
        break
      }
      if ( +nextRule.condition <= +nextRule.discount ) {
        nextRule.err = conErr
        this.isChecked = false
        break
      }
      if ( i == -1 ) continue
      if ( +rule.condition >= +nextRule.condition ) {
        nextRule.err = '单笔消费总额不能低于上一层级'
        this.isChecked = false
        break
      } else if ( nextRule.discount && +rule.discount >= +nextRule.discount ) {
        nextRule.err = '满减现金不能低于上一层级'
        this.isChecked = false
        break
      }
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
.box
  min-height 200px !important
  line-height 36px
</style>

