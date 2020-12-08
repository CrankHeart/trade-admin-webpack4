<template>
  <lc-card title="直发订单信息">
    <div class="item-content">
      <div class="item">
        <div class="item-left">订单号：</div>
        <div class="item-right">{{memberOrder.orderSn}}</div>
      </div>
      <div class="item">
        <div class="item-left">下单时间：</div>
        <div
          class="item-right"
        >{{ typeof(memberOrder.createDate)==='object'?formatMyDate(memberOrder.createDate && memberOrder.createDate.time):memberOrder.createDate }}</div>
      </div>
      <div class="item">
        <div class="item-left">直发客户：</div>
        <div class="item-right">
          {{memberOrder.member}}
          <br />
          {{memberOrder.memberName}}
        </div>
      </div>
    </div>
    <div class="item">
      <div class="item-left">收货信息：</div>
      <div class="item-right">{{memberOrder.addressDetail}}</div>
    </div>
  </lc-card>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator'

@Component
export default class ProcurementMember extends Vue {
  @Prop()
  memberOrder: any
  @Inject()
  formatMyDate
}
</script>
<style lang="stylus" scoped>
.item-content{
  display flex
}
.item{
  flex 1
  padding 10px
  display flex
  vertical-align top 
  .item-left{
    vertical-align top 
    width 80px
  }
  .item-right{
    flex 1
  }
}
</style>