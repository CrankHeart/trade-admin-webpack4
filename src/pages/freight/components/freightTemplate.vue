<template>
  <div class="freight-template">
    <lc-title text="运费模板"></lc-title>

    <el-form ref="myForm" :model="freightData" :rules="freightRules" key="freight">
      <el-form-item prop="templateName" label="模板名称">
        <el-col :lg="8" :md="8" :sm="24">
          <el-input
            placeholder
            :disabled="disabled"
            v-model.trim="freightData.templateName"
            clearable
          ></el-input>
        </el-col>
      </el-form-item>

      <el-form-item prop="templateType" label="模板类型">
        <!-- <el-input placeholder="" v-model="freightData.template_type" clearable></el-input> -->
        <el-radio-group v-model="freightData.templateType">
          <el-radio
            :disabled="disabled"
            v-for="options in templateTypes"
            :key="options.id"
            :label="options.id"
          >{{options.name}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="chargeMode" label="计费方式">
        <el-radio-group v-model="freightData.chargeMode">
          <el-radio
            :disabled="disabled"
            v-for="options in costModes"
            :key="options.id"
            :label="options.id"
          >{{options.name}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="logisticCompanyId" label="快递公司">
        <el-select
          :disabled="disabled"
          clearable
          v-model="freightData.logisticCompanyId"
          placeholder="请选择"
          filterable
        >
          <el-option
            v-for="options in logisticCompanys"
            :label="options.name"
            :value="options.id"
            :key="options.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <div>
        <div class="form-label">包邮条件</div>
        <el-collapse v-model="activeNames" class="row-margin-left collapse-width">
          <el-collapse-item
            title="包邮条件"
            :name="freight.id"
            v-for="(freight,index) in freightData.freeShippingRule"
            :key="freight.id"
          >
            <template slot="title">
              <span>包邮条件{{index+1}}</span>
              <el-button
                v-if="freightData.freeShippingRule.length > 1"
                class="el-collapse-item__header"
                style="float: right; margin-right:10px;"
                type="text"
                @click="delShippingRule(index)"
              >删除</el-button>
            </template>
            <el-checkbox-group
              v-model="checkedShipping[index]"
              @change="changeCheckedShipping(index)"
            >
              <div
                class="free-shipping one-free-shipping"
                v-for="item in freeShipings"
                :key="item.label"
              >
                <el-col :span="3">
                  <el-checkbox :disabled="disabled" :label="item.label">{{item.name}}</el-checkbox>
                </el-col>
                <el-col
                  class="free-shipping"
                  :span="18"
                  :class="{hide: !checkedShipping[index].includes(item.label)}"
                >
                  <template v-if="item.label ==='freeShippingAmount'">
                    促销后及用券后金额店铺小计金额 大于等于
                    <el-form-item
                      :prop="`freeShippingRule.${index}.startAmount`"
                      :rules="amountRules"
                    >
                      <el-input
                        type="number"
                        :disabled="disabled"
                        size="small"
                        class="input-size"
                        v-model.number="freight['startAmount']"
                      ></el-input>
                    </el-form-item>且 小于等于
                    <el-form-item
                      :prop="`freeShippingRule.${index}.endAmount`"
                      :rules="amountRules"
                    >
                      <el-input
                        type="number"
                        :disabled="disabled"
                        size="small"
                        class="input-size"
                        v-model.number="freight['endAmount']"
                      ></el-input>
                    </el-form-item>元，免收运费
                  </template>
                  <template v-else-if="item.label === 'freeShippingWeight'">
                    所购店铺商品重量综合 大于等于
                    <el-form-item
                      :prop="`freeShippingRule.${index}.startWeight`"
                      :rules="weightRules"
                    >
                      <el-input
                        type="number"
                        :disabled="disabled"
                        size="small"
                        class="input-size"
                        v-model.number="freight['startWeight']"
                      ></el-input>
                    </el-form-item>且 小于等于
                    <el-form-item
                      :prop="`freeShippingRule.${index}.endWeight`"
                      :rules="weightRules"
                    >
                      <el-input
                        type="number"
                        :disabled="disabled"
                        size="small"
                        class="input-size"
                        v-model.number="freight['endWeight']"
                      ></el-input>
                    </el-form-item>KG（公斤），免收运费
                  </template>
                </el-col>
              </div>
            </el-checkbox-group>
          </el-collapse-item>
        </el-collapse>
        <el-button
          v-if="!disabled"
          class="row-margin-left"
          type="primary"
          icon="plus"
          @click="addShippingRule(freightData.freeShippingRule.length)"
        >添加</el-button>
      </div>
      <div>
        <div class="form-label">包邮地区</div>
        <el-row>
          <el-col :span="8" class="row-margin-left">
            <lc-table
              :config="baseConfig"
              :data="freeAreaDatas"
              :key="baseConfig.length"
              :hasPage="false"
            >
              <template slot-scope="scope">
                <template v-if="scope.con.prop === 'freeShippingCity'">
                  <span class="cursor">{{destinations}}</span>
                  <el-button
                    type="primary"
                    size="mini"
                    :disabled="disabled"
                    @click.prevent="isShowAddress = true"
                  >新增指定省份</el-button>
                </template>
                <template v-else>{{scope.row[scope.con.prop]}}</template>
              </template>
            </lc-table>
          </el-col>
        </el-row>
      </div>
      <div class="row-margin-left btn-position">
        <el-button v-if="!disabled" type="info" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </el-form>

    <free-ship-address v-model="isShowAddress"></free-ship-address>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { Getter, State, Mutation, Action } from 'vuex-class'
import { Notification } from 'element-ui'
import API from '../../../API'
import lcTitle from '../../../components/title.vue'
import lcTable from '../../../components/table/index'
import freeShipAddress from './freeShipAddress.vue'
import { costModes, templateTypes, freeShipings, areaBaseConfig } from '../const/index'

@Component( {
  name: 'freight-template',
  components: {
    lcTitle,
    lcTable,
    freeShipAddress
  }
} )
export default class freight extends Vue {
  @Action( 'freight/getAllLogisticCompanys' ) getAllLogisticCompanys
  @Action( 'freight/getAddressList' ) getAddressList
  @Action( 'freight/addShippingRule' ) addShippingRule
  @Action( 'freight/delShippingRule' ) delShippingRule

  @Getter( 'freight/currAddressList' ) currAddressList
  @State( state => state.freight.logisticCompanys ) logisticCompanys
  @State( state => state.freight.addressList ) addressList
  @State( state => state.freight.freightData ) freightData
  @State( state => state.freight.freeShipCondition ) freeShipCondition

  @Prop( { type: Boolean, default: () => false } ) disabled

  freeShipings = freeShipings
  templateTypes = templateTypes
  costModes = costModes
  baseConfig = areaBaseConfig
  checkedShipping: Array<string> = []
  validateShipping: Array<boolean> = []
  isShowAddress = false

  page = {
    cur: 1,
    total: 0,
    num: 10
  }

  get activeNames () {
    return this.freightData.freeShippingRule.map( v => v.id )
  }

  set activeNames ( v ) { }

  freightRules = {
    'templateName': { required: true, message: '请输入模板名称', trigger: 'blur' },
  }

  amountRules = [
    { validator: this.validateAmount, trigger: 'blur' }
  ]

  weightRules = [
    { validator: this.validateWeight, trigger: 'blur' }
  ]

  validateWeight ( rule, value, callback ) {
    let reg = /^[\d]+(\.\d+)?$/
    const index = +rule.fullField.split( '.' )[ 1 ]
    const startWeight = this.freightData.freeShippingRule[ index ].startWeight
    const endWeight = this.freightData.freeShippingRule[ index ].endWeight

    if ( this.checkedShipping[ index ].indexOf( 'freeShippingWeight' ) > -1 ) {
      if ( value === '' ) {
        callback( new Error( '重量不可为空' ) )
      } else if ( !reg.test( value ) ) {
        callback( new Error( '重量必须为数字值' ) )
      } else if ( endWeight !== '' && +endWeight < +startWeight ) {
        callback( new Error( '重量的最大值应该不小于最小值' ) )
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

  validateAmount ( rule, value, callback ) {
    let reg = /^[\d]+(\.\d+)?$/
    const index = +rule.fullField.split( '.' )[ 1 ]
    const startAmount = this.freightData.freeShippingRule[ index ].startAmount
    const endAmount = this.freightData.freeShippingRule[ index ].endAmount

    if ( this.checkedShipping[ index ].indexOf( 'freeShippingAmount' ) > -1 ) {
      if ( value === '' ) {
        callback( new Error( '金额不可为空' ) )
      } else if ( !reg.test( value ) ) {
        callback( new Error( '金额必须为数字值' ) )
      } else if ( endAmount !== '' && +endAmount < +startAmount ) {
        callback( new Error( '金额的最大值应该不小于最小值' ) )
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

  validateShippingAmount ( rule, value, callback, source, options ) {
    const index = +rule.fullField.split( '.' )[ 1 ]
    const startAmount = this.freightData.freeShippingRule[ index ].startAmount
    const endAmount = this.freightData.freeShippingRule[ index ].endAmount

    if ( +startAmount > +endAmount ) {
      callback( new Error( '金额的最大值应该不小于最小值' ) )
    } else {
      callback()
    }
  }

  validateShippingWeight ( rule, value, callback, source, options ) {
    const index = +rule.fullField.split( '.' )[ 1 ]
    const startWeight = this.freightData.freeShippingRule[ index ].startWeight
    const endWeight = this.freightData.freeShippingRule[ index ].endWeight
    if ( +startWeight > +endWeight ) {
      callback( new Error( '重量的最大值应该不小于最小值' ) )
    } else {
      callback()
    }
  }


  get freeAreaDatas () {
    let tmp = JSON.parse( JSON.stringify( this.freightData ) )
    let { freeShippingCity } = this.freightData
    tmp.origin = '上海'
    tmp.freeShippingCity = freeShippingCity
    return [ tmp ]
  }

  get destinations () {
    let tmp: string = ''
    let freeShippingCity = this.currAddressList || []
    freeShippingCity.forEach( v => {
      for ( let i = 0, len = this.addressList.length; i < len; i++ ) {
        if ( v === this.addressList[ i ].provinceId ) {
          tmp += this.addressList[ i ].provinceName + ','
          break;
        }
      }
    } )
    if ( tmp.length == 0 ) {
      return ''
    }
    return tmp.slice( 0, -1 )
  }

  @Watch( 'freeShipCondition', {
    immediate: true
  } )
  initCheckedShipping ( val = [] ) {
    this.checkedShipping = []
    this.validateShipping = []
    if ( val.length == 0 ) {
      val = [ this.freeShipings[ 0 ].label ]
    }
    this.checkedShipping = val
    this.validateShipping = val.map( v => false )
  }


  created () {
    this.getAllLogisticCompanys()
    this.getAddressList()
  }

  activated () {
    let formFreight: any = this.$refs[ 'myForm' ]
    formFreight.resetFields()
  }

  changeCheckedShipping ( index ) {

    let values = this.checkedShipping[ index ]
    let shippingRule = this.freightData.freeShippingRule[ index ]

    if ( !values.includes( 'freeShippingAmount' ) ) {
      shippingRule.startAmount = ''
      shippingRule.endAmount = ''
    }
    if ( !values.includes( 'freeShippingWeight' ) ) {
      shippingRule.startWeight = ''
      shippingRule.endWeight = ''
    }
  }


  save () {
    let formFreight: any = this.$refs[ 'myForm' ]
    let checkedShipping = this.checkedShipping
    formFreight.validate( ( valid ) => {
      if ( valid ) {
        if ( checkedShipping.length === 0 ) {
          this.$alert( '必选选中至少一个包邮条件', '提示' )
        } else {
          let tmpData = JSON.parse( JSON.stringify( this.freightData ) )
          checkedShipping.forEach( ( item, index ) => {
            if ( item.indexOf( 'freeShippingAmount' ) == -1 ) {
              delete tmpData.freeShippingRule[ index ][ 'startAmount' ]
              delete tmpData.freeShippingRule[ index ][ 'endAmount' ]
            }
            if ( item.indexOf( 'freeShippingWeight' ) == -1 ) {
              delete tmpData.freeShippingRule[ index ][ 'startWeight' ]
              delete tmpData.freeShippingRule[ index ][ 'endWeight' ]
            }
            delete tmpData.freeShippingRule[ index ][ 'id' ]
          } )

          this.$emit( 'save', tmpData )
        }
      }
    } )
  }
  cancel () {
    this.$router.back()
  }
}
</script>

<style lang="stylus" scoped>
.input-size
  width 100px
.row-margin-left
  margin-left 68px
  margin-bottom 20px
.collapse-width
  width 70%
.hide
  display none !important
.btn-position
  margin-top 30px
.form-label
  font-size 14px
  margin-bottom 22px
.cursor
  cursor pointer
.free-shipping
  display flex
  align-items center
  height 36px
.one-free-shipping
  margin-bottom 22px
</style>

<style lang="stylus">
.freight-template
  .free-shipping
    .el-form-item
      margin-bottom 0
    .input-size
      margin 0 5px
</style>
