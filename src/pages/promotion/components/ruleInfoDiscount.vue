<template>
  <div class="box">
    <h3>
      第三步：设置规则
      <el-tooltip placement="bottom" class="pull-right">
        <div slot="content" v-html="tipsHtml"></div>
        <i class="el-icon-information"></i>
      </el-tooltip>
    </h3>
    <hr />设置规则类型
    <el-select :disabled="disabled" v-model="subType" placeholder="请选择">
      <el-option v-for="(item,index) in discountSubTypes" :label="item" :value="index" :key="index"></el-option>
    </el-select>

    <el-row
      v-for="(item,index) in ruleList"
      :class="{'is-error':item.err}"
      class="center"
      :key="`${subType}-${index}`"
    >
      <el-col :span="2" :xs="4">{{index+1}}</el-col>
      <el-col :span="3" :md="3" :sm="6" :xs="5">
        <span v-if="subType==0">第</span>
        <span v-if="subType==1">满</span>
        <span v-if="subType==2">买</span>
      </el-col>
      <el-col :span="6" :md="6" :sm="14" :xs="14">
        <el-input
          :disabled="disabled"
          v-model="item.condition"
          name="condition"
          @change="check"
          :key="'condition-'+index"
        ></el-input>
      </el-col>

      <el-col :span="3" :md="{span:3,offset:0}" :sm="{span:6,offset:2}" :xs="{span:5,offset:4}">
        <span v-if="subType==0">件</span>
        <span v-if="subType==1">件每件</span>
        <span v-if="subType==2">件赠同品</span>
      </el-col>
      <el-col :span="6" :md="6" :sm="14" :xs="14">
        <el-input
          :disabled="disabled"
          v-model="item.discount"
          name="discount"
          @change="check(item)"
          @blur="fixed(item)"
          :key="'discount-'+index"
        ></el-input>
      </el-col>
      <el-col :span="1">
        <span v-if="subType<2">折</span>
        <span v-if="subType==2">件</span>
      </el-col>

      <el-col :span="3" :md="{span:3,offset:0}" :sm="{span:22,offset:2}" :xs="{span:20,offset:4}">
        <el-button
          :disabled="disabled"
          type="text"
          @click="add(index,ruleList)"
          v-if="index == (ruleList.length-1)"
          icon="plus"
        >添加</el-button>
        <el-button
          :disabled="disabled"
          type="text"
          v-if="ruleList.length!==1"
          @click="del(index,ruleList)"
          icon="delete"
        >删除</el-button>
      </el-col>
      <el-col :sm="{span:22,offset:2}" :xs="{span:20,offset:4}" v-if="item.err">{{item.err}}</el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import RuleInfoMixins from './ruleInfoMixins'
import { Component, Inject, Watch } from 'vue-property-decorator'
import { State, Mutation, Action } from 'vuex-class'
import API from '../../../API'
import { discountSubTypes } from '../const'
// let hasInited = false
@Component( {
  name: 'promotion-rule-info-discount'
} )
export default class PromotionRuleInfoDiscount extends RuleInfoMixins {
  discountSubTypes = discountSubTypes
  tipsHtml = `促销层级1，第X件必须填值
      <br /> 促销层级1，Y折必须填值
      <br /> 促销层级2，第X件必须大于层级1
      <br /> 促销层级2，Y折必须小于层级1（赠同品需大于层级1）`
  get ruleList () {
    return this.ruleInfo.ruleInfo
  }
  @Watch( 'subType' )
  subTypeWatcher ( v ) {
    let ruleInfoContainer: any = this.ruleInfo,
      // ruleInfo = store.ruleInfo,
      subType = ruleInfoContainer.subType
    if ( subType !== v ) {
      let ruleInfo = [ { condition: '', discount: '' } ]
      this.ruleInfo = { ...this.ruleInfo, ruleInfo, subType: v }
    }
    // this.promotionChange({ subType: v })
  }
  // created () {
  //   let { subType } = this.ruleInfo
  //   if ( subType !== '' ) {
  //     this.subType = +subType || ''
  //   }
  // }
  validate () {
    this.check()
    if ( !this.isChecked ) {
      this.$notify( {
        type: 'error',
        title: '规则设置有误',
        message: "请重新设置后再次尝试"
      } )
      // return this.promotionChange({ checkRule: false })
    }
    return this.isChecked
    // this.promotionChange({ checkRule: true })
  }
  check ( type?) {
    let ruleList = this.ruleList || []
    let subType = +this.subType
    this.isChecked = true
    const conErr = '此层级设置的件数不能低于上一层级'
    if ( ruleList && !ruleList.length ) {
      this.isChecked = false
    }
    for ( let i = -1, l = ruleList.length; i < l; ++i ) {
      let rule = ruleList[ i ],
        nextRule = ruleList[ i + 1 ]
      if ( !nextRule ) {
        continue
      }
      if ( !( +nextRule.discount ) || !( +nextRule.condition ) ) {
        this.isChecked = false
      }
      delete nextRule.err
      if ( subType !== 2 ) {

        if ( !nextRule.discount || +nextRule.discount <= 10 ) {
          delete nextRule.err
        } else {
          nextRule.err = '此层级设置的折扣不能大于10'
          this.isChecked = false
          break
        }
        if ( i == -1 ) continue;
        if ( +rule.condition >= +nextRule.condition ) {
          nextRule.err = conErr
          this.isChecked = false
        } else if ( +nextRule.discount >= 10 || +rule.discount <= +nextRule.discount ) {
          nextRule.err = '此层级设置的折扣不能高于上一层级且不能大于10'
          this.isChecked = false
          break
        }
      } else {
        if ( +nextRule.condition <= +nextRule.discount ) {
          nextRule.err = '赠送件数不能高于购买件数'
          this.isChecked = false
          break
        }
        if ( i == -1 ) continue;
        if ( +rule.condition >= +nextRule.condition ) {
          nextRule.err = conErr
          this.isChecked = false
          break
        } else if ( !nextRule.discount || +rule.discount >= +nextRule.discount ) {
          nextRule.err = '此层级设置的赠送件数不能低于上一层级'
          this.isChecked = false
          break
        }
      }
    }
    // this.ruleInfo.splice()
  }
  fixed ( item ) {
    let v = +item.discount || 0
    if ( this.subType != 2 ) {
      this.$set( item, 'discount', v.toFixed( 1 ) )
    } else {
      this.$set( item, 'discount', v.toFixed( 0 ) )
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

