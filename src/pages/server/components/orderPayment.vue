<template>
  <div class="account-payment">
    <template v-if="hasPaymentMsg">
      <template v-if="offlineInfo.length > 0">
        <div class="account-item" v-for="item in offlineInfo" :key="item.id">
          <div class="account-item-title">
            <span>{{ formatTime(item.paymentDate) }}</span>
            <span>线下支付</span>
            <span>￥ {{ Number(item.paymentAmount).toFixed(2) }}</span>
          </div>
          <el-card>
            <p v-for="key in formatItems()" :key="key.prop">
              <span>{{ key.label }}：</span>
              <span v-if="key.prop === 'paymentType'">
                {{
                formatPaymentType(item.paymentMethod)
                }}
              </span>
              <span v-else>{{ item[key.prop] }}</span>
            </p>
          </el-card>
        </div>
      </template>
      <template v-if="onlineInfo.length > 0">
        <div class="account-item" v-for="item in onlineInfo" :key="item.id">
          <div class="account-item-title">
            <span>{{ formatTime(item.paymentDate) }}</span>
            <span>线上支付</span>
            <span>￥ {{ Number(item.paymentAmount).toFixed(2) }}</span>
          </div>
          <el-card>
            <p>
              <span>支付方式：</span>
              <span>{{ formatPaymentMethod(item.paymentMethod) }}</span>
            </p>
            <p>
              <span>子支付单号：</span>
              <span>{{ item.paymentNo }}</span>
            </p>
            <p>
              <span>交易流水号：</span>
              <span>{{ item.tradeSeqNo }}</span>
            </p>
          </el-card>
        </div>
      </template>
      <div class="account-footer" v-if="Number(unPayedMount) != '0'">
        <p>还剩余 ￥{{ unPayedMount }} 未支付</p>
      </div>
      <div class="account-footer" v-else>
        <p>已全部支付</p>
      </div>
    </template>
    <div v-else class="no-account-payment">暂无支付信息</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import { voucherTypes, paymentTypes, orderPaymentTypes } from '@/pages/server/const/paymentVoucherConst.ts'
import { matchArrItem } from "../../../utils";
import API from "../../../API";

@Component( {
  name: "order-payment",
  components: {}
} )
export default class orderPayment extends Vue {
  @Inject() formatMyDate;
  @Prop()
  orderSn: string;

  @Prop( { default: () => { } } )
  detail

  innerPayReasonObj = {
    innerPayReason: ""
  };
  confirmBtnDisabled: boolean = false;
  offlineInfo: any[] = [];
  onlineInfo: any = [];
  paidAmount: number = 0;
  showInnerPaymentDialog: boolean = false;

  get hasPaymentMsg () {
    return (
      this.offlineInfo.length > 0 || Object.keys( this.onlineInfo ).length > 0
    );
  }

  get unPayedMount () {
    let res = ( Number( this.detail.paymentAmount ) * 100 - Number( this.paidAmount ) * 100 ) / 100
    return res >= 0 ? res.toFixed( 2 ) : "0"
  }

  mounted () {

    this.getPaymentInfo();
  }

  getPaymentInfo () {
    this.$http( API.orderPaymentInfo, {
      orderSn: this.$route.params.sn || this.orderSn
    } ).then( ( { data } ) => {
      let d = data.data;
      this.offlineInfo = d.offlineInfo || [];
      this.onlineInfo = d.onlineInfo || [];
      this.paidAmount = d.paidAmount || 0;
    } );
  }

  formatItems () {
    return [
      { label: "支付方式", prop: "paymentType" },
      { label: "付款凭证编号", prop: "voucherNo" },
      { label: "商家流水号", prop: "bizSeqNo" }
    ];
  }

  formatTime ( obj: any = {} ) {
    return obj && this.formatMyDate( obj.time ) || "";
  }

  formatVoucherType ( type ) {
    let item = matchArrItem( type, voucherTypes, "id" );
    return item.name || "";
  }
  formatPaymentType ( type ) {
    let item = matchArrItem( type, paymentTypes, "id" );
    return item.name || "";
  }
  formatPaymentMethod ( method ) {
    let item = matchArrItem( method, orderPaymentTypes, "id" );
    return item.name || "";
  }
}
</script>

<style lang="stylus" scoped>
.account-item
  margin-bottom 20px
.account-item-title
  display flex
  align-items center
  margin-bottom 10px
  span
    display inline-block
    padding-right 15px
    &:last-child
      position absolute
      right 0
.account-footer
  p
    margin-bottom 10px
    text-align right
.no-account-payment
  margin-top 20px
  text-align center
</style>
