<template>
  <div class="user-portrait-info">
    <slot></slot>
    <el-form label-width="130px">
      <el-form-item v-for="con in condition" :key="con.prop" :label="`${con.label}：`">
        <template v-if="isEdit">
          <!-- 编辑 -->
          <template v-if="con.type=='select'">
            <el-select class="input-select" v-model="memberBenefits[con.prop]" size="small">
              <el-option v-for="opt in con.options" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
            </el-select>
          </template>
          <template v-else-if="con.type=='radio'">
            <el-radio-group v-model="memberBenefits[con.prop]">
              <el-radio
                v-for="option in con.options"
                :key="option.id"
                :label="option.id"
              >{{option.name}}</el-radio>
            </el-radio-group>
            <a
              v-if="con.prop === 'monthlyFreightSubsidy'"
              class="href-style"
              @click="showCouponList"
            >运费券列表</a>
          </template>
          <template v-else-if="con.type=='text'">
            <el-input v-model="memberBenefits[con.prop]" size="small" :type="con.type"></el-input>
          </template>
          <template v-else-if="con.type=='html'">
            <!-- {{formatItemValue(con.prop, con.options )}} -->
            <!-- <a class="href-style" @click="brandPriceLevelVisible=true"> 品牌价格详情 </a> -->
          </template>
          <template v-if="con.contact &&con.contact.length&& !!memberBenefits[con.prop] ">
            <template v-for="(contact,index) in con.contact">
              <div :key="index">
                <span class="label">{{contact.label}}</span>
                <template v-if="contact.type == 'select'">
                  <el-select
                    class="input-select"
                    v-model="memberBenefits[contact.prop]"
                    size="small"
                  >
                    <el-option
                      v-for="opt in contact.options"
                      :key="opt.id"
                      :label="opt.name"
                      :value="opt.id"
                    ></el-option>
                  </el-select>
                </template>
                <template v-else-if="contact.type == 'switch'">
                  <!-- switchValue 自动发起对账（autoAccount） -->
                  <!-- {{memberBenefits}} -->
                  <el-tooltip
                    :content="`${Number(memberBenefits.autoAccount)?'开':'关'}`"
                    placement="right"
                  >
                    <el-switch
                      v-model="memberBenefits.autoAccount"
                      on-text="开"
                      off-text="关"
                      on-color="#13ce66"
                      off-color="#ff4949"
                      :on-value="1"
                      :off-value="0"
                      @change="handleSwitchChange"
                    ></el-switch>
                  </el-tooltip>
                </template>
                <template
                  v-else-if="contact.type == 'static'"
                >{{ formatItemContact( contact.prop, memberBenefits[contact.prop] ) }}</template>
                <template v-else>
                  <el-input class="input-text" v-model="memberBenefits[contact.prop]"></el-input>
                </template>
                {{contact.suffix}}
              </div>
            </template>
          </template>
        </template>
        <template v-else>
          <!-- 查看 -->
          <template v-if="con.type=='radio' || con.type=='select'">
            {{formatItemValue(con.prop, con.options )}}
            <a
              v-if="con.prop === 'monthlyFreightSubsidy'"
              class="href-style"
              @click="showCouponList"
            >运费券列表</a>
          </template>
          <!-- <template v-else-if="con.prop === 'memberPrices'"> -->
          <!-- {{formatItemValue(con.prop, con.options )}} -->
          <!-- <a class="href-style" @click="brandPriceLevelVisible=true"> 品牌价格详情 </a> -->
          <!-- </template> -->
          <template v-else>{{memberBenefits[con.prop]}}</template>
          <template v-if="con.contact &&con.contact.length&& !!memberBenefits[con.prop] ">
            <template v-for="(contact,index) in con.contact">
              <div :key="index">
                <span class="label">{{contact.label}}</span>
                <template
                  v-if="contact.type == 'select'"
                >{{formatItemValue(contact.prop, contact.options )}}</template>
                <template v-else-if="contact.type == 'switch'">
                  <!-- switchValue 自动发起对账（autoAccount） -->
                  {{formatSwitchValue(contact.prop, memberBenefits)}}
                </template>
                <template
                  v-else
                >{{ formatItemContact( contact.prop, memberBenefits[contact.prop] ) }}</template>
                {{contact.suffix}}
              </div>
            </template>
          </template>
        </template>
      </el-form-item>
    </el-form>
    <!-- <brand-price-level @change-level="changeMemberPrices" :user-info="userInfo" v-if="brandPriceLevelVisible" v-model="brandPriceLevelVisible" :is-edit="isEdit"></brand-price-level> -->
    <el-dialog title="运费券列表" :visible.sync="isShowCouponList">
      <lc-table :config="couponConfig" :data="couponList" :has-page="false" :max-height="500">
        <template slot-scope="scope">
          <template
            v-if="scope.con.prop == 'restrict'"
          >{{scope.row[scope.con.prop] == 1 ? '是' : '否' }}</template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
      </lc-table>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import API from '../../../API'
// import brandPriceLevel from './brandPriceLevel.vue'
import lcTable from '../../../components/table'
import { memberTypes, orderTypes, memberPrices, cashBackTypes, chainServiceTypes, monthlyServers } from '../const/'

@Component( {
  name: 'portraitDetailMember',
  components: {
    lcTable,
    // brandPriceLevel
  }
} )
export default class portraitDetailMember extends Vue {
  @Prop()
  isEdit: boolean
  @Prop()
  priceLevel: number
  condition: any[] = [
    { prop: 'memberLevel', label: '会员等级', type: 'select', options: memberTypes },
    { prop: 'memberPrices', label: '会员价格', type: 'select', options: memberPrices },
    {
      prop: 'monthlyService', label: '月结服务', type: 'radio', options: this.getItemOptions(),
      contact: [
        { prop: 'creditLine', label: '授信额度', type: 'text' },
        { prop: 'monthlyServicePeriods', label: '结算周期', type: 'static', suffix: '个月' },
        // TODO 下期迭代使用  http://jira.linkedcare.cn:8000/browse/ET-4659
        // autoAccount :是否开启对账(0：关闭，1：开启)  switchValue
        { prop: 'autoAccount', label: '自动发起对账', type: 'switch' },
      ]
    },
    // { prop: 'priceCompensate', label: '15天差价补偿', type: 'radio', options: this.getItemOptions() },
    {
      prop: 'goodsNoReason', label: '无理由退换货', type: 'radio', options: this.getItemOptions(),
      contact: [ { prop: 'goodsRestrict', label: '天数限制', type: 'text' } ]
    },
    {
      prop: 'customerService', label: '专属客服', type: 'radio', options: this.getItemOptions(),
      contact: [ { prop: 'serviceAccount', label: '客服账号', type: 'text' } ]
    },
    { prop: 'stockProtection', label: '专属库存保障', type: 'radio', options: this.getItemOptions() },
    { prop: 'shoppingProtection', label: '一站式购物保障', type: 'radio', options: this.getItemOptions() },
    { prop: 'monthlyFreightSubsidy', label: '月度运费补贴', type: 'radio', options: this.getItemOptions() },
    {
      prop: 'returnFreightSubsidy', label: '退货运费补贴', type: 'radio', options: this.getItemOptions(),
      contact: [ { prop: 'returnFreightTimes', label: '每月次数', type: 'text' } ]
    },
    {
      prop: 'cashBack', label: '年度返现政策', type: 'radio', options: this.getItemOptions(),
      contact: [ { prop: 'cashBackPoint', label: '返点', type: 'text' } ]
    },
    {
      prop: 'cashBackType', label: '返现条件', type: 'select', options: cashBackTypes,
      contact: [ { prop: 'cashBackRequire', type: 'text' } ]
    },
    {
      prop: 'chainService', label: '供应链管理服务', type: 'radio', options: this.getItemOptions(),
      contact: [ { prop: 'chainServiceType', label: '版本', type: 'select', options: chainServiceTypes } ]
    }
  ]

  autoAccount: boolean = false

  memberPrices: [ number ] = [ 0 ]

  couponList: any[] = []

  memberBenefits: any = {}

  memberBenefitsBak: any = {}

  brandPriceLevelVisible: boolean = false

  isShowCouponList: boolean = false

  couponConfig: any = [
    { prop: 'couponName', label: '券名称', width: '200px' },
    { prop: 'restrict', label: '是否面额限制', width: '190px' },
    { prop: 'denomination', label: '面额' },
    { prop: 'number', label: '数量' }
  ]

  get userInfo () {
    const { tenant_id, office_id } = this.$route.query
    return {
      tenantId: tenant_id,
      officeId: office_id
    }
  }
  @Watch( 'priceLevel', { immediate: true } )
  priceLevelWatcher ( v ) {
    this.memberBenefits.memberPrices = v
  }
  @Watch( 'isEdit' )
  watchIsEdit ( oldVal, newVal ) {
    if ( oldVal ) {
      this.editMemberBenefit()
    }
  }

  activated () {
    let { tenant_id, office_id } = this.$route.query
    this.$http( API.getMemberBenefits, {
      tenantId: tenant_id,
      officeId: office_id
    } ).then( ( { data } ) => {
      data = data.data
      data.memberBenefits.memberPrices = this.priceLevel

      let { memberBenefits } = data;
      let { autoAccount = 0 } = memberBenefits;
      autoAccount = Number( autoAccount ) || 0;
      memberBenefits.autoAccount = autoAccount

      this.memberBenefits = memberBenefits
      this.memberBenefitsBak = JSON.parse( JSON.stringify( memberBenefits ) )

      console.log( "data", { ...memberBenefits } );

    } )
  }


  handleSwitchChange ( newValue ) {
    console.log( "handleSwitchChange", newValue, typeof newValue );

  }

  // showContact( con ) {
  //   if ( con.type === 'radio' && this.memberBenefits[con.prop] == 1 ) {
  //     return true
  //   } else if ( con.type === 'select' && this.memberBenefits[ con.prop ] ) {
  //     return true
  //   } else {
  //     return false
  //   }
  // }

  getItemOptions () {
    return [ ...monthlyServers ]
  }

  formatSwitchValue ( prop, memberBenefits ) {
    //  自动发起对账（autoAccount）
    // const { autoAccount } = this.memberBenefits;
    let autoAccount = memberBenefits[ prop ]
    return Number( autoAccount ) ? "是" : "否";
  }

  formatItemValue ( prop, values ) {
    const value = this.memberBenefits[ prop ]
    const item = values.filter( v => v.id === value )[ 0 ] || { name: '--' }
    return item.name
    // if ( prop == 'memberPrices' ) {
    //   const prices = ( this.memberPrices || [] ).reduce( ( total , curr ) => {
    //     const item = values.filter( v => v.id === curr )[0] || { name: ''}
    //     total.push( item.name )
    //     return total
    //   }, [] )
    //   return prices.join(',')
    // } else {
    //   const value = this.memberBenefits[ prop ]
    //   const item = values.filter( v => v.id === value )[0] || { name: '--'}
    //   return item.name
    // }
  }

  formatItemContact ( prop, value ) {
    if ( value === undefined ) {
      return ''
    }
    if ( prop === 'creditLine' || prop === 'cashBackRequire' ) {
      return `￥${value}`
    } else if ( prop === 'cashBackPoint' ) {
      return `${value}%`
    } else {
      return value
    }
  }

  formatSaveParam () {
    const memberBenefits = {}
    Object.keys( this.memberBenefits ).forEach( key => {
      const value = this.memberBenefits[ key ]
      const valueBak = this.memberBenefitsBak[ key ]
      if ( ![ 'couponList', 'memberPrices' ].includes( key ) && value !== valueBak ) {
        memberBenefits[ key ] = +value
      }
    } )

    return memberBenefits
  }

  saveMemberBenefit () {
    let param = this.formatSaveParam()

    // 沒有更新
    if ( Object.keys( param ).length === 0 ) return

    this.$http( API.saveMemberBenefits, {
      ...param,
      ...this.userInfo
    } ).then( res => {
      this.$notify( {
        type: 'success',
        message: '更新成功!'
      } )
    } ).catch( err => {
      this.memberBenefits = Object.assign( this.memberBenefits, this.memberBenefitsBak )
      this.$notify( {
        type: 'error',
        message: '更新失败!'
      } )
    } )
  }

  cancelMemberBenefit () {
    this.memberBenefits = this.memberBenefitsBak
    this.memberBenefitsBak = undefined
  }

  editMemberBenefit () {
    this.memberBenefitsBak = JSON.parse( JSON.stringify( this.memberBenefits ) )
    console.log( "editMemberBenefit", this.memberBenefitsBak );

  }

  showCouponList () {
    this.isShowCouponList = true
    this.couponList = this.memberBenefits.couponList
  }

  changeMemberPrices ( con ) {
    if ( con.prop === 'memberLevel' ) {
      const value = this.memberBenefits.memberLevel
      const type = con.options.filter( v => v.id === +value )[ 0 ] || {}
      this.memberPrices = [ type.price ]
    }
  }

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
    line-height 30px
  .el-input__inner
    height 28px
    padding 1px 10px
  .el-form-item
    margin-bottom 0
    padding 2px 0
    + .el-form-item
      border-top 1px solid #efefef
  .el-form-item__label
    padding 9px 12px 5px 0
  .el-select
    width 100%
  .el-button-group
    float right
  .href-style
    text-decoration underline
    cursor pointer
  .label
    color #48576a
  .input-text
    width 60px
  .input-select
    width 120px
</style>
