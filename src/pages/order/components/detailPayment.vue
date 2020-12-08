<template>
  <div class="order-detail-payment clearfix">
    <el-card :body-style="{border: '0'}">
      <h3>价格总计</h3>
    </el-card>

    <div class="el-table">
      <table class="el-table__body" style="width: 100%;">
        <tr>
          <td>
            <div class="cell"></div>
          </td>
          <td>
            <div class="cell">商品金额</div>
          </td>
          <td>
            <div class="cell">
              促销优惠
              <br />
              <span v-if="data.shoppingType === 1">订购单</span>
              <!-- <span v-else-if="data.promotionType == 5"> (未选)</span> -->
              <!-- <template v-else-if="data.promotionName">
                <span v-if="data.promotionName.length<14">{{data.promotionName}}</span>
                <template v-else>
                  <el-tooltip placement="bottom">
                    <div slot="content">{{data.promotionName}}</div>
                    <span>
                      <i class="el-icon-information"></i>
                      {{promotionType}}
                    </span>
                  </el-tooltip>
                </template>
              </template>-->
            </div>
          </td>
          <td>
            <div class="cell">券码优惠</div>
          </td>
          <td>
            <div class="cell">地推优惠</div>
          </td>
          <!-- <td>
            <div class="cell">店铺活动</div>
          </td>-->
          <td>
            <div class="cell"></div>
          </td>
          <td>
            <div class="cell"></div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="cell">商品合计</div>
          </td>
          <td>
            <div class="cell">{{ data.orderAmountString }}</div>
          </td>
          <td>
            <div class="cell">
              <!--促销优惠-->
              <!-- <span v-if="data.promotionType==5"> -0.00</span> -->
              <span>-{{ currency(data.discountAmount || 0, "¥", 2) }}</span>
            </div>
          </td>
          <td>
            <div class="cell">
              <!--券码优惠-->
              - {{ data.isStoreCoupon === 0 ? data.couponDiscountString : '0.00' }}
            </div>
          </td>
          <!--地推优惠-->
          <!-- 地推优惠不可编辑, 从BMS传值 -->
          <td>
            <div class="cell">
              {{- +data.groundDiscountString}}
              <!-- <el-input
                v-model="data.groundDiscountString"
                :disabled="true"
                size="small"
                @change="handlerChange"
                @blur="handlerBlur"
                :class="{ 'is-err': isErr }"
              ></el-input>-->
            </div>
          </td>
          <!--店铺活动-->
          <!-- <td>
            <div class="cell">
              <el-tooltip
                effect="light"
                :disabled="
                  data.affectedCouponActivityName &&
                  !data.affectedCouponActivityName.length
                "
                :content="data.affectedCouponActivityName"
                placement="bottom"
              >
                <span class="activity-item">{{ data.affectedCouponActivityName }}</span>
              </el-tooltip>
            </div>
          </td>-->
          <td>
            <div class="cell">=</div>
          </td>
          <td>
            <div class="cell">{{ currency(total, "¥", 2) }}</div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="cell">运费</div>
          </td>
          <td colspan="2">
            <div
              class="cell"
            >{{ currency( data.paymentFreight + (data.freightCouponAmount || 0) + (data.groundFreight || 0), "¥", 2 ) }}</div>
          </td>
          <td>
            <div class="cell">{{ currency(data.freightCouponAmount, "-", 2) }}</div>
          </td>
          <td>
            <div class="cell">
              <!-- 地推优惠运费 -->
              - {{(data.groundFreight || 0) | fixed2}}
            </div>
          </td>
          <td>
            <div class="cell">=</div>
          </td>
          <td>
            <div class="cell">{{ currency(data.paymentFreightString, "¥", 2) }}</div>
          </td>
        </tr>
        <tr>
          <td colspan="3">
            <div class="cell">平台活动</div>
          </td>
          <td colspan="2">
            <div
              class="cell"
            >{{ data.isStoreCoupon === 1 ? currency( data.platformActivityDiscount, "-", 2 ) : currency( 0.00, "-", 2 ) }}</div>
          </td>
          <td>
            <div class="cell">=</div>
          </td>
          <td>
            <div
              class="cell"
            >{{ data.isStoreCoupon === 1 ? currency( data.platformActivityDiscount, "-", 2 ) : currency( 0.00, "-", 2 ) }}</div>
          </td>
        </tr>
        <tr>
          <td colspan="6">
            <div class="cell">合计</div>
          </td>
          <td>
            <div class="cell">{{ currency(orderTotalAmount, "¥", 2) }}</div>
          </td>
        </tr>
      </table>
    </div>
    <div class="price-infor pull-right">
      <p>
        <span class="label">订单总额</span>
        <span>{{ currency(orderTotalAmount, "¥", 2) }}</span>
      </p>
      <p>
        <span class="label">
          积分抵扣
          <i>{{data.point}}积分</i>
        </span>
        <span>{{currency(data.pointDiscount, "-", 2)}}</span>
      </p>
      <p>
        <span class="label">代金券</span>
        <span>{{currency(data.voucherCouponAmount, "-", 2)}}</span>
      </p>
      <p>
        <span class="label">应付总额</span>
        <span>{{ currency(data.paymentAmount, "¥", 2) }}</span>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Inject, Prop } from "vue-property-decorator";
import API from "../../../API";
import { State, Action } from "vuex-class";
// import { types } from '../../promotion/const/'
@Component( {
  name: "orde-detail-payment",
  components: {},
} )
export default class OrderDetailPayment extends Vue {
  @Prop( { default: () => ( {} ) } ) data: any
  isErr: boolean = false
  activated () {
    this.isErr = false
  }
  // get promotionType () {

  //   let i = 0, l = types.length
  //   let promotionType = this.data.promotionType
  //   for ( ; i < l; i++ ) {
  //     let type = types[ i ]
  //     if ( type.id !== '' && +type.id == promotionType ) {
  //       return type.name
  //     }
  //   }
  //   return '未知的促销类型'
  // }
  get orderTotalAmount () {
    const { paymentAmount, pointDiscount, voucherCouponAmount } = this.data
    return paymentAmount + pointDiscount + voucherCouponAmount
  }
  get total () {
    const {
      orderAmountString = 0,
      discountAmount = 0,
      isStoreCoupon,
      couponDiscount = 0,
      groundDiscount = 0
    } = this.data;
    return (
      +orderAmountString * 100 -
      +discountAmount * 100 -
      ( isStoreCoupon === 0 ? +couponDiscount : 0 ) * 100 -
      +groundDiscount * 100
    ) / 100
  }
  handlerChange ( v: string ) {
    if ( +v < 0 ) {
      this.isErr = true;
    } else if (
      +v >
      ( +this.data.orderTotalAmountString * 100 -
        ( +this.data.discountTotalAmountString || 0 ) * 100 ) /
      100
    ) {
      this.isErr = true;
    } else {
      this.isErr = false;
      this.data.groundDiscountString = Number( v );
    }
    this.$emit( "payment-change", this.isErr );
  }
  handlerBlur () {
    if ( !this.isErr ) {
      this.data.groundDiscountString = Number(
        this.data.groundDiscountString
      ).toFixed( 2 );
    }
  }
  currency ( v, type, len ) {
    return ( type ? type + " " : "" ) + Number( v || 0 ).toFixed( len || 2 );
  }
}
</script>
<style lang="stylus">
.order-detail-payment {
  .el-input--small.is-err {
    input {
      border-color: red;
    }
  }

  .activity-item {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-over: ellipsis;
  }

  .price-infor {
    width: 260px;
    margin-top: 18px;
    padding-right: 10px;

    p {
      font-size: 14px;
      line-height: 1.8;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .label {
        font-weight: bold;

        i {
          font-style: normal;
          font-weight: normal;
          color: #797979;
        }
      }
    }
  }
}
</style>
