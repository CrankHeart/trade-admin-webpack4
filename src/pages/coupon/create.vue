
<script lang="ts">
import Vue from "vue"
import { Component, Inject, Watch } from "vue-property-decorator"
import { State } from "vuex-class"
import API from "../../API/"
import { Page } from '../../typing/index'
import { isPositiveNum } from "../../utils/"
import lcTitle from "../../components/title.vue"
import tenantSearch from "../../components/tenantSearch/index.vue"
import lcTable from "../../components/table/"
import couponUserLimit from './components/userLimit.vue'
import skuSelector from '../promotion/components/createSkuPicker.vue'
let lcSkuCodeCache = {}
@Component( {
  name: "coupon-create",
  template: require( "./template/create.html" ),
  components: {
    lcTitle,
    tenantSearch,
    lcTable,
    couponUserLimit,
    skuSelector
  }
} )
export default class CounponCreate extends Vue {
  isViewPage: boolean = false
  couponWay: number = 0
  get title (): string {
    return this.isViewPage ? "查看券码" : "创建券码"
  }
  loading: boolean = false
  form: any = {}
  config = [
    { prop: "lcSkuCode", label: "商品SKU" },
    { prop: "price", label: "优惠金额" },
    { prop: "discount", label: "数量" },
    { prop: "control", label: "" }
  ]
  activated () {
    this.reset()
  }
  get method () {
    return this.form.method
  }
  set method ( v ) {
    this.form.method = v
  }
  @Watch( "method" )
  methodWatcher ( v ) {
    if ( v ) {
      this.couponWay = 0
    }
  }
  @Watch( "form.type" )
  typeWatcher ( v ) {
    if ( v === 3 && !this.isViewPage ) {
      this.form.couponScope = null
      this.method = true
      this.couponWay = 0
      this.form.expirationType = 2
      this.form.expirationDays = ''
    }
  }
  // curChange(cur) {
  //   this.page.cur = cur
  //   this.getWriteOffList()
  // }
  curChange2 ( cur ) {
    this.page2.cur = cur
  }
  ruleInfo2AddItem = {
    lcSkuCode: "",
    price: "",
    discount: "",
    skuId: ""
  }
  get computedRuleInfo2 () {
    let num = this.page2.num
    let start = ( this.page2.cur - 1 ) * num
    return this.ruleInfo2.slice( start, start + num )
  }
  ruleInfo2AddErr: any = {
    lcSkuCode: "",
    price: "",
    discount: ""
  }
  validateLcSkuCode () {
    let rule: any = this.ruleInfo2AddItem
    let ruleInfo2AddErr = this.ruleInfo2AddErr
    if ( !rule.lcSkuCode ) {
      return ( ruleInfo2AddErr.lcSkuCode = "" )
    }
    let ruleInfo2 = this.ruleInfo2
    if (
      rule.index == ruleInfo2.length &&
      ruleInfo2.filter( v => v.lcSkuCode == rule.lcSkuCode ).length >= 1
    ) {
      return ( ruleInfo2AddErr.lcSkuCode = "特价商品SKU不能重复" )
    }
    if ( lcSkuCodeCache.hasOwnProperty( rule.lcSkuCode ) ) {
      if ( !lcSkuCodeCache[ rule.lcSkuCode ] ) {
        return ( ruleInfo2AddErr.lcSkuCode = "特价商品SKU验证错误" )
      }
      rule.skuId = lcSkuCodeCache[ rule.lcSkuCode ]
    }

    this.$http( API.getSkuByLcSkuCode, {
      lcSkuCode: rule.lcSkuCode
    } ).then(
      ( { data } ) => {
        let sku = data.skuList[ 0 ]
        rule.skuId = sku.id

        lcSkuCodeCache[ rule.lcSkuCode ] = sku.id
        ruleInfo2AddErr.lcSkuCode = ""
      },
      rej => {
        ruleInfo2AddErr.lcSkuCode = "特价商品SKU验证错误"
      }
    )
    ruleInfo2AddErr.lcSkuCode = ""
  }
  validateTime ( rule, value, cb ) {
    if ( !value || !value[ 0 ] ) {
      cb( new Error( "请输入券码有效期" ) )
    }
  }
  validateDiscount ( rule, value, cb ) {
    let discount = this[ `ruleInfo${this.form.type}` ][ 0 ].discount
    // let { upper, floor } = this.form.amountInterval
    if ( this.form.couponScope !== 2 && !isPositiveNum( +discount ) ) {
      return cb( new Error( "最大抵扣金额必须为正整数" ) )
    } else if ( this.form.couponScope == 2 && !/^\d+$/.test( discount ) ) {
      return cb( new Error( "最大抵扣金额必须为大于0的整数" ) )
    }

    // if ( discount >= +floor ) {
    //   return cb( new Error( "最大抵扣金额必须小于范围区间下限值" ) )
    // }
  }
  validateRate ( rule, value, cb ) {
    let rate = +this.ruleInfo1[ 0 ].discount
    if ( rate <= 0 || rate >= 10 ) {
      cb( new Error( "最大抵扣金额必须为正整数且小于10" ) )
    }
  }
  validateAmount ( rule, value, cb ) {
    let { upper, floor } = value
    if (
      ( +upper && !isPositiveNum( +upper ) ) ||
      ( +floor < 0 )
    ) {
      return cb( new Error( "区间值必须为正整数" ) )
    }
    if ( !floor ) {
      return cb( new Error( "范围区间下限值必须设定" ) )
    }
    if ( +upper && +upper <= +floor ) {
      return cb( new Error( "区间值填写错误" ) )
    }
  }
  validateCount () {
    let rule = this.ruleInfo2AddItem
    let ruleInfo2AddErr = this.ruleInfo2AddErr
    if ( !rule.discount ) {
      return ( ruleInfo2AddErr.discount = "特价商品数量不能为空" )
    }
    if ( !isPositiveNum( rule.discount ) ) {
      return ( ruleInfo2AddErr.discount = "特价商品数量必须为正整数" )
    }
    ruleInfo2AddErr.discount = ""
  }
  validatePrice () {
    let rule = this.ruleInfo2AddItem
    let ruleInfo2AddErr = this.ruleInfo2AddErr
    let { upper, floor } = this.form.amountInterval
    if ( !rule.price ) {
      return ( ruleInfo2AddErr.price = "特价商品价格不能为空" )
    }
    if ( +rule.price <= 0 ) {
      return ( ruleInfo2AddErr.price = "特价商品价格必须有效" )
    }
    ruleInfo2AddErr.price = ""
  }
  rules: any = {
    activityName: [
      { required: true, message: "请输入券码名称", trigger: "blur,submit" },
      { max: 58, message: "券码名称在58个字节以内", trigger: "blur,submit" }
    ],
    activityRemark: [
      { required: true, message: "请输入券码说明", trigger: "blur,submit" },
      { max: 240, message: "券码名称在240个字节以内", trigger: "blur,submit" }
    ],
    time: [ { validator: this.validateTime, trigger: "blur,submit" } ],
    amountInterval: [ { validator: this.validateAmount, trigger: "blur,submit" } ]
  }
  otherRules: any = {
    discount: { validator: this.validateDiscount, trigger: "blur,submit" },
    rate: { validator: this.validateRate, trigger: "blur,submit" },
    expirationDays: { pattern: /^\d+$/, message: "请输入正整数", trigger: "blur,submit" }
  }
  ruleInfo0: any = []
  ruleInfo1: any = []
  ruleInfo2: any = []
  ruleInfo3: any = []
  pickerOptions = {
    disabledDate ( time ) {
      return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
    }
  }
  initForm () {
    return {
      activityName: "",
      activityRemark: "",
      beginTime: "",
      endTime: "",
      time: [],
      useTimesLimit: 1, // 每个诊所使用次数限制
      couponTotals: "",
      type: 0, // 0:满减券,1:满折券,2:特价券,3:代金券
      couponScope: 1,
      brandProducts: [],
      command: "",
      method: !1,
      createBy: this.$store.state.login.userName, // 制券人
      amountInterval: {
        upper: "",
        floor: ""
      },
      limitUser: [],
      expirationType: 2,
      expirationDays: ''
    }
  }

  reset () {
    this.$set( this, "form", this.initForm() )
    this.$set( this, "ruleInfo0", [ { discount: "" } ] )
    this.$set( this, "ruleInfo1", [ { discount: "" } ] )
    this.$set( this, "ruleInfo2", [] )
    this.$set( this, "ruleInfo3", [ { discount: '' } ] )
  }
  goodsErrorMsg: string = ''
  get brandProducts () {
    return this.form.brandProducts
  }
  @Watch( 'brandProducts' )
  brandProductsWatcher ( v ) {
    console.log( 'when we can get storeId from api getProductBy,then we can validate the unique store' )
  }
  @Inject() formatMyDate
  formatTime ( writeOffTime ) {
    return ( writeOffTime && this.formatMyDate( new Date( writeOffTime.time ) ) ) || "无效的时间"
  }
  stopMouseWheelChang () {
    return false
  }
  amountBlur () {
    let amountRef: any = this.$refs[ "amount-ref" ]
    amountRef.$parent.$parent.validate( "", err => { } )
  }

  page = {}
  curChange ( cur ) { }
  sizeChange ( size ) { }
  page2: Page = {
    cur: 1,
    num: 10,
    total: 0
  }
  // writeOffList: any = []
  // getWriteOffList() {
  //   let num = this.page.num
  //   let start = (this.page.cur - 1) * num
  //   this.$http(API.getCouponsByActivityId, {
  //     activityId: this.$route.params.id,
  //     start,
  //     num
  //   }).then(({ data }) => {
  //     this.page.total = data.data.total
  //     this.writeOffList = data.data.couponList
  //   })
  // }
  ruleInfo2Add () {
    this.validateLcSkuCode()
    this.validateCount()
    this.validatePrice()
    let bo = true
    Object.keys( this.ruleInfo2AddErr ).forEach( k => {
      bo = bo && this.ruleInfo2AddErr[ k ] === ""
    } )
    if ( !bo ) {
      return
    }
    let item: any = this.ruleInfo2AddItem

    let ruleInfo2 = this.ruleInfo2
    let l = ruleInfo2.length
    if ( item.isEdit && l > 0 ) {
      for ( let i = 0; i < l; i++ ) {
        let rule = ruleInfo2[ i ]
        if ( item.skuId == rule.skuId ) {
          ruleInfo2.splice( i, 1, item )
          break
        }
      }
    } else {
      ruleInfo2.push( {
        ...item,
        isEdit: true
      } )
    }

    this.page2.total = ruleInfo2.length

    this.ruleInfo2AddItem = {
      lcSkuCode: "",
      price: "",
      discount: "",
      skuId: ""
    }
  }
  ruleInfo2Del ( item ) {
    let i = this.ruleInfo2.indexOf( item )
    this.ruleInfo2.splice( i, 1 )
    this.page2.total = this.ruleInfo2.length
  }
  ruleInfo2Edit ( item ) {
    let index = this.ruleInfo2.indexOf( item )
    this.ruleInfo2AddItem = { ...item }
    this.validateLcSkuCode()
  }
  userToggle ( item ) {
    let { customerId, checked } = item
    if ( !customerId ) return
    if ( checked ) {
      this.limitUserAdd( item )
    } else {
      this.limitUserDel( item )
    }
  }
  get limitUser () {
    return this.form.limitUser
  }
  limitUserAdd ( item ) {
    if ( !item.customerId ) return
    let limitUser = this.form.limitUser.filter( v => v.customerId !== item.customerId )
    this.form.limitUser = limitUser.concat( item )
  }
  limitUserDel ( item ) {
    let limitUser = this.form.limitUser
    item.checked = false
    this.form.limitUser = this.form.limitUser.filter( v => v.customerId !== item.customerId )
  }

  exportExcel () {
    this.$submit( API.exportCoupons, {
      activityId: this.$route.params.id,
      type: "0"
    } )
  }
  validate () {
    let valid = true
    let myForm: any = this.$refs[ "my-form" ]
    myForm.fields.forEach( ( field, index ) => {
      field.validate( "", errors => {
        if ( errors ) {
          valid = false
        }
      } )
    } )
    if ( !valid ) return

    // if ( !this.form.limitUser.length && !this.form.method ) {
    //   return this.$notify( {
    //     type: 'error',
    //     message: '发放者不能为空！'
    //   } )
    // }
    // if (!this.type2ValidateRuleInfo) {
    //   console.log('商品sku验证存在问题')
    //   return
    // }
    this.submit()
  }

  decodeProduct ( brandProducts ) {
    let products = []
    brandProducts.forEach( value => {
      let { id, spu, type, name } = value
      let brandId = id
      if ( !type ) {
        products.push( { brandId, type: 'brand', name } )
      } else {
        spu.forEach( val => {
          let { id, type, sku, name } = val
          let productId = id
          if ( !type ) {
            products.push( { productId, brandId, type: 'spu', name } )
          } else {
            sku.forEach( ( { id, name } ) => {
              products.push( { productId, brandId, id, name } )
            } )
          }
        } )
      }
    } )
    return products
  }
  encodeProduct ( brandProducts ) {
    let products = {}
    brandProducts.forEach( val => {
      let { id, productId, brandId, name } = val
      if ( brandId ) {
        products[ brandId ] = products[ brandId ] || { name }
      }
      if ( productId ) {
        products[ brandId ][ productId ] = products[ brandId ][ productId ] || { name }
      }
      if ( id ) {
        products[ brandId ][ productId ][ id ] = val
      }
    } )

    return Object.keys( products ).reduce( ( total, next ) => {
      let o: any = {}
      o.id = next
      let brandData = products[ next ]
      o.type = +!!( Object.keys( brandData ).length - 1 )

      if ( o.type ) {
        o.spu = Object.keys( brandData ).filter( v => v !== 'name' ).map( val => {
          let spuData = brandData[ val ]
          let spu: any = {}
          spu.id = val
          spu.type = +!!( Object.keys( spuData ).length - 1 )

          if ( spu.type ) {
            spu.sku = Object.keys( spuData ).filter( v => v !== 'name' ).map( v => ( {
              id: spuData[ v ].id,
              name: spuData[ v ].specification
            } ) )
          } else {
            spu.name = spuData.name
          }
          return spu
        } )
      } else {
        o.name = brandData.name
      }
      total.push( o )
      return total
    }, [] )
  }
  submit () {
    this.loading = true
    let {
      activityName,
      activityRemark,
      amountInterval,
      command,
      couponTotals,
      createBy,
      limitUser,
      type,
      couponScope,
      useTimesLimit,
      brandProducts,
      method,
      time,
      expirationType,
      expirationDays
    } = this.form
    let beginTime = time && time[ 0 ]
    let endTime = time && time[ 1 ]
    beginTime = beginTime && this.formatMyDate( beginTime )
    endTime = endTime && this.formatMyDate( endTime, undefined, true )
    let ruleInfo = JSON.parse( JSON.stringify( this[ "ruleInfo" + type ] ) )
    let params = {
      activityName,
      activityRemark,
      command,
      couponTotals,
      createBy,
      type,
      useTimesLimit,
      beginTime,
      endTime,
      couponWay: this.couponWay,
      expirationType,
      expirationDays,
      activityRule: {
        ruleInfo,
        type,
        amountInterval
      },
      couponScope,
      targetProductStr: JSON.stringify( this.encodeProduct( brandProducts ) ),

      limitUser: method ? undefined : JSON.stringify( limitUser.map( v => ( {
        personId: v.customerId,
        id: v.id
      } ) ) )
    }
    if ( type == 3 ) {
      params.couponScope = 3
      delete params.targetProductStr
      delete params.limitUser
    } else {
      delete params.expirationType
      delete params.expirationDays
    }
    this.$http( API.addCouponActivity, params ).then(
      ( { data } ) => {
        this.loading = false
        this.$router.push( "/coupon/list" )
      },
      rej => {
        this.loading = false
        this.$notify( {
          type: "error",
          message: rej.data.msg || "新增失败！"
        } )
      }
    )

  }
}
</script>
<style lang="stylus" >
#coupon-create
  .el-input-number
    width 170px
    vertical-align middle
  .el-card
    .el-input__icon
      display none
  .el-pagination
    display flex
    justify-content center
  .is-disabled
    *
      color #666
    &.is-checked
      .el-radio__inner
        background-color #60768c
      &+.el-radio__label
        color #666
  .special .el-form-item
    .el-form-item
      margin-bottom 22px
      .el-form-item__content
        margin-left 70px !important
  .el-input, .el-textarea
    max-width 500px
  .el-form-item__error
    display none
  .is-error
    .el-form-item__error
      display block
.error
  line-height 30px
  padding 0 12px
  margin-bottom 30px
</style>

