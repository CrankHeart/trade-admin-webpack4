<template>
  <div class="user-portrait-info">
    <slot></slot>
    <el-form label-width="130px">

      <el-form-item label="交易首单开发：">
        <el-input v-model="item.firstTradeDeveloper" size="small" v-if="isEdit"></el-input>
        <template v-else>
          {{item.firstTradeDeveloper}}
        </template>
      </el-form-item>
      <el-form-item label="当前耗材负责人：">
        <consumables-person-search v-if="isEdit || isConsumablesPersonEdit" v-model="item.consumablesPerson" size="small"></consumables-person-search>
        <template v-else>
          {{consumablesPersonAndEmail}}
        </template>
      </el-form-item>
      <el-form-item label="客服运营负责人：">
        <el-input v-model="item.custResponsiblePerson" size="small" v-if="isEdit"></el-input>
        <template v-else>
          {{item.custResponsiblePerson}}
        </template>
      </el-form-item>
      <el-form-item label="用户分类：">
        <el-select v-model="item.userType" size="small" v-if="isEdit">
          <el-option v-for="opt in option.userTypes" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
        </el-select>
        <template v-else>
          {{convertData(item.userType,'userType')}}
        </template>
      </el-form-item>
      <el-form-item label="会员等级：">
        <el-select v-model="item.memberLevel" size="small" v-if="isEdit">
          <el-option v-for="opt in option.memberLevels" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
        </el-select>
        <template v-else>
          {{convertData(item.memberLevel,'memberLevel')}}
        </template>
      </el-form-item>
      <el-form-item>
        <p>会员品牌等级：
          <span @click="brandMemberLevelVisible=true"> 详情 </span>
        </p>
      </el-form-item>
      <!-- <el-form-item label="结算类型：">
        <el-row v-if="isEdit">
          <el-col :span="8">
            <el-switch v-model="enabled"></el-switch>
          </el-col>
          <el-col :span="16">
            <el-select v-model="item.settlementMethod" size="small" v-if="enabled">
              <el-option v-for="opt in option.settlementMethods" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
            </el-select>
          </el-col>
        </el-row>
        <template v-else>
          {{item.enabled?'月结':'普通'}}用户
          <span v-if="item.enabled">
            | {{convertData(item.settlementMethod,'settlementMethod')}}
          </span>
        </template>
      </el-form-item> -->
      <el-form-item label="信用等级：">
        <el-select v-model="item.creditLevel" size="small" v-if="isEdit">
          <el-option v-for="opt in option.creditLevels" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
        </el-select>
        <template v-else>
          {{convertData(item.creditLevel,'creditLevel')}}
        </template>
      </el-form-item>
      <el-form-item label="货币精确度：">
        <el-select v-model="item.roundingType" size="small" v-if="isEdit ">
          <el-option v-for="opt in option.roundingTypes" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
        </el-select>
        <template v-else>
          {{convertData(item.roundingType,'roundingType')}}
        </template>
      </el-form-item>
      <el-form-item label="出库单价格：">
        <el-select v-model="item.isPrintPrice" size="small" v-if="isEdit">
          <el-option v-for="opt in option.isPrintPrice" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
        </el-select>
        <template v-else>
          {{convertData(item.isPrintPrice,'isPrintPrice')}}
        </template>
      </el-form-item>
      <el-form-item label="采购频率：">
        <el-select v-model="item.purchasingFrequency" size="small" v-if="isEdit">
          <el-option v-for="opt in option.purchasingFrequencys" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
        </el-select>
        <template v-else>
          {{convertData(item.purchasingFrequency,'purchasingFrequency')}}
        </template>
      </el-form-item>
      <el-form-item label="标签：">
        <el-input v-model="item.label" size="small" v-if="isEdit" />
        <template v-else>
          {{item.label}}
        </template>
      </el-form-item>

    </el-form>
    <brand-member-level :user-info="UserInfo" v-if="brandMemberLevelVisible" v-model="brandMemberLevelVisible" :is-edit="isEdit"></brand-member-level>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import portraitMixins from './portraitMixins'
import API from '../../../API'
import brandMemberLevel from './brandMemberLevel.vue'
import { Getter } from 'vuex-class'
import { debounce } from '../../../utils'
import consumablesPersonSearch from '../../../components/consumablesPersonSearch.vue'
import {
  userTypes,
  memberLevels,
  creditLevels,
  orderTypes,
  roundingTypes,
  // settlementMethods,
  isPrintPrice,
  purchasingFrequencys
} from '../const/'
@Component( {
  name: 'UserPortraitDetailInfo',
  mixins: [ portraitMixins ],
  components: {
    brandMemberLevel,
    consumablesPersonSearch
  }
} )
export default class UserPortraitDetailInfo extends Vue {
  @Prop()
  isConsumablesPersonEdit: boolean
  @Prop()
  isEdit: boolean

  @Prop( { default: () => ( {} ) } )
  item: any

  get consumablesPersonAndEmail () {
    let { consumablesPerson, email } = this.item
    if ( consumablesPerson && email ) {
      return consumablesPerson + ':' + email
    } else if ( consumablesPerson ) {
      return consumablesPerson
    } else {
      return email
    }
  }
  get UserInfo () {
    return this.$route.query
  }
  get enabled () {
    return !!this.item.enabled
  }
  set enabled ( v ) {
    this.item.enabled = +v
  }

  brandMemberLevelVisible: boolean = false


}
</script>
<style lang="stylus" >
.user-portrait-info
  >.el-button-group
    position relative
    top -40px
  form
    position absolute
    left 0
    top 0
    width 100%
  .el-form-item__content
    color #999
  position relative
  .el-form-item
    margin-bottom 0
    padding 2px 0
    + .el-form-item
      border-top 1px solid #efefef
  .el-select
    width 100%
  .el-button-group
    float right
  p
    span
      text-decoration underline
      cursor pointer
</style>
