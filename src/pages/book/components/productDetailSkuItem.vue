<template>
  <div class="product-detail-sku-item">
    <el-row :gutter="30">
      <el-col :md="8" v-for="item in skuProps" :key="item.prop">
        <div class="item">
          <label>{{item.label}}:</label>
          <template v-if=" canEdit && item.edit">
            <template v-if="item.prop=='activityEndTime'">
              <el-date-picker v-model="sku[item.prop]" type="datetime" placeholder="选择日期时间"></el-date-picker>
            </template>
            <template v-else>
              <el-input type="text" v-model="sku[item.prop]"></el-input>
            </template>
          </template>
          <template v-else>
            <template v-if="item.prop=='activityEndTime'">
               <span>{{activityEndTime}}</span>
            </template>
            <span v-else>{{sku[item.prop]}}</span>
          </template>
        </div>
      </el-col>
    </el-row>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator'
import { skuProps } from '../const'
@Component( {
  name: 'product-detail-sku',
  components: {
  }
} )
export default class ProductDetailSpu extends Vue {
  @Prop( { type: Object, default: () => ( {} ) } ) sku
  @Inject() formatMyDate

  skuProps = skuProps
  canEdit: boolean = false

  get activityEndTime () {
    let endTime: any = this.sku.activityEndTime || {}
    let date = this.formatMyDate( endTime.time )
    return date || ''
  }


}
</script>
<style lang="stylus" scoped>
.el-col
  line-height 34px
  .item
    font-size 12px
    min-height 68px
    label
      display block
      font-weight bold
      font-size 14px
    span
      display block
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
.el-select
  width 100%
</style>
