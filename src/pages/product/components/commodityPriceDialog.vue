<template>
  <el-dialog
    :before-close="close"
    id="commodity-price"
    title="编辑商品价格"
    :visible.sync="isShowDialog"
    size="tiny"
  >
    <el-form
      :model="productSkuDetail"
      label-position="left"
      :rules="rules"
      ref="productSkuDetail"
      label-width="100px"
    >
      <template>
        <h3 class="sub-title">成本信息</h3>
        <el-form-item class="form-item" label="厂家成本价" prop="factorySettlePrice">
          <el-input
            :disabled="linkagePriceDisabled || disabledCondition"
            @change="factorySettlePriceChange"
            v-model.number="productSkuDetail.factorySettlePrice"
            style="width: 150px"
          ></el-input>
        </el-form-item>
        <el-form-item class="form-item" label-width="0">
          <span>采购进价：{{productSkuDetail.purchasePrice | fixed2}}</span>&nbsp;
          <span>库内成本价：{{productSkuDetail.settlePrice | fixed2}}</span>&nbsp;
          <span>综合成本价：{{productSkuDetail.bottomPrice | fixed2}}</span>
        </el-form-item>
      </template>
      <div style="height: 1px; background-color: #eee;margin-bottom: 20px"></div>
      <template>
        <h3 class="sub-title">标价设置</h3>
        <el-row>
          <el-col :span="12">
            <el-form-item class="form-item" label="市场价" prop="salesPrice">
              <el-input
                :disabled="disabledCondition"
                v-model.number="productSkuDetail.salesPrice"
                style="width: 150px"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="form-item" label="地推限价" prop="groundPrice">
              <el-input
                :disabled="disabledCondition"
                v-model.number="productSkuDetail.groundPrice"
                style="width: 150px"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item class="form-item" label="厂家限价" prop="factoryLimitedPrice">
              <el-input
                :disabled="disabledCondition"
                v-model.number="productSkuDetail.factoryLimitedPrice"
                style="width: 150px"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="form-item" label="厂家指导价" prop="factorySalesPrice">
              <el-input
                :disabled="disabledCondition"
                v-model.number="productSkuDetail.factorySalesPrice"
                style="width: 150px"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="13">
            <el-form-item class="form-item" label="定价类型" prop="pricingType">
              <el-radio-group :disabled="disabledCondition" v-model="productSkuDetail.pricingType">
                <el-radio
                  v-for="item in PricingTypes"
                  :key="item.name"
                  :label="item.id"
                >{{item.name}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item class="form-item" label-width="0">
              <span v-if="profitFactorRange">利润因子必须在{{profitFactorRange}}范围内</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item class="form-item" label="利润因子" prop="profitFactor">
              <el-input
                :disabled="linkagePriceDisabled || disabledCondition"
                v-model.number="compuProfitFactor"
                style="width: 150px"
              >
                <span slot="append">%</span>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="form-item" label="商家限价" prop="platformPrice">
              <el-input
                :disabled="linkagePriceDisabled || disabledCondition"
                v-model.number="compuPlatformPrice"
                style="width: 150px"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div style="height: 1px; background-color: #eee;margin-bottom: 20px"></div>
        <template>
          <h3 class="sub-title">
            会员价设置&nbsp;&nbsp;
            <span
              class="title-tip"
            >会员价必须在（ {{minRangePrice}} ~ {{productSkuDetail.salesPrice}}）范围内，且A价 >= B价 >= C价</span>
          </h3>
          <el-form-item class="form-item" label="A价" prop="level0Price">
            <el-input
              :disabled="disabledCondition"
              v-model.number="productSkuDetail.level0Price"
              style="width: 150px"
            ></el-input>
          </el-form-item>
          <el-form-item class="form-item" label="B价" prop="level1Price">
            <el-input
              :disabled="disabledCondition"
              v-model.number="productSkuDetail.level1Price"
              style="width: 150px"
            ></el-input>
          </el-form-item>
          <el-form-item class="form-item" label="C价" prop="level2Price">
            <el-input
              :disabled="disabledCondition"
              v-model.number="productSkuDetail.level2Price"
              style="width: 150px"
            ></el-input>
          </el-form-item>
        </template>
      </template>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel('productSkuDetail')">取 消</el-button>
      <el-button
        :disabled="disabledCondition"
        type="primary"
        @click="submitForm('productSkuDetail')"
      >确 定</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Model, Prop } from "vue-property-decorator"
import API from "../../../API"
import { isVirtuals, PricingTypes } from '../const'

@Component( {
  name: "commodity-price",
  components: {
  }
} )
export default class CommodityPrice extends Vue {
  @Prop( { type: Boolean, default: false } ) value
  @Prop( { type: Object, default: () => ( {} ) } ) data: any
  isShowDialog = this.value
  PricingTypes = PricingTypes
  productSkuDetail: any = {
    factorySettlePrice: null,
    salesPrice: null,
    groundPrice: null,
    factoryLimitedPrice: null,
    factorySalesPrice: null,
    pricingType: null,
    profitFactor: null,
    platformPrice: null,
    level0Price: null,
    level1Price: null,
    level2Price: null,
    id: null,
    settlePrice: null,
    purchasePrice: null,
    storeId: null,
    bottomPrice: null,
    skuType: null,
    isVirtual: null
  }
  productPricingStrategy: any = {}

  // * 保留到两位小数
  factorReg = /(^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$)/
  // * 保留到大于等于0的两位小数
  priceReg = /(^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$)/
  rules = {
    factorySettlePrice: [
      { required: true, type: 'number', message: '请输入厂家成本价', trigger: 'blur' },
      { pattern: this.priceReg, message: '请输入大于零的两位小数以内的数字', trigger: 'change' }
    ],
    salesPrice: [
      { required: true, type: 'number', message: '请输入市场价', trigger: 'blur' },
      { pattern: this.priceReg, message: '请输入大于零的两位小数以内的数字', trigger: 'change' }
    ],
    groundPrice: [
      { validator: this.notRequiredItemValidate( '地推限价不合法' ), type: 'number', trigger: 'change' }
    ],
    factoryLimitedPrice: [
      { validator: this.notRequiredItemValidate( '厂家限价不合法' ), type: 'number', trigger: 'change' }
    ],
    factorySalesPrice: [
      { validator: this.notRequiredItemValidate( '厂家指导价不合法' ), type: 'number', trigger: 'change' }
    ],
    pricingType: [
      { required: true, message: '请选择定价类型', type: 'number', trigger: 'change' }
    ],
    profitFactor: [
      { required: true, type: 'number', message: '请输入利润因子', trigger: 'blur' },
      { pattern: this.factorReg, message: '请输入两位小数以内的正负整数或0', trigger: 'change' }
    ],
    platformPrice: [
      { required: true, type: 'number', message: '请输入商家限价', trigger: 'blur' },
      { pattern: this.priceReg, message: '请输入大于零的两位小数以内的数字', trigger: 'change' }
    ],
    level0Price: [
      { required: true, type: 'number', message: '请输入A价', trigger: 'blur' },
      { pattern: this.priceReg, message: '请输入大于零的两位小数以内的数字', trigger: 'change' }
    ],
    level1Price: [
      { required: true, type: 'number', message: '请输入B价', trigger: 'blur' },
      { pattern: this.priceReg, message: '请输入大于零的两位小数以内的数字', trigger: 'change' }
    ],
    level2Price: [
      { required: true, type: 'number', message: '请输入C价', trigger: 'blur' },
      { pattern: this.priceReg, message: '请输入大于零的两位小数以内的数字', trigger: 'change' }
    ],
  }

  notRequiredItemValidate ( message ) {
    return ( rule, value, callback ) => {
      if ( value != '' ) {
        if ( !this.priceReg.test( value ) ) {
          return callback( `${message}` )
        } else {
          return callback()
        }
      } else {
        return callback()
      }
    }
  }

  // * 虚拟商品的情况下厂家成本价、商家限价和利润因子直接置灰
  get linkagePriceDisabled () {
    return this.productSkuDetail.isVirtual === 2 ? true : false
  }

  // * 领健自营下的虚拟商品的sku类型为大包装或套装的类型下全部disbaled
  get disabledCondition () {
    const { storeId, skuType, isVirtual } = this.productSkuDetail
    console.log( storeId === 5, ( [ 1, 2 ] as any ).includes( skuType ), skuType )
    return storeId === 5 && ( [ 1, 2 ] as any ).includes( skuType ) ? true : false
  }
  get minRangePrice () {
    const {
      platformPrice = 0,
      factoryLimitedPrice = 0
    } = this.productSkuDetail
    return Math.max( platformPrice, factoryLimitedPrice )
  }
  // * 保护价格
  // * 如果 MAX(库内成本价，采购进价) < 厂家成本价 / 2，则 商家限价 = 厂家成本价*（履约成本占比+利润因子+1）
  get protectPrice () {
    const {
      settlePrice = 0,
      purchasePrice = 0
    } = this.productSkuDetail
    return Math.max( settlePrice, purchasePrice )
  }
  get profitFactorRange () {
    const {
      profit1Upper,
      profit2Lower,
      profit2Upper,
      profit3Lower
    } = this.productPricingStrategy
    switch ( +this.productSkuDetail.pricingType ) {
      case 1:
        return `（-， ${profit1Upper}%）`
      case 2:
        return `[${profit2Lower}%，${profit2Upper}%）`
      case 3:
        return `[${profit3Lower}%，-）`
      default:
        return null
    }
  }

  get compuPlatformPrice () {
    const { profitFactor, factorySettlePrice } = this.productSkuDetail
    const { costProportion = 0 } = this.productPricingStrategy
    const updateStatus = ( CommodityPrice as any ).updateStatus
    // TODO 修改厂家成本价或利润因子，计算商家限价(不是第一次进入，和利润因子和厂家限价都不能为空才会计算)
    if ( !updateStatus.isFirstComing && ( updateStatus.updateFactorySettlePrice || updateStatus.updateProfitFactor ) && profitFactor !== '' && factorySettlePrice !== '' ) {
      console.log( '计算商家限价' )
      // * 商家限价 = MAX(库内成本价，采购进价) *（履约成本占比+利润因子+1）
      // * protectPrice < 厂家成本价 / 2， 商家限价 = 厂家成本价*（履约成本占比+利润因子+1）
      if ( this.protectPrice < factorySettlePrice / 2 ) {
        this.productSkuDetail.platformPrice =
          +( factorySettlePrice * ( ( costProportion + profitFactor ) / 100 + 1 ) ).toFixed( 2 )
      } else {
        this.productSkuDetail.platformPrice =
          +( this.protectPrice * ( ( costProportion + profitFactor ) / 100 + 1 ) ).toFixed( 2 )
      }
    }
    return this.productSkuDetail.platformPrice
  }
  set compuPlatformPrice ( val ) {
    console.log( '修改商家限价' )
    const updateStatus = ( CommodityPrice as any ).updateStatus
    updateStatus.isFirstComing = false
    updateStatus.updateProfitFactor = false
    updateStatus.updateFactorySettlePrice = false
    updateStatus.updatePlatformPrice = true
    this.productSkuDetail.platformPrice = val
  }
  // TODO 修改商家限价，计算利润因子，厂家成本价保持不变
  get compuProfitFactor () {
    const { platformPrice, factorySettlePrice = 0 } = this.productSkuDetail
    const { costProportion = 0 } = this.productPricingStrategy
    const updateStatus = ( CommodityPrice as any ).updateStatus
    if ( !updateStatus.isFirstComing && updateStatus.updatePlatformPrice && platformPrice !== '' ) {
      console.log( '计算利润因子' )
      // 商家限价， 厂家成本价
      // * protectPrice < 厂家成本价 / 2，利润因子 = 厂家成本价/商家限价 - 履约成本占比 - 1
      // * 利润因子 = MAX(库内成本价，采购进价)/商家限价 - 履约成本占比 - 1
      if ( this.protectPrice < factorySettlePrice / 2 ) {
        this.productSkuDetail.profitFactor =
          +( ( platformPrice / factorySettlePrice - costProportion / 100 - 1 ) * 100 ).toFixed( 2 )
      } else {
        // var a = ( ( platformPrice / this.protectPrice - costProportion / 100 - 1 ) * 100 )
        // console.log(Math.floor(a*100)/100)
        this.productSkuDetail.profitFactor =
          +( ( platformPrice / this.protectPrice - costProportion / 100 - 1 ) * 100 ).toFixed( 2 )
      }
    }
    return this.productSkuDetail.profitFactor
  }
  set compuProfitFactor ( val ) {
    console.log( '修改利润因子' )
    const updateStatus = ( CommodityPrice as any ).updateStatus
    updateStatus.isFirstComing = false
    // * 修改利润因子
    updateStatus.updateProfitFactor = true
    updateStatus.updateFactorySettlePrice = false
    updateStatus.updatePlatformPrice = false
    this.productSkuDetail.profitFactor = val
  }
  created () {
    ( CommodityPrice as any ).updateStatus = {
      isFirstComing: true,
      updateProfitFactor: false,
      updateFactorySettlePrice: false,
      updatePlatformPrice: false,
    }
  }
  mounted () {
    this.getPriceData()
  }
  handle2Number ( { target } ) {
    target.value = target.value.replace( /[^\d.]/g, '' )
  }
  factorySettlePriceChange ( value: string | number ) {
    console.log( '修改厂家成本价' )
    const updateStatus = ( CommodityPrice as any ).updateStatus
    updateStatus.isFirstComing = false
    updateStatus.updateProfitFactor = false
    updateStatus.updateFactorySettlePrice = true
    updateStatus.updatePlatformPrice = false
  }
  close ( done?) {
    this.isShowDialog = false
    this.$emit( 'input', this.isShowDialog )
    done && done()
  }
  submitForm ( formName ) {
    ( this.$refs[ formName ] as any ).validate( ( valid ) => {
      if ( valid ) {
        console.log( this.productSkuDetail )
        this.$http( API.updateProductSkuInfo, this.productSkuDetail ).then( ( { data } ) => {
          this.$notify( {
            message: data.msg || '保存成功',
            type: 'success'
          } )
          this.$emit( 'update-table-list' )
          this.close()
        } ).catch( err => {
          this.$notify( {
            message: err.data.msg || '保存失败',
            type: 'error'
          } )
        } )
      } else {
        this.$notify( {
          message: '保存失败',
          type: 'error'
        } )
        return false;
      }
    } );
  }
  cancel ( formName ) {
    ( this.$refs[ formName ] as any ).resetFields();
    this.close()
  }
  mergeProductSkuDetail ( data1, data2 ) {
    let obj = {}
    Object.keys( data1 ).forEach( item => {
      if ( data2.hasOwnProperty( item ) ) {
        obj[ item ] = data2[ item ]
      }
    } )
    return {
      ...data1,
      ...obj
    }
  }
  getPriceData () {
    this.$http( API.getProductSkuDetail4Console, { id: this.data.id } ).then( ( { data } ) => {
      this.productSkuDetail = this.mergeProductSkuDetail( this.productSkuDetail, data.productSkuDetail )
      this.productPricingStrategy = data.productPricingStrategy
    } ).catch( err => {
      this.$notify( {
        message: err.data.msg || '获取详情失败',
        type: 'error'
      } )
    } )
  }
}
</script>
<style lang="stylus">
#commodity-price
  .el-dialog
    min-width 575px
</style>
<style lang="stylus" scope>
#commodity-price
  .sub-title
    margin 0 0 12px 8px
    .title-tip
      font-size 13px
      color #999999
      font-weight normal
  .form-item
    margin-bottom 16px
</style>

